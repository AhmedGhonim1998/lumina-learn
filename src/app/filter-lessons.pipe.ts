import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterLessons',
  standalone: true // مهم جداً عشان إنت شغال Standalone
})
export class FilterLessonsPipe implements PipeTransform {
  transform(lessons: any[] | null, searchQuery: string): any[] {
    if (!lessons) return [];
    if (!searchQuery) return lessons;
    
    return lessons.filter(lesson => 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
}