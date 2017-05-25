'use strict';

import * as express from 'express';
import * as jwt from 'jwt-simple';
import * as  mongoose from 'mongoose';
import * as  moment from 'moment';

import * as tokencfg from '../config';

import { IUser, User, IUserModel } from '../../../models/user';

export class AuthLocal {
   router: express.Router;
   userHelper: any;

   constructor() {
      this.router = express.Router();
   }

   login(
      request: express.Request,
      response: express.Response
   ): any {
      console.log('Login body', request.body);
      User.findOne({ email: request.body.email }, (err: Error, user: any) => {
        if (!user) {
          return response.status(401).send({ message: 'Wrong email and/or password' });
        }
        console.log('Pre-auth', user);
        if (user.authenticate(request.body.password)) {
           response.send({ token: this.createJWT(user) });
        }
        else {
           return response.status(401).send({ message: 'Wrong email and/or password' });
        }
      });
   }

   signup(
      request: express.Request,
      response: express.Response
   ): any {
      User.findOne({ email: request.body.email.toLowerCase() }, (err, existingUser) => {
        if (existingUser) {
          return response.status(409).send({ message: 'Email is already taken' });
        }
        const user = new User({
          displayName: request.body.displayName,
          email: request.body.email,
          provider: 'local',
          password: request.body.password,
          userid: request.body.userid
        });
        user.save(() => {
           console.log('Saving user:', user);
          response.send({ token: this.createJWT(user) });
        });
      });
   }

   private createJWT(user: IUser): string {
     const payload = {
       sub: user.email,
       rol: user.role,
       iat: moment().unix(),
       exp: moment().add(14, 'days').unix()
     };
     return jwt.encode(payload, tokencfg.config.TOKEN_SECRET);
   }

}
