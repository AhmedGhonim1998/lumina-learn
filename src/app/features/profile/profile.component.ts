import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, doc, deleteDoc } from '@angular/fire/firestore';
import { Auth, authState, updateProfile, updatePassword  , signOut} from '@angular/fire/auth'; // ضفنا التحديثات
import { Observable, of, switchMap } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // مهم عشان الـ Input


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  cartItems$: Observable<any[]> | undefined;
  userEmail: string | null = '';
  userName: string = '';
  userPhoto: string = '';
  newPassword: string = '';
  totalPrice: number = 0;
  isEditing: boolean = false;

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {}


  ngOnInit() {
    this.cartItems$ = authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          this.userEmail = user.email;
          this.userName = user.displayName || user.email?.split('@')[0] || '';
          this.userPhoto = user.photoURL || '';
          
          const cartRef = collection(this.firestore, `users/${user.uid}/cart`);
          return collectionData(cartRef, { idField: 'id' });
        }
        return of([]);
      })
    );

    this.cartItems$?.subscribe(items => {
      this.totalPrice = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    });
  }

  
  // دالة تحديث الاسم والصورة
  startEditing() {
    this.isEditing = true;
  }

  // دالة لإلغاء التعديل والرجوع للبروفايل
  cancelEditing() {
    this.isEditing = false;
  }

  // تحديث الدالة دي عشان تقفل الفورم بعد الحفظ
  async updateUserInfo() {
    try {
      const user = this.auth.currentUser;
      if (user) {
        await updateProfile(user, {
          displayName: this.userName,
          photoURL: this.userPhoto
        });
        this.isEditing = false; // رجوع تلقائي للبروفايل بعد النجاح
        alert('Profile Updated! ✅');
      }
    } catch (error: any) {
      alert(error.message);
    }
  }

  // دالة تحديث الباسورد
  async changePassword() {
  try {
    const user = this.auth.currentUser;
    
    if (user && this.newPassword.length >= 6) {
      // 1. تحديث الباسورد في Firebase Auth
      await updatePassword(user, this.newPassword);
      
      alert('Password updated successfully! You will be logged out to sign in with your new password. 🔐');

      // 2. تسجيل الخروج
      await signOut(this.auth);

      // 3. التوجه لصفحة اللوجين
      this.router.navigate(['/login']);
    } else {
      alert('Please enter a password with at least 6 characters.');
    }
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      alert('Security Note: Please log out and log back in again before changing your password.');
    } else {
      alert('Error: ' + error.message);
    }
  }
}

  async removeFromCart(courseId: string) {
    const user = this.auth.currentUser;
    if (user) {
      await deleteDoc(doc(this.firestore, `users/${user.uid}/cart`, courseId));
    }
  }

  async checkout() {
    this.router.navigate(['/checkout', 'cart']);
  }
}