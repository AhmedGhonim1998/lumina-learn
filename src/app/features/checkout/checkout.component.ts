import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // ضيفنا RouterModule
import { 
  Firestore, 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  writeBatch 
} from '@angular/fire/firestore'; // تأكد من وجود getDocs و writeBatch هنا
import { Auth } from '@angular/fire/auth';
import confetti from 'canvas-confetti'; // تأكد إنك عملت npm install canvas-confetti

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
    
    // لو بنشتري كورس واحد بس (مش من السلة)
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

    this.isProcessing = true;

    setTimeout(async () => {
      try {
        const cartRef = collection(this.firestore, `users/${user.uid}/cart`);
        const cartSnapshot = await getDocs(cartRef);

        const batch = writeBatch(this.firestore);

        if (!cartSnapshot.empty) {
          // حالة الشراء من السلة
          cartSnapshot.forEach((docSnapshot) => {
            const courseData = docSnapshot.data();
            const cId = courseData['id'] || docSnapshot.id; // الوصول للاسم بين قوسين

            const enrolledRef = doc(this.firestore, `users/${user.uid}/enrolledCourses`, cId);
            batch.set(enrolledRef, {
              ...courseData,
              purchaseDate: new Date().toISOString(),
              status: 'active'
            });

            batch.delete(docSnapshot.ref);
          });
        } else if (this.courseId && this.course) {
          // حالة شراء كورس واحد مباشر
          const enrolledRef = doc(this.firestore, `users/${user.uid}/enrolledCourses`, this.courseId);
          batch.set(enrolledRef, {
            ...this.course,
            courseId: this.courseId,
            purchaseDate: new Date().toISOString(),
            status: 'active'
          });
        }

        await batch.commit();

        this.isProcessing = false;
        
        // تأثير الاحتفال
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });

        alert('🎉 Payment Successful!');
        this.router.navigate(['/my-courses']);

      } catch (error) {
        this.isProcessing = false;
        console.error('Checkout failed:', error);
        alert('Payment failed, please try again.');
      }
    }, 2000);
  }

  formatExpiry(event: any) {
  let input = event.target.value;
  
  // 1. مسح أي حاجة مش أرقام
  input = input.replace(/\D/g, '');

  // 2. إضافة السلاش بعد أول رقمين (الشهر)
  if (input.length > 2) {
    input = input.substring(0, 2) + '/' + input.substring(2, 4);
  }

  // 3. تحديث القيمة في الـ Model والـ Input
  this.cardInfo.expiry = input;
  event.target.value = input;
}
}