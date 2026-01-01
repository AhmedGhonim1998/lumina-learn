import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth, onAuthStateChanged, signOut, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc, collection, collectionData } from '@angular/fire/firestore';
import { Observable, of, switchMap, map } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isLoggedIn = false;
  userRole: string | null = null;
  
  // المتغير الجديد لمراقبة عدد عناصر السلة
  cartCount$: Observable<number> = of(0);

  constructor(
    private auth: Auth, 
    private firestore: Firestore,
    private router: Router
  ) {}

  ngOnInit() {
    // 1. مراقبة حالة المستخدم والأدوار (Role)
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.isLoggedIn = true;
        const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
        if (userDoc.exists()) {
          this.userRole = userDoc.data()['role'];
        }
      } else {
        this.isLoggedIn = false;
        this.userRole = null;
      }
    });

    // 2. مراقبة عدد الكورسات في السلة لحظياً
    this.cartCount$ = authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          // بنروح للمسار: users -> UID -> cart
          const cartRef = collection(this.firestore, `users/${user.uid}/cart`);
          // نرجع طول المصفوفة (عدد الكورسات)
          return collectionData(cartRef).pipe(
            map(items => items ? items.length : 0)
          );
        } else {
          return of(0); // لو مش مسجل دخول العدد صفر
        }
      })
    );
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
    this.isMenuOpen = false;
  }
}