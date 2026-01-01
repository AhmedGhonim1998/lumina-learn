import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      // أضفنا Validators.pattern للتأكد من قبول النقطة وأي صيغة إيميل معقدة
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator }); // ربط التحقق من تطابق الباسورد
  }

  // دالة التأكد إن الباسوردين متطابقين
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { passwordMismatch: true } 
      : null;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      // استخدام trim() للتخلص من أي مسافات زائدة في الإيميل بتبوظ الـ Firebase
      const email = this.registerForm.value.email.trim();
      const password = this.registerForm.value.password;
      
      try {
        await createUserWithEmailAndPassword(this.auth, email, password);
        alert('🎉 Account Created Successfully!');
        this.router.navigate(['/dashboard']); // وديه الداشبورد علطول طالما سجل
      } catch (error: any) {
        // ترجمة رسائل الخطأ الشائعة من فايربيز
        if (error.code === 'auth/email-already-in-use') alert('الإيميل ده مستخدم قبل كدة!');
        else if (error.code === 'auth/invalid-email') alert('صيغة الإيميل غير صحيحة!');
        else alert(error.message);
      }
    }
  }
}