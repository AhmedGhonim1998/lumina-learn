import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

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

  constructor(
    private auth: Auth, 
    private firestore: Firestore,
    private router: Router
  ) {}

  ngOnInit() {
    // مراقبة حالة المستخدم لحظياً
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.isLoggedIn = true;
        // جلب الدور (Role) من Firestore
        const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
        if (userDoc.exists()) {
          this.userRole = userDoc.data()['role'];
        }
      } else {
        this.isLoggedIn = false;
        this.userRole = null;
      }
    });
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