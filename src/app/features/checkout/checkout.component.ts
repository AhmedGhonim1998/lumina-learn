import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private http = inject(HttpClient); // تأكد من إضافة HttpClientProvider في app.config

  courseId: string | null = null;
  course: any = null;
  isProcessing = false;

  cardInfo = {
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  };

  async ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id');
    
    if (this.courseId && this.courseId !== 'cart') {
      const courseRef = doc(this.firestore, `courses/${this.courseId}`);
      const snap = await getDoc(courseRef);
      if (snap.exists()) {
        this.course = snap.data();
      }
    }
  }

  async handlePayment() {
    const user = this.auth.currentUser;
    if (!user) {
      alert('Please login first');
      return;
    }

    if (!this.course && this.courseId !== 'cart') {
      alert('Course data not loaded yet');
      return;
    }

    this.isProcessing = true;

    // 1. طلب الـ Token الأساسي
    const authData = { "api_key": "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFeU1qa3dPU3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5zZGVoQURxM0d0YTN0UlQ5RWVkMVV6VlVQb2ctSWZoWnBGRjJQVzlMdTl5b0tXd3dzWThGQnRXQ3F4T2ZxT0xNM2tlUDBiM2pXTi0wTnFONmhza19Ddw==" };
    
    this.http.post<any>('https://accept.paymob.com/api/auth/tokens', authData).subscribe({
      next: (res1) => {
        const authToken = res1.token;

        // 2. تسجيل الطلب (نستخدم سعر الكورس المتاح)
        const amount = this.course ? this.course.price : 100; // قيمة افتراضية لو سلة
        const orderData = {
          "auth_token": authToken,
          "delivery_needed": "false",
          "amount_cents": (amount * 100).toString(),
          "currency": "EGP",
          "items": []
        };

        this.http.post<any>('https://accept.paymob.com/api/ecommerce/orders', orderData).subscribe({
          next: (res2) => {
            const orderId = res2.id;

            // 3. طلب مفتاح الدفع
            const paymentKeyData = {
              "auth_token": authToken,
              "amount_cents": (amount * 100).toString(),
              "expiration": 3600,
              "order_id": orderId,
              "billing_data": {
                "apartment": "NA", "email": user.email || "test@test.com", "floor": "NA", 
                "first_name": user.displayName || "Guest", "street": "NA", "building": "NA", 
                "phone_number": "01012345678", "shipping_method": "NA", 
                "postal_code": "NA", "city": "NA", "country": "NA", "last_name": "User", "state": "NA"
              },
              "currency": "EGP",
              "integration_id": 5470857
            };

            this.http.post<any>('https://accept.paymob.com/api/accept/payment_keys', paymentKeyData).subscribe({
              next: (res3) => {
                const finalToken = res3.token;
                // 4. التوجيه لصفحة Paymob
                window.location.href = `https://accept.paymob.com/api/accept/payments/visacard/activated.html?has_parent_fp=false&payment_token=${finalToken}`;
              },
              error: (err) => this.handleError(err)
            });
          },
          error: (err) => this.handleError(err)
        });
      },
      error: (err) => this.handleError(err)
    });
  }

  private handleError(err: any) {
    this.isProcessing = false;
    console.error("Paymob Error:", err);
    alert("حدث خطأ في الاتصال ببوابة الدفع. تأكد من إيقاف الـ CORS.");
  }

  formatExpiry(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 2) {
      input = input.substring(0, 2) + '/' + input.substring(2, 4);
    }
    this.cardInfo.expiry = input;
    event.target.value = input;
  }
}