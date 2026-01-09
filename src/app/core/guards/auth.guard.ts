import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth'; // أضفنا authState
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs'; // عشان نحول الـ Observable لـ Promise

export const adminGuard = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const firestore = inject(Firestore);

  // 1. الانتظار حتى يرد Firebase بحالة المستخدم (سواء موجود أو لا)
  const user = await firstValueFrom(authState(auth));

  if (!user) {
  // بنبعته للوجين وبنقوله إن ده admin-flow
  router.navigate(['/login'], { queryParams: { type: 'admin' } });
  return false;
}

  // 2. جلب بيانات الدور من Firestore
  try {
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    const role = userDoc.data()?.['role'];

    if (role === 'admin') {
      return true; // أدمن فعلاً، افتح الـ Dashboard
    } else {
      // لو طالب، رجعه للرئيسية
      router.navigate(['/']);
      return false;
    }
  } catch (error) {
    console.error("Guard Error:", error);
    router.navigate(['/login']);
    return false;
  }
};