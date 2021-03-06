import * as express from 'express';
import * as http from 'http';
import * as serveStatic from 'serve-static';
import * as path from 'path';
import * as morgan from 'morgan';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';

import { Rest } from './rest';
import { Auth } from './auth';

declare var process, __dirname;

class Server {
    public app: any;
    private server: any;
    private mongo: any;
    private rest: any;
    private auth: any;
    private root: string;
    private port: number;

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        // Create expressjs application
        this.app = express();

        // Configure application
        this.config();

        // Setup routes
        this.routes();

        // Create server
        this.server = http.createServer(this.app);

        // Create database connections
        this.databases();

        // Start listening
        this.listen();
    }

    private config(): void {
        // By default the port should be 5000
        this.port = process.env.PORT || 5000;

        // root path is under ../../target
        this.root = path.join(path.resolve(__dirname, '../../target'));

        // parse application/x-www-form-urlencoded
        this.app.use(bodyParser.urlencoded({ extended: true }));

        // parse application/json
        this.app.use(bodyParser.json());

        this.app.use(morgan('dev'));
    }

    private routes(): void {
        let router: express.Router;
        router = express.Router();

        // Static assets
        this.app.use('/assets', serveStatic(path.resolve(this.root, 'assets')));
        this.app.use('/favicon.ico', serveStatic(path.resolve(this.root, 'favicon.ico')));

        // Setup REST API
        this.rest = new Rest();
        this.app.use('/rest', this.rest.router);

        this.auth = new Auth();
        this.app.use('/auth', this.auth.router);

        // Set router to serve index.html (e.g. single page app)
        router.get('/', (request: express.Request, result: express.Response) => {
            result.sendFile(path.join(this.root, '/index.html'));
        });

        // Set app to use router as the default route
        this.app.use('*', router);
    }

    private databases(): void {
        // MongoDB URL
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/quitr';

        // Get MongoDB handle
        this.mongo = mongoose.connect(MONGODB_URI);
        (<any>mongoose).Promise = global.Promise;
    }

    private listen(): void {
        // listen on provided ports
        this.server.listen(this.port);

        // add error handler
        this.server.on('error', error => {
            console.log('ERROR', error);
        });

        // start listening on port
        this.server.on('listening', () => {
            console.log('==> Listening on port %s. Open up http://localhost:%s/ in your browser.', this.port, this.port);
        });
    }
}

// Bootstrap the server
let server = Server.bootstrap();
module.exports = server.app;
