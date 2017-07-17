import * as express from 'express';
import { Daylog } from '../../models';

const fromDate: string = 'fromDate';

export class RestTask {

    constructor() {}

    list(
       request: express.Request,
       response: express.Response
    ): any {
         console.log('List tasks', request.body.authemail);
         const userId = request.body.authuserid;
         const from = request.params[fromDate];
         Daylog.distinct('description',
             { userId: userId,
                 logDate: { $gte: from },
                 'logs.0': { $exists: true }  // Only tasks with timelogs
                 })
             .exec(
            (error: any, tasks: string[]) => {
                const taskList = tasks.sort((a, b) =>  a.toUpperCase() > b.toUpperCase() ? 1 : -1);
                return response.send({
                    tasks: taskList || []
                });
            }
        );
    }

}
