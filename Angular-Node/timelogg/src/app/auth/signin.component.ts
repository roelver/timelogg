import {Component, OnInit, OnDestroy} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from './auth.service';

const styles: string = require('./signin.component.css').toString();

@Component({
    templateUrl: 'signin.component.html',
    styles: [styles]
})
export class SigninComponent implements OnInit, OnDestroy {
    myForm: FormGroup;
    error: boolean = false;
    errorMessage: string = '';
    loginSubscription: Subscription;

    constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {}

    onSignin(): void {
        console.log('Signin ts');
        this.loginSubscription = this.authService.loginLocal(this.myForm.value)
            .subscribe(
               (result) => {
                  this.router.navigate(['/entry']);
               },
               (error) => {
                  this.errorMessage = error.message;
               }
            );
    }

    ngOnInit(): void {
        this.myForm = this.fb.group({
            email: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    ngOnDestroy(): void {
      this.loginSubscription.unsubscribe();
   }
}
