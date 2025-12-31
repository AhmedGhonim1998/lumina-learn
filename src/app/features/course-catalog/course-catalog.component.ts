import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-course-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-catalog.component.html'
})
export class CourseCatalogComponent implements OnInit {
  courses$: Observable<any[]> | undefined;

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    const coursesCollection = collection(this.firestore, 'courses');
    this.courses$ = collectionData(coursesCollection, { idField: 'id' });
  }
}