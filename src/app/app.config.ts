import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// استيراد Firebase الأساسي
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDSFt2FKAbc4h2aLyf_YQfxKUad77fx7SE",
  authDomain: "lumina-learn-debc6.firebaseapp.com",
  projectId: "lumina-learn-debc6",
  storageBucket: "lumina-learn-debc6.firebasestorage.app",
  messagingSenderId: "953688579698",
  appId: "1:953688579698:web:5e493f5e26df40e3fb2ceb",
  measurementId: "G-C09W20160R"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()), 
    
    // تعريف Firebase مرة واحدة فقط لكل خدمة
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ]
};