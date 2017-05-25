import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'tl-about',
  template: `
    <h2>About</h2>
    <button *ngIf="isLoggedIn()" (click)="onNavigate('entry')">Return to Entry</button>
    <button *ngIf="!isLoggedIn()" (click)="onNavigate('signin')">Return to Sign in page</button>
  `
})
export class AboutComponent {

   constructor(private authService: AuthService, private router: Router) {}

   isLoggedIn(): boolean {
      return this.authService.isAuthenticated();
   }

   onNavigate(ref: string): void {
      this.router.navigate(['/' + ref]);
   }
}
