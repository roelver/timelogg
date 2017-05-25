import * as express from 'express';
import * as jwt from 'jwt-simple';
import * as moment from 'moment';

import * as tokencfg from './auth/config';

import { RestTask, RestUser, RestDaylog, RestDefault  } from './rest/index';

export class Rest {
    router: express.Router;

    constructor() {
        this.router = express.Router();
        this.config();
    }

    private config(): void {
        this.daylog();
        this.task();
        this.user();
        this.default();
    }

    private task(): void {
        let restTask = new RestTask();

        // List todos
        this.router.get('/task', this.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restTask.list(request, response));

        // Create todo
        this.router.post('/task', this.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restTask.create(request, response));

        // Find a todo
        this.router.get('/task/:taskId', this.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restTask.find(request, response));

        // Update a task
        this.router.put('/task/:taskId', this.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restTask.update(request, response));

        // Delete a task
        this.router.delete('/task/:taskId', this.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restTask.remove(request, response));
    }

    private user(): void {
        let restUser = new RestUser();

        // List todos
        this.router.get('/user', (
            request: express.Request,
            response: express.Response
        ) => restUser.list(request, response));

        this.router.post('/user', [this.ensureAuthenticated, this.isAdmin], (
            request: express.Request,
            response: express.Response
        ) => {
              console.log('Allowed', request.body);
              restUser.create(request, response); });

        this.router.get('/user/:email', [this.ensureAuthenticated, this.isAdmin, (
            request: express.Request,
            response: express.Response
        ) => restUser.find(request, response)]);

        this.router.put('/user/:email', [this.ensureAuthenticated, this.isAdmin, (
            request: express.Request,
            response: express.Response
        ) => restUser.update(request, response)]);

        this.router.delete('/user/:email', [this.ensureAuthenticated, this.isAdmin, (
            request: express.Request,
            response: express.Response
        ) => restUser.remove(request, response)]);
    }

    private daylog(): void {
        let restDaylog = new RestDaylog();

        // List todos
        this.router.get('/daylog', [this.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restDaylog.list(request, response)]);

        // Create todo
        this.router.post('/daylog', [this.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restDaylog.create(request, response)]);

        // Find a todo
        this.router.get('/daylog/:daylog', this.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restDaylog.find(request, response));

        // Delete a todo
        this.router.put('/daylog/:daylog', [this.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restDaylog.update(request, response)]);

        // Delete a todo
        this.router.delete('/daylog/:daylog', [this.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restDaylog.remove(request, response)]);
    }

    private default(): void {
        // Default route
        let restDefault = new RestDefault();
        this.router.get('*', (
            request: express.Request,
            response: express.Response
        ) => restDefault.request(request, response));
    }

    private ensureAuthenticated(req: any, res: any, next: Function): any {
      console.log('Ensure auth', req.headers);
     if (!req.headers.authorization) {
       return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
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
     next();
    }

    private isAdmin(req: any, res: any, next: Function): any {
      if (req.body.authrole !== 'admin') {
        return res.status(403).send({ message: 'Not Authorized' });
      }
      next();
   }

}
