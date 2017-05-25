import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { IUser } from '../../models/user';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class AuthService {

    public userChanged: EventEmitter<string> = new EventEmitter<string>();

    public token: string;

    private currentUser: string = null;
    private headers: Headers;


   constructor(private http: Http) {
      this.headers = new Headers();
      this.headers.append('Content-Type', 'application/json');
      // set token if saved in local storage
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.token = currentUser && currentUser.token;
   }

   signupLocal(user: IUser): Observable < boolean > {
      const body = JSON.stringify({
         email: user.email,
         password: user.password,
         displayName: user.displayName,
         userid: user.userid
      });
      return this.http.post('/auth/local/signup', body, { headers: this.headers })
         .map((res: Response) => {
            let token = res.json() && res.json().token;
            if (token) {
               // set token property
               this.token = token;
               // store username and jwt token in local storage to keep user logged in between page refreshes
               localStorage.setItem('currentUser', JSON.stringify({ email: user.email, token: token }));
               this.currentUser = user.email;
               this.userChanged.emit(this.currentUser);
               // return true to indicate successful login
               return true;
            } else {
               return Observable.throw({ message: 'Signup failed. No token was created.' });
            }
         })
         .catch(
         err => {
            return Observable.throw(JSON.parse(err._body));
         }
         );
   }


   loginLocal(user: IUser): Observable < boolean > {
      const body = JSON.stringify({ email: user.email, password: user.password });
      return this.http.post('/auth/local/login', body, { headers: this.headers })
         .map((response: Response) => {
            // login successful if there's a jwt token in the response
            let token = response.json() && response.json().token;
            if (token) {
               // set token property
               this.token = token;

               // store username and jwt token in local storage to keep user logged in between page refreshes
               localStorage.setItem('currentUser', JSON.stringify({ email: user.email, token: token }));
               this.currentUser = user.email;
               this.userChanged.emit(this.currentUser);

               // return true to indicate successful login
               return true;
            } else {
               return Observable.throw({ message: 'Login failed. No token was created.' });
            }
         })
         .catch(
            err => {
               return Observable.throw(JSON.parse(err._body));
            }
         );
   }

   logout(): void {
      this.token = null;
      localStorage.removeItem('currentUser');
   }

   isAuthenticated(): boolean {
      return this.token !== null;
   }

   getCurrentUser(): string {
      return this.currentUser;
   }

}
