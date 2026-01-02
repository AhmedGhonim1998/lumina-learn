import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AddCourseComponent } from './features/add-course/add-course.component';
import { adminGuard } from './core/guards/auth.guard';
import { CourseDetailsComponent } from './features/course-details/course-details.component';
import { HomeComponent } from './features/home/home.component';
import { CourseCatalogComponent } from './features/course-catalog/course-catalog.component';
import { ProfileComponent } from './features/profile/profile.component';
import { MyCoursesComponent } from './features/my-courses/my-courses.component';
import { CoursePlayerComponent } from './features/course-player/course-player.component';
import { authUserGuard } from './core/guards/auth-user.guard';
import { CheckoutComponent } from './features/checkout/checkout.component';
export const routes: Routes = [
  // 1. الصفحة الرئيسية هي أول شيء
  { path: '', component: HomeComponent }, 

  // 2. مسارات الـ Auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // 3. مسارات لوحة التحكم (محمية بالـ Guard)
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [adminGuard] 
  },
  { 
    path: 'add-course', 
    component: AddCourseComponent, 
    canActivate: [adminGuard] 
  },
  { 
    path: 'course/:id', 
    component: CourseDetailsComponent
  },

{ path: 'courses', component: CourseCatalogComponent },
{ path: 'profile', component: ProfileComponent },
{ 
  path: 'my-courses', 
  component: MyCoursesComponent, 
  canActivate: [authUserGuard] 
},
{ 
  path: 'watch/:id', 
  component: CoursePlayerComponent, 
  canActivate: [authUserGuard] // <--- كدة الطالب والأدمن يقدروا يدخلوا
},
{ path: 'checkout/:id', component: CheckoutComponent, canActivate: [authUserGuard] },
{ path: '**', redirectTo: '' }
];