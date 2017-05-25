import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth/auth.service';

const styles: string = require('./header.component.css').toString();

@Component({
  selector: 'tl-header',
  templateUrl: 'header.component.html',
  styles: [styles]
})

export class HeaderComponent implements OnInit {

    userEmail: string;

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit(): void {
      this.authService.userChanged.subscribe(
        (data) => {console.log('Header user change', data);
                   this.userEmail = data;
                 });
    }

    isLoggedIn(): boolean {
        return this.authService.isAuthenticated();
    }

    logOut(): void {
        this.authService.logout();
        this.userEmail = null;
        this.router.navigate(['/signin']);
    }
}
