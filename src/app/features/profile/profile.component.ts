import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, doc, deleteDoc, writeBatch, getDocs } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  cartItems$: Observable<any[]> | undefined;
  userEmail: string | null = '';
  totalPrice: number = 0;
  userName: string = '';

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {}

 ngOnInit() {
  // مراقبة حالة المستخدم وجلب سلته
  this.cartItems$ = authState(this.auth).pipe(
    switchMap(user => {
      if (user) {
        this.userEmail = user.email;

        // --- المنطق الجديد لاستخراج الاسم ---
        if (user.email) {
          const namePart = user.email.split('@')[0]; // بيقص اللي قبل الـ @
          this.userName = namePart.charAt(0).toUpperCase() + namePart.slice(1); // بيخلي أول حرف كبير
        }
        // ----------------------------------

        // جلب بيانات السلة من المسار: users -> {UID} -> cart
        const cartRef = collection(this.firestore, `users/${user.uid}/cart`);
        return collectionData(cartRef, { idField: 'id' });
      } else {
        return of([]);
      }
    })
  );

  // حساب إجمالي السعر تلقائياً
  this.cartItems$.subscribe(items => {
    this.totalPrice = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  });
}
  async removeFromCart(courseId: string) {
    try {
      const user = this.auth.currentUser;
      if (user) {
        const itemDocRef = doc(this.firestore, `users/${user.uid}/cart`, courseId);
        await deleteDoc(itemDocRef);
        console.log('Item removed');
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }


async checkout() {
  // بننقل اليوزر لصفحة الـ checkout وبنبعت له كلمة 'cart' كـ ID
  // عشان نعرف صفحة الدفع إننا بنشتري السلة كلها مش كورس واحد
  this.router.navigate(['/checkout', 'cart']);
}
}