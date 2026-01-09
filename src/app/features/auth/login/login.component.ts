import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Auth, 
  signInWithEmailAndPassword, 
  signOut, 
  setPersistence, 
  browserSessionPersistence, // للحفظ المؤقت (جلسة واحدة)
  browserLocalPersistence} from '@angular/fire/auth';
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
  // فحص شكل الفورم فقط (للتصميم)
  this.isDashboardLogin = this.router.url.includes('admin');

  // ميزة الخروج التلقائي للأدمن عند "قفل المتصفح" أو "الخروج من الموقع"
  this.auth.onAuthStateChanged(async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
      const role = userDoc.data()?.['role'];
      
      // إذا كان أدمن، نخليه Session Persistence (يخرج بقفل الصفحة)
      if (role === 'admin') {
         // دي بتخلي المتصفح يمسح التوكن أول ما الـ Tab تتقفل
         await this.auth.setPersistence(browserSessionPersistence);
      }
    }
  });
}

 async onLogin() {
  this.isLoading = true;
  this.errorMessage = '';

  try {
    const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
    const user = userCredential.user;

    // جلب الـ Role من Firestore
    const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
    const role = userDoc.data()?.['role'];

    // --- المنطق الصارم الجديد ---
    if (this.isDashboardLogin) {
      // لو هو في صفحة الـ Admin السوداء
      if (role === 'admin') {
        window.location.href = '/dashboard'; // أدمن حقيقي، دخله
      } else {
        // طالب بيحاول يدخل من بوابة الإدارة!
        this.errorMessage = '⚠️ This portal is for Administrators only.';
        await signOut(this.auth); // سجل خروجه فوراً عشان ميفضلشLoggedIn كطالب
        return; 
      }
    } else {
      // لو هو في صفحة الـ Login البيضاء العادية
      if (role === 'admin') {
        // اختياري: لو الأدمن دخل من صفحة الطلاب، وديه برضه للداشبورد
        window.location.href = '/dashboard';
      } else {
        this.router.navigate(['/']); // طالب عادي، وديه للهوم
      }
    }

  } catch (error) {
    this.errorMessage = 'Invalid email or password';
  } finally {
    this.isLoading = false;
  }
}

// دالة الخروج الكلي لتنظيف الـ State تماماً
async forceFullLogout() {
  await signOut(this.auth); // مسح السيشن من فايربيز
  this.email = '';
  this.password = '';
  // توجيه لصفحة اللوجين العادية لضمان إعادة بناء الواجهة (Navbar/Profile)
  this.router.navigate(['/login'], { queryParams: { loggedOut: true } });
}
}