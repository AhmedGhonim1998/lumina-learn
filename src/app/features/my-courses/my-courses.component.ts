import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, getDocs, writeBatch } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, switchMap, take } from 'rxjs';
import { RouterModule, ActivatedRoute } from '@angular/router'; // أضفنا ActivatedRoute

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-courses.component.html'
})
export class MyCoursesComponent implements OnInit {
  enrolledCourses$: Observable<any[]> | undefined;
  private route = inject(ActivatedRoute); // لقراءة بيانات Paymob من الرابط
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  ngOnInit() {
    // 1. عرض الكورسات الحالية
    this.enrolledCourses$ = authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          const enrolledRef = collection(this.firestore, `users/${user.uid}/enrolledCourses`);
          return collectionData(enrolledRef, { idField: 'id' });
        } else {
          return of([]);
        }
      })
    );

    // 2. التحقق من نجاح عملية الدفع فور العودة من Paymob
    this.checkPaymentStatus();
  }

  private checkPaymentStatus() {
    this.route.queryParams.pipe(take(1)).subscribe(async params => {
      // التأكد من أن الدفع تم بنجاح حسب بارامترات Paymob
      if (params['success'] === 'true' && params['pending'] === 'false') {
        const user = this.auth.currentUser;
        if (user) {
          await this.completeEnrollment(user.uid);
        }
      }
    });
  }

  private async completeEnrollment(userId: string) {
    try {
      // هنا نقوم بنقل الكورسات من السلة إلى enrolledCourses
      // أو تفعيل الكورس الذي تم شراؤه للتو
      const cartRef = collection(this.firestore, `users/${userId}/cart`);
      const cartSnap = await getDocs(cartRef);
      
      const batch = writeBatch(this.firestore);

      if (!cartSnap.empty) {
        cartSnap.forEach((courseDoc) => {
          const data = courseDoc.data();
          const enrolledRef = doc(this.firestore, `users/${userId}/enrolledCourses`, courseDoc.id);
          
          batch.set(enrolledRef, {
            ...data,
            purchaseDate: new Date().toISOString(),
            status: 'active'
          });
          
          batch.delete(courseDoc.ref); // مسح من السلة بعد النجاح
        });

        await batch.commit();
        alert('تم تفعيل الكورس بنجاح! مشاهدة ممتعة.');
      }
    } catch (error) {
      console.error("Error activating course:", error);
    }
  }
}