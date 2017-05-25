import * as express from 'express';
import * as qs from 'querystring';
import * as logger from 'morgan';
import * as jwt from 'jwt-simple';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import * as request from 'request';
import * as async from 'async';
import { User, IUser } from '../../../models/user';

import { config } from './config';
import * as tokencfg from '../config';

export class AuthTwitter {
   router: express.Router;

   constructor() {
      this.router = express.Router();
   }

   validate(
      req: express.Request,
      res: express.Response
   ): any {
      const requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
      const accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
      const profileUrl = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

      // Part 1 of 2: Initial request from Satellizer.
      if (!req.body.oauth_token || !req.body.oauth_verifier) {
        const requestTokenOauth = {
          consumer_key: config.TWITTER_KEY,
          consumer_secret: config.TWITTER_SECRET,
          callback: req.body.redirectUri
        };

        // Step 1. Obtain request token for the authorization popup.
        request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, (err, response, body) => {
          const oauthToken = qs.parse(body);

          // Step 2. Send OAuth token back to open the authorization screen.
          res.send(oauthToken);
        });
      } else {
        // Part 2 of 2: Second request after Authorize app is clicked.
        const accessTokenOauth = {
          consumer_key: config.TWITTER_KEY,
          consumer_secret: config.TWITTER_SECRET,
          token: req.body.oauth_token,
          verifier: req.body.oauth_verifier
        };

        // Step 3. Exchange oauth token and oauth verifier for access token.
        request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, (err, response, accessToken) => {

          accessToken = qs.parse(accessToken);

          const profileOauth = {
            consumer_key: config.TWITTER_KEY,
            consumer_secret: config.TWITTER_SECRET,
            oauth_token: accessToken.oauth_token
          };

          // Step 4. Retrieve profile information about the current user.
          request.get({
            url: profileUrl + accessToken.screen_name,
            oauth: profileOauth,
            json: true
         }, (errx, responsex, profile) => {

            // Step 5a. Link user accounts.
            if (req.headers.authorization) {
              User.findOne({ username: profile.id_str , provider: 'twitter'}, (errz, existingUser) => {
                if (existingUser) {
                  return res.status(409).send({ message: 'There is already a Twitter account that belongs to you' });
                }

                const token = req.headers.authorization.split(' ')[1];
                const payload = jwt.decode(token, tokencfg.config.TOKEN_SECRET);
                User.findById(payload.sub, (errw, user) => {
                  if (!user) {
                    return res.status(400).send({ message: 'User not found' });
                  }

                  user.userid = profile.id_str;
                  user.provider = 'twitter';
                  user.displayName = user.displayName || profile.name;
                  user.save((erry) => {
                    res.send({ token: this.createJWT(user) });
                  });
                });
              });
            } else {
              // Step 5b. Create a new user account or return an existing one.
              User.findOne({ username: profile.id_str , provider: 'twitter'}, (errz, existingUser) => {
                if (existingUser) {
                  return res.send({ token: this.createJWT(existingUser) });
                }

                const user = new User();
                user.userid = profile.id_str;
                user.displayName = profile.name;
                user.provider = 'twitter';
                user.save(() => {
                  res.send({ token: this.createJWT(user) });
                });
              });
            }
          });
        });
      }   }

      private createJWT(user: IUser): string {
        const payload = {
          sub: user.userid,
          iat: moment().unix(),
          exp: moment().add(14, 'days').unix()
        };
        return jwt.encode(payload, tokencfg.config.TOKEN_SECRET);
      }

}
