import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-course.component.html'
})
export class AddCourseComponent {
  // كائن لتخزين بيانات الفورم
  course = {
    title: '',
    instructor: '',
    price: 0,
    imageUrl: ''
  };

  constructor(private firestore: Firestore, private router: Router) {}

  async onSave() {
    try {
      const coursesRef = collection(this.firestore, 'courses');
      // إضافة البيانات لـ Firebase
      await addDoc(coursesRef, this.course);
      alert('Course Added Successfully!');
      this.router.navigate(['/dashboard']); // يرجع للـ Dashboard يشوف الكورس الجديد
    } catch (error) {
      console.error('Error adding course: ', error);
    }
  }
}