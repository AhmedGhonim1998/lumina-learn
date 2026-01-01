import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, switchMap } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-courses.component.html'
})
export class MyCoursesComponent implements OnInit {
  enrolledCourses$: Observable<any[]> | undefined;

  constructor(private auth: Auth, private firestore: Firestore) {}

  ngOnInit() {
    this.enrolledCourses$ = authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          // بنجيب الكورسات اللي الطالب اشتراها بس
          const enrolledRef = collection(this.firestore, `users/${user.uid}/enrolledCourses`);
          return collectionData(enrolledRef, { idField: 'id' });
        } else {
          return of([]);
        }
      })
    );
  }
}