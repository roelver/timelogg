import * as express from 'express';
import * as jwt from 'jwt-simple';
import * as moment from 'moment';

import { Auth } from './auth';

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
        this.router.get('/task/:fromDate', Auth.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restTask.list(request, response));
    }

    private user(): void {
        let restUser = new RestUser();

        // List todos
        this.router.get('/user', (
            request: express.Request,
            response: express.Response
        ) => restUser.list(request, response));

        this.router.post('/user', [Auth.ensureAuthenticated, this.isAdmin, (
            request: express.Request,
            response: express.Response
        ) => restUser.create(request, response)]);

        this.router.get('/user/:email', [Auth.ensureAuthenticated, this.isAdmin, (
            request: express.Request,
            response: express.Response
        ) => restUser.find(request, response)]);

        this.router.put('/user/:email', [Auth.ensureAuthenticated, this.isAdmin, (
            request: express.Request,
            response: express.Response
        ) => restUser.update(request, response)]);

        this.router.delete('/user/:email', [Auth.ensureAuthenticated, this.isAdmin, (
            request: express.Request,
            response: express.Response
        ) => restUser.remove(request, response)]);
    }

    private daylog(): void {
        let restDaylog = new RestDaylog();

        // List todos
        this.router.get('/daylog/list/:logDate', Auth.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restDaylog.list(request, response));

        // Create todo
        this.router.post('/daylog', Auth.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restDaylog.create(request, response));

        // Find a todo
        this.router.get('/daylog/:daylog', Auth.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restDaylog.find(request, response));

        // Replace a Daylog
        this.router.put('/daylog/:daylog', Auth.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restDaylog.replace(request, response));

        // Merge a Daylog
        this.router.patch('/daylog/:daylog', Auth.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restDaylog.merge(request, response));

        // Delete a todo
        this.router.delete('/daylog/:daylog', Auth.ensureAuthenticated, (
            request: express.Request,
            response: express.Response
        ) => restDaylog.remove(request, response));
    }

    private default(): void {
        // Default route
        let restDefault = new RestDefault();
        this.router.get('*', (
            request: express.Request,
            response: express.Response
        ) => restDefault.request(request, response));
    }

    private isAdmin(req: any, res: any, next: Function): any {
        if (req.body.authrole !== 'admin') {
            return res.status(403).send({ message: 'Not Authorized' });
        }
        next();
    }

}
