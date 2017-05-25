import { EventEmitter } from '@angular/core';
import { Error } from '../../../models/error';

export class ErrorService {
   errorOccurred: EventEmitter<Error> = new EventEmitter<Error>();

   handleError(error: any): void {
      console.log('Error handling', error);
      const errorData = new Error(error.title, error.error.message);
      this.errorOccurred.emit(errorData);
   }
}
