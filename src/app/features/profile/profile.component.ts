import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, doc, deleteDoc, writeBatch, getDocs } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, switchMap } from 'rxjs';

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

  constructor(private auth: Auth, private firestore: Firestore) {}

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
  const user = this.auth.currentUser;
  if (!user) return;

  try {
    // 1. الحصول على كل العناصر الموجودة في السلة حالياً
    const cartRef = collection(this.firestore, `users/${user.uid}/cart`);
    const cartSnapshot = await getDocs(cartRef);

    if (cartSnapshot.empty) {
      alert('Your cart is empty!');
      return;
    }

    // 2. استخدام "Batch" عشان ننفذ كل العمليات مرة واحدة (أسرع وأضمن)
    const batch = writeBatch(this.firestore);

    cartSnapshot.forEach((docSnapshot) => {
      const courseData = docSnapshot.data();
      const courseId = docSnapshot.id;

      // أ- إضافة الكورس لكوليكشن "enrolledCourses"
      const enrolledRef = doc(this.firestore, `users/${user.uid}/enrolledCourses`, courseId);
      batch.set(enrolledRef, {
        ...courseData,
        purchaseDate: new Date().toISOString()
      });

      // ب- مسح الكورس من السلة
      batch.delete(docSnapshot.ref);
    });

    // 3. تنفيذ العمليات
    await batch.commit();

    alert('🎉 Congratulations! You are now enrolled in these courses.');
    // ممكن تنقله لصفحة الكورسات المشتراه هنا
    // this.router.navigate(['/my-courses']);

  } catch (error) {
    console.error('Checkout failed:', error);
    alert('Something went wrong during checkout.');
  }
}
}