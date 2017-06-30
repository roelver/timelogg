import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs';
import { IUser } from '../../models/user';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class AuthService {

    public userChanged: EventEmitter<IUser> = new EventEmitter<IUser>();

    public token: string;

    private currentUser: IUser;

    private headers: Headers;


   constructor(private http: Http) {
      this.setupHeaders();
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
               localStorage.setItem('currentUser', JSON.stringify({ token: token }));

               this.setupHeaders();
               this.getMe().subscribe(() => {
                   this.currentUser = user;
                   this.userChanged.emit(this.currentUser);
               });
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
               localStorage.setItem('currentUser', JSON.stringify({ token: token }));
                this.setupHeaders();
                this.getMe().subscribe((me) => {
                    this.currentUser = me;
                    this.userChanged.emit(this.currentUser);
                });

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

    getMe(): Observable<IUser> {
        return this.http.get('/auth/me', { headers: this.headers })
            .map((response: Response) => {
                if (response.status < 400) {
                    return response.json();
                } else {
                    return Observable.throw({ message: 'No user is logged in' });
                }
            });
    }

    logout(): void {
       this.token = null;
       this.headers = null;
       localStorage.removeItem('currentUser');
    }

    isAuthenticated(): boolean {
        return this.token !== null;
    }

    getCurrentUser(): IUser {
        if (!this.currentUser) {
            this.getMe().subscribe((me) => {
                this.currentUser = me;
                this.userChanged.emit(this.currentUser);
            });
        }

        return this.currentUser;
    }

    setupHeaders(): void {
       this.headers = new Headers();
       this.headers.append('Content-Type', 'application/json');
       const currentUser = JSON.parse(localStorage.getItem('currentUser'));
       if (currentUser) {
           this.token = currentUser && currentUser.token;
           this.headers.append('Authorization', 'Bearer ' + this.token);
       }
       console.log('setupHeaders', this.token, this.headers, currentUser);
    }

    getHeaders(): Headers {
        if (this.headers === null) {
            this.setupHeaders();
        }
        console.log('getHeaders called', this.headers);
        return this.headers;
    }

}
