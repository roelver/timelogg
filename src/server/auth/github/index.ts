import * as express from 'express';
import * as qs from 'querystring';
import * as logger  from 'morgan';
import * as jwt from 'jwt-simple';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as request from 'request';
import * as async from 'async';

import { User, IUserModel, IUser } from '../../../models/user';

import { config } from './config';
import * as tokencfg from '../config';

export class AuthGithub {
   router: express.Router;

   constructor() {
      this.router = express.Router();
   }

   validate(
      req: express.Request,
      res: express.Response
   ): any {
      const accessTokenUrl = 'https://github.com/login/oauth/access_token';
      const userApiUrl = 'https://api.github.com/user';
      const params = {
        code: req.body.code,
        client_id: req.body.clientId,
        client_secret: config.GITHUB_SECRET,
        redirect_uri: req.body.redirectUri
      };

      // Step 1. Exchange authorization code for access token.
      request.get({ url: accessTokenUrl, qs: params }, (err, response, accessToken) => {
        accessToken = qs.parse(accessToken);
        const headers = { 'User-Agent': 'Satellizer' };

        // Step 2. Retrieve profile information about the current user.
        request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true },
          (errx, responsex, profilex) => {

          // Step 3a. Link user accounts.
          if (req.headers.authorization) {
            User.findOne({ username: profilex.login , provider: 'github'}, (errz, existingUser) => {
              if (existingUser) {
                return res.status(409).send({ message: 'There is already a GitHub account that belongs to you' });
              }
              const token = req.headers.authorization.split(' ')[1];
              const payload = jwt.decode(token, tokencfg.config.TOKEN_SECRET);
              User.findById(payload.sub, (errm, user) => {
                if (!user) {
                  return res.status(400).send({ message: 'User not found' });
                }
                user.save(() => {
                   const tokenx = this.createJWT(user);
                   res.send({ token: tokenx });
                });
              });
            });
          } else {
            // Step 3b. Create a new user account or return an existing one.
            User.findOne({ username: profilex.login, provider: 'github' }, (errz, existingUser) => {
              if (existingUser) {
                const token = this.createJWT(existingUser);
                return res.send({ token: token });
              }
              const newUser = new User();
              newUser.userid = profilex.login;
              newUser.displayName = profilex.name;
              newUser.email = profilex.email;
              newUser.provider = 'github';
              newUser.role = 'user';
              newUser.save((errq, user) => {
                  const token = this.createJWT(user);
                  res.send({ token: token });
                });
            });
          }
        });
      });
   }

   private createJWT(user: IUser): string {
       const payload = {
          sub: user.userid,
          iat: moment().unix(),
          exp: moment().add(14, 'days').unix()
       };
     return jwt.encode(payload, tokencfg.config.TOKEN_SECRET);
   }
}
