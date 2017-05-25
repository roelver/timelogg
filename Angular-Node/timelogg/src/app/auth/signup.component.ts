import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from './auth.service';

const styles: string = require('./signup.component.css').toString();

@Component({
    templateUrl: 'signup.component.html',
    styles: [styles]
})
export class SignupComponent implements OnInit, OnDestroy {

   myForm: FormGroup;
   error: boolean = false;
   errorMessage: string = '';
   signupSubscription: Subscription;

   constructor(private router: Router,
               private authService: AuthService) {}

   onSignup(): void {
      this.errorMessage = '';
      this.signupSubscription = this.authService.signupLocal(this.myForm.value)
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
      this.myForm = new FormGroup({
         'email': new FormControl('', Validators.compose([
            Validators.required,
            Validators.email
         ]) ),
         'password': new FormControl('', Validators.required),
         'confirmPassword': new FormControl('', Validators.compose([
            Validators.required,
            this.isEqualPassword.bind(this)
         ])),
         'displayName': new FormControl('', Validators.required),
         'userid': new FormControl('', Validators.required)
      });
   }

   isEqualPassword(control: FormControl): {[s: string]: boolean} {
      if (!this.myForm) {
         return {passwordsNotMatch: true};
      }
      const PW = 'password';
      if (control.value !== this.myForm.controls[PW].value) {
         return {passwordsNotMatch: true};
      }
   }

   ngOnDestroy(): void {
     this.signupSubscription.unsubscribe();
   }

}
