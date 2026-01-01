import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { doc, setDoc } from '@angular/fire/firestore';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-course-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-catalog.component.html'
})
export class CourseCatalogComponent implements OnInit {
  courses$: Observable<any[]> | undefined;

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    // جلب الكورسات مع التأكد من أخذ الـ ID الخاص بكل Document
    const coursesCollection = collection(this.firestore, 'courses');
    this.courses$ = collectionData(coursesCollection, { idField: 'id' });
  }

  async addToCart(course: any) {
    try {
      const user = this.auth.currentUser;

      if (!user) {
        alert('Please login first to add courses to your cart!');
        this.router.navigate(['/login']);
        return;
      }

      if (!course.id) {
        console.error('Course ID is missing!');
        return;
      }

      // تحديد مسار السلة: users -> {UID} -> cart -> {CourseID}
      const cartDocRef = doc(this.firestore, `users/${user.uid}/cart`, course.id);

      await setDoc(cartDocRef, {
        courseId: course.id,
        title: course.title,
        price: course.price,
        imageUrl: course.imageUrl || 'https://via.placeholder.com/300x200',
        addedAt: new Date().toISOString()
      });

      alert(`✅ ${course.title} added to your cart!`);

    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Could not add to cart. Please try again.');
    }
  }
}