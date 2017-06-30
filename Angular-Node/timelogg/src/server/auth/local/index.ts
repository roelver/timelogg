'use strict';

import * as express from 'express';
import * as jwt from 'jwt-simple';
import * as moment from 'moment';

import * as tokencfg from '../config';
import { User } from '../../../models/user';

export class AuthLocal {

   constructor() {}

   login(
      request: express.Request,
      response: express.Response
   ): any {
        if (!request.body.email) {
           return response.status(409)
                          .send({ message: 'No email was sent' });
       }
      User.findOne({ email: request.body.email.toLowerCase() }, (err: Error, user: any) => {
          if (err || !user) {
              return response.status(401)
                             .send({ message: 'Wrong email and/or password' });
          }
          if (user.authenticate(request.body.password)) {
              response.send({ token: this.createJWT(user) });
          }
          else {
              return response.status(401)
                             .send({message: 'Wrong email and/or password'});
          }
       });
   }


   signup(
      request: express.Request,
      response: express.Response
   ): any {
       if (!request.body.email) {
           return response.status(409)
                          .send({ message: 'No email was sent' });
       }
       User.findOne({ email: request.body.email.toLowerCase() },
           (err, existingUser) => {
           if (existingUser) {
               return response.status(409)
                              .send({ message: 'Email is already taken' });
           }
           const user = new User({
               displayName: request.body.displayName,
               email: request.body.email,
               provider: 'local',
               password: request.body.password
           });

           user.save((errx, userm) => {
               if (errx) {
                   return response.status(409).send({ message: errx.message} );
               } else {
                   response.send({ token: this.createJWT(userm) });
               }
           });
       });
   }

   private createJWT(user: any): string {
       const payload = {
           sub: user.email,
           rol: user.role,
           uid: user._id,
           iat: moment().unix(),
           exp: moment().add(2, 'days').unix()
       };
       return jwt.encode(payload, tokencfg.config.TOKEN_SECRET);
   }

}
