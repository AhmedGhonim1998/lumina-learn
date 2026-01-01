import { Component, OnInit, inject } from '@angular/core'; // ضفنا inject
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-player.component.html',
  styleUrls: ['./course-player.component.css']
})
export class CoursePlayerComponent implements OnInit {
  // استخدام inject مباشرة بيحل مشكلة الـ Context
  private firestore = inject(Firestore);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  courseId: string | null = null;
  lessons$: Observable<any[]> = of([]); // قيمة افتراضية مصفوفة فاضية
  currentVideoUrl: SafeResourceUrl | null = null;
  activeLessonTitle: string = '';

  ngOnInit() {
    // 1. بناخد الـ ID من المسار
    this.courseId = this.route.snapshot.paramMap.get('id');
    
    console.log('Course ID:', this.courseId);

    if (this.courseId) {
      // 2. تحديد المسار (تأكد إنه مطابق للصورة courses -> id -> lessons)
      const lessonsRef = collection(this.firestore, `courses/${this.courseId}/lessons`);
      
      // 3. جلب البيانات
      this.lessons$ = collectionData(lessonsRef, { idField: 'id' });

      // 4. الاشتراك في البيانات لتشغيل أول فيديو
      this.lessons$.subscribe({
        next: (lessons) => {
          console.log('Lessons found:', lessons);
          if (lessons.length > 0 && !this.currentVideoUrl) {
            this.selectLesson(lessons[0]);
          }
        },
        error: (err) => console.error('Firestore Error:', err)
      });
    }
  }

  selectLesson(lesson: any) {
    this.activeLessonTitle = lesson.title;
    this.currentVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(lesson.videoUrl);
  }
}