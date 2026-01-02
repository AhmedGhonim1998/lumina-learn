import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  
  // هذا المتغير سيحدد شكل الفورم بناءً على الرابط
  isDashboardLogin = false; 

  constructor(
    private auth: Auth, 
    private firestore: Firestore, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // فحص الرابط الحالي: لو الرابط يحتوي على 'admin-login' أو تم توجيهه من الداشبورد
    const currentUrl = this.router.url;
    if (currentUrl.includes('admin') || this.route.snapshot.queryParams['returnUrl']?.includes('dashboard')) {
      this.isDashboardLogin = true;
    }
  }

  async onLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
      const role = userDoc.data()?.['role'];

      if (this.isDashboardLogin) {
        // إذا كان يحاول الدخول من صفحة الإدارة
        if (role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = '⚠️ خطأ: هذا الحساب ليس لديه صلاحيات مدير النظام.';
          await signOut(this.auth);
        }
      } else {
        // دخول الطالب العادي
        this.router.navigate(['/']);
      }
    } catch (error) {
      this.errorMessage = 'بيانات الدخول غير صحيحة';
    } finally {
      this.isLoading = false;
    }
  }
}