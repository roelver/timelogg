import * as express from 'express';

import * as  jwt from 'jwt-simple';
import * as  moment from 'moment';
import * as  mongoose from 'mongoose';
import { User } from '../../models/user';
import * as  tokencfg from './config';

import { AuthLocal } from './local';
import { AuthTwitter } from './twitter';
import { AuthGithub } from './github';

export class Auth {

   router: express.Router;

    public static ensureAuthenticated(req: any, res: any, next: Function): any {
        if (!req.headers.authorization) {
            return res.status(401)
                .send({ message: 'Please make sure your request has an Authorization header' });
        }

        const token = req.headers.authorization.split(' ')[1];

        let payload = null;
        try {
            payload = jwt.decode(token, tokencfg.config.TOKEN_SECRET);
        }
        catch (err) {
            return res.status(401).send({ message: err.message });
        }

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({ message: 'Token has expired' });
        }

        req.body.authemail = payload.sub;
        req.body.authrole = payload.rol;
        req.body.authuserid = payload.uid;
        next();
    }

    constructor() {
        this.router = express.Router();
        this.config();
    }

    private config(): void {
       this.me();
       this.delete();
       this.local();
       this.twitter();
       this.github();
   }

   private local(): void {
      let authLocal = new AuthLocal();

      // Login
      this.router.post('/local/login', (
          request: express.Request,
          response: express.Response
      ) => authLocal.login(request, response));

      // Signup
      this.router.post('/local/signup', (
          request: express.Request,
          response: express.Response
      ) => authLocal.signup(request, response));
   }

   private me(): void {
      this.router.get('/me', Auth.ensureAuthenticated, (
          request: express.Request,
          response: express.Response
      ) => {
          const query = User.findById(request.body.authuserid);
          query.select('userid displayName email role');
          query.exec( (err, user) => {
            if (err || !user) {
                response.status(404).send(err || { message: 'Not logged in' });
            } else {
                response.send(user);
            }
         });
      });
   }

   private delete(): void {
      // Login
      this.router.post('/delete', Auth.ensureAuthenticated, (
          request: express.Request,
          response: express.Response
      ) => {
          User.findOneAndRemove({email: request.body.email}, (err, user) => {
           if (!user || err) {
             return response.status(400).send({ message: 'User Not Found or delete failed ' + err });
           }
           response.status(200)
                   .send({ message: 'User is deleted' });
         });
      });
   }

    // Not implemented yet
    private twitter(): void {
        let authTwitter = new AuthTwitter();
        // Signup
        this.router.post('/twitter/', (
            request: express.Request,
            response: express.Response
        ) => authTwitter.validate(request, response));

    }

    // Not implemented yet
    private github(): void {
        let authGithub = new AuthGithub();
        // Signup
        this.router.post('/github/', (
            request: express.Request,
            response: express.Response
        ) => authGithub.validate(request, response));

    }

}
