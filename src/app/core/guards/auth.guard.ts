import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

export const adminGuard = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const firestore = inject(Firestore);

  const user = auth.currentUser;

  // 1. هل فيه يوزر مسجل أصلاً؟
  if (!user) {
    router.navigate(['/login'], { queryParams: { returnUrl: '/dashboard' } });
    return false;
  }

  // 2. هل اليوزر ده أدمن في قاعدة البيانات؟
  const userDoc = await getDoc(doc(firestore, 'users', user.uid));
  const role = userDoc.data()?.['role'];

  if (role === 'admin') {
    return true; // أدمن، اتفضل ادخل
  } else {
    // يوزر عادي بيحاول يدخل، ارجع للهوم
    router.navigate(['/']);
    return false;
  }
};