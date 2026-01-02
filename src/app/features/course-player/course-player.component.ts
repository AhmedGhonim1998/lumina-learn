import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Firestore, collection, collectionData, doc, getDoc, setDoc, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth'; // ضفنا Auth
import { map, Observable, of } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FilterLessonsPipe],
  templateUrl: './course-player.component.html',
  styleUrls: ['./course-player.component.css']
})
export class CoursePlayerComponent implements OnInit {
  private firestore = inject(Firestore);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private auth = inject(Auth); // حقن خدمة الـ Auth

  courseId: string | null = null;
  lessons$: Observable<any[]> = of([]);
  currentVideoUrl: SafeResourceUrl | null = null;
  activeLessonTitle: string = '';
  
  // متغيرات لمتابعة التقدم
  watchedLessons: string[] = []; // قائمة الـ IDs للدروس اللي اتكفت
  lastLessonId: string = '';    // آخر درس وقف عنده
  searchQuery: string = '';

  async ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id');

    if (this.courseId) {
      // 1. جلب دروس الكورس الأساسية
      const lessonsRef = collection(this.firestore, `courses/${this.courseId}/lessons`);
      this.lessons$ = collectionData(lessonsRef, { idField: 'id' });

      // 2. جلب بيانات التقدم (Watched List) الخاصة باليوزر
      await this.loadUserProgress();

      // 3. الاشتراك لتشغيل الفيديو (إما أول درس أو آخر درس وقف عنده)
      this.lessons$.subscribe((lessons) => {
        if (lessons.length > 0 && !this.currentVideoUrl) {
          // لو فيه درس مسجل إنه آخر درس، افتحه، وإلا افتح أول درس
          const resumeLesson = lessons.find(l => l.id === this.lastLessonId) || lessons[0];
          this.selectLesson(resumeLesson);
        }
      });
    }
  }

  // دالة لجلب التقدم من المسار اللي في الصور
  async loadUserProgress() {
    const user = this.auth.currentUser;
    if (user && this.courseId) {
      const progressRef = doc(this.firestore, `users/${user.uid}/enrolledCourses/${this.courseId}`);
      const snap = await getDoc(progressRef);
      
      if (snap.exists()) {
        const data = snap.data();
        this.watchedLessons = data['watchedLessons'] || [];
        this.lastLessonId = data['lastWatchedLessonId'] || '';
      }
    }
  }

  // عند اختيار درس
  async selectLesson(lesson: any) {
    this.activeLessonTitle = lesson.title;
    this.currentVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(lesson.videoUrl);
    
    // تحديث التقدم في Firestore
    const user = this.auth.currentUser;
    if (user && this.courseId) {
      const progressRef = doc(this.firestore, `users/${user.uid}/enrolledCourses/${this.courseId}`);
      
      await setDoc(progressRef, {
        watchedLessons: arrayUnion(lesson.id), // يضيفه للـ Watched List
        lastWatchedLessonId: lesson.id,        // يحفظ إنه ده آخر مكان
        lastAccessed: new Date()
      }, { merge: true });

      // تحديث المصفوفة محلياً عشان الـ UI يتحدث فوراً
      if (!this.watchedLessons.includes(lesson.id)) {
        this.watchedLessons.push(lesson.id);
      }
    }
  }

  // دالة بنستخدمها في الـ HTML عشان نشيك الدرس اتكاف ولا لأ
  isWatched(lessonId: string): boolean {
    return this.watchedLessons.includes(lessonId);
  }

  get filteredLessons$(): Observable<any[]> {
  return this.lessons$.pipe(
    map(lessons => 
      lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    )
  );
}
}
import { FilterLessonsPipe } from '../../filter-lessons.pipe';
