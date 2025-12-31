import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { deleteDoc, doc  , docData} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class CourseService {
  constructor(private firestore: Firestore) {}

  getCourses(): Observable<any[]> {
    const coursesRef = collection(this.firestore, 'courses');
    return collectionData(coursesRef, { idField: 'id' }) as Observable<any[]>;
  }


  async deleteCourse(courseId: string) {
  const courseDocRef = doc(this.firestore, `courses/${courseId}`);
  return await deleteDoc(courseDocRef);
}

getCourseById(id: string): Observable<any> {
  const courseDocRef = doc(this.firestore, `courses/${id}`);
  return docData(courseDocRef, { idField: 'id' });
}
}