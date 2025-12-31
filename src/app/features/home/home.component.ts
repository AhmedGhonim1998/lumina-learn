import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core'; // استيراد NgZone

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {

  constructor(private router: Router, private ngZone: NgZone) {}

navigateToCourses() {
  this.ngZone.run(() => {
    this.router.navigate(['/courses']).then(success => {
      console.log('Is Navigation successful?', success);
    });
  });
}
}