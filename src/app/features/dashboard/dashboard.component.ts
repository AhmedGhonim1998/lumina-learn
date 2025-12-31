import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../core/services/course.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html', // اتأكد إن السطر ده موجود
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // بنستخدم علامة $ في آخر المتغير كـ "Convention" إنه Observable
  courses$: Observable<any[]> | undefined;

  constructor(private courseService: CourseService , private router: Router) {}

  ngOnInit() {
    this.courses$ = this.courseService.getCourses();
  }

  goToAddCourse() {
  this.router.navigate(['/add-course']);
}


async deleteCourse(id: string) {
  if (confirm('Are you sure you want to delete this course?')) {
    try {
      await this.courseService.deleteCourse(id);
      alert('Course deleted!');
    } catch (error) {
      console.error(error);
    }
  }
}

viewCourse(id: string) {
  this.router.navigate(['/course', id]);
}
}