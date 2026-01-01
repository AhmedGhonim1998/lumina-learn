import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

export const authUserGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // بنراقب حالة المستخدم (هل هو مسجل دخول أم لا)
  return authState(auth).pipe(
    take(1), // بناخد أول قيمة بس ونقفل الـ Stream
    map(user => {
      if (user) {
        // لو اليوزر موجود (مسجل دخول)، اسمح له يدخل
        return true;
      } else {
        // لو مش مسجل، ابعته لصفحة الـ Login
        return router.createUrlTree(['/login']);
      }
    })
  );
};