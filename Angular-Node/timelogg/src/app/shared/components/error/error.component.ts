import { Component, OnInit } from '@angular/core';
import { Error } from '../../../../models/error';
import { ErrorService } from '../../services/error.service';

const styles: string = require('./error.component.css').toString();
@Component({
   selector: 'my-error',
   templateUrl: 'error.component.html',
   styles: [styles]
})

export class ErrorComponent implements OnInit {

   errorDisplay: string = 'none';
   errorData: Error;

   constructor(private _errorService: ErrorService) {}

   ngOnInit(): void {
      this._errorService.errorOccurred
         .subscribe( errorData => {
            this.errorData = errorData;
            this.errorDisplay = 'block';
         });
   }

   onErrorHandle(): void {
      this.errorDisplay = 'none';
   }

}
