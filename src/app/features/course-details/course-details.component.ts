import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // 1. استيراد الموديول
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-course-details',
  imports: [CommonModule],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.css'
})
export class CourseDetailsComponent implements OnInit {
  course$: Observable<any> | undefined;

  constructor(private route: ActivatedRoute, private courseService:CourseService) {}

  ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.course$ = this.courseService.getCourseById(id);
    }

}
}
