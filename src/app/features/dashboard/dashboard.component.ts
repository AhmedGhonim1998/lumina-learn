import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // استيراد مهم جداً
import { CourseService } from '../../core/services/course.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule], // تأكد من إضافة FormsModule هنا
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  courses$: Observable<any[]> | undefined;
  
  // متغيرات لتخزين بيانات الدرس الجديد بشكل مؤقت
  newLesson = { title: '', videoUrl: '', order: 1 };
  selectedCourseId: string | null = null; // لمعرفة أي كورس نعدل عليه الآن

  constructor(private courseService: CourseService, private router: Router, private firestore: Firestore) {}

  ngOnInit() {
    this.courses$ = this.courseService.getCourses();
  }

  // دالة ذكية لتحويل لينكات يوتيوب العادية لـ Embed تلقائياً
  private formatVideoUrl(url: string): string {
    if (url.includes('watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    return url;
  }

  async submitLesson(courseId: string) {
    if (!this.newLesson.title || !this.newLesson.videoUrl) {
      alert('Please fill in all fields!');
      return;
    }

    const lessonData = {
      ...this.newLesson,
      videoUrl: this.formatVideoUrl(this.newLesson.videoUrl),
      createdAt: new Date().toISOString()
    };

    try {
      const lessonsRef = collection(this.firestore, `courses/${courseId}/lessons`);
      await addDoc(lessonsRef, lessonData);
      alert('Lesson added successfully! 🎉');
      this.resetForm();
    } catch (error) {
      console.error('Error adding lesson:', error);
    }
  }

  resetForm() {
    this.newLesson = { title: '', videoUrl: '', order: 1 };
    this.selectedCourseId = null;
  }

  // الدوال السابقة (Delete, View, etc.) تظل كما هي
  goToAddCourse() { this.router.navigate(['/add-course']); }
  viewCourse(id: string) { this.router.navigate(['/course', id]); }
  
  async deleteCourse(id: string) {
    if (confirm('Are you sure?')) {
      await this.courseService.deleteCourse(id);
    }
  }
}