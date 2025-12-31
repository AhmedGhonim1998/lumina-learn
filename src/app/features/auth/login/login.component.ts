import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
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
  returnUrl = '/';

  constructor(
    private auth: Auth, 
    private firestore: Firestore, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // بنشوف هو كان رايح فين قبل ما يجيلنا هنا (زي /dashboard)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  async onLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;

      // نجيب بياناته من Firestore
      const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
      const role = userDoc.data()?.['role'];

      if (this.returnUrl === '/dashboard') {
        // لو هو رايح للداشبورد لازم نتأكد إنه أدمن
        if (role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'عفواً، هذا الحساب ليس أدمن.';
          await this.auth.signOut();
        }
      } else {
        // لو داخل عادي يروح للهوم
        this.router.navigate(['/']);
      }
    } catch (error) {
      this.errorMessage = 'بيانات الدخول غير صحيحة';
    } finally {
      this.isLoading = false;
    }
  }
}