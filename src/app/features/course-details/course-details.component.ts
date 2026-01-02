import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { Observable } from 'rxjs';
// تأكد من استيراد الأدوات المطلوبة من Firebase
import { Firestore, doc, getDoc, collection, collectionData, query, orderBy } from '@angular/fire/firestore';

@Component({
  selector: 'app-course-details',
  standalone: true, // تأكد إنها موجودة لو بتستخدم Standalone
  imports: [CommonModule],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.css'
})
export class CourseDetailsComponent implements OnInit {
  // 1. تعريف المتغيرات اللي كان فيها ايرور
  course: any = null; 
  lessons$: Observable<any[]> | undefined;
  
  // 2. حقن الـ Firestore والـ Route والـ Service
  // بنستخدم inject أو الـ constructor، الأفضل نثبت طريقة واحدة
  private firestore = inject(Firestore); 
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);

  constructor() {}

  async ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    try {
      // 1. جلب بيانات الكورس
      const courseRef = doc(this.firestore, `courses/${id}`);
      const snap = await getDoc(courseRef);
      if (snap.exists()) {
        this.course = snap.data();
      }

      // 2. جلب الدروس وترتيبها (هنا بنحط السطر)
const lessonsRef = collection(this.firestore, `courses/${id}/lessons`);      
      // 👇 السطر بتاعك بيتحط هنا قبل ما نطلب البيانات
      const q = query(lessonsRef, orderBy('order', 'asc')); 
      
      // وبعدين بنستخدم الـ q (الاستعلام المُرتب) بدل الـ lessonsRef
this.lessons$ = collectionData(lessonsRef, { idField: 'id' }) as Observable<any[]>;
    } catch (error) {
      console.error("Error loading course details:", error);
    }
  }
}
}