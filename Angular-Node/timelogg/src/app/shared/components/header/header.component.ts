import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth/auth.service';
import {IUser} from '../../../../models/user';

const styles: string = require('./header.component.css').toString();

@Component({
  selector: 'tl-header',
  templateUrl: 'header.component.html',
  styles: [styles]
})

export class HeaderComponent implements OnInit {

    user: IUser;

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit(): void {
      this.authService.userChanged.subscribe(
        (data) => {console.log('Header user change', data);
                   this.user = data;
                 });
    }

    isLoggedIn(): boolean {
        return this.authService.isAuthenticated();
    }

    logOut(): void {
        this.authService.logout();
        this.user = null;
        this.router.navigate(['/signin']);
    }
}
