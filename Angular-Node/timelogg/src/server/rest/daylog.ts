import * as express from 'express';

import {Daylog, IDaylog, IDaylogModel, ITimelog} from '../../models';

const DaylogKey: string = 'daylog';
const logDateKey: string = 'logDate';

export class RestDaylog {

    constructor() {
    }

    list(request: express.Request,
         response: express.Response): any {
        const userId = request.body.authuserid;
        const logDate = request.params[logDateKey];
        Daylog.find({userId: userId, logDate: logDate})
            .select('logId logDate description isRunning userId logs')
            .exec(
                (error: any, daylogs: IDaylogModel[]) => {
                    const daylogList = daylogs.map((daylog) => {
                        return this.output(daylog);
                    })
                        .sort((a, b) =>
                            (a.description.toUpperCase() > b.description.toUpperCase() ? 1 : -1));

                    return response.send({
                        daylogs: daylogList || []
                    });
                }
            );
    }

    create(request: express.Request,
           response: express.Response): any {
        let daylog: IDaylog = {
            logDate: request.body.logDate,
            userId: request.body.authuserid,
            description: request.body.description,
            isRunning: request.body.isRunning,
            updateFlag: true,
            logs: request.body.logs
        };

        Daylog.create(daylog, (error: any, daylogm: IDaylogModel) => {
            if (daylogm) {
                return response.send(this.output(daylogm));
            } else {
                return response.status(400).send({
                    success: false,
                    message: error ? error.message : 'Invalid parameters'
                });
            }
        });
    }

    find(request: express.Request,
         response: express.Response): any {
        const id = request.params[DaylogKey];
        if (id) {
            Daylog.findById(id).exec(
                (error: any, daylog: IDaylogModel) => {
                    if (daylog) {
                        return response.send(this.output(daylog));
                    } else {
                        return response.status(404).send({
                            success: false,
                            message: 'Daylog not found'
                        });
                    }
                }
            );
        } else {
            response.status(400).send({
                success: false,
                message: 'Bad request'
            });
        }
    }

    replace(request: express.Request,
            response: express.Response): any {
        const id = request.params[DaylogKey];
        if (id) {
            let daylogUpdated: IDaylog = request.body;
            Daylog.findById(id).exec(
                (error: any, daylog: IDaylogModel) => {
                    if (daylog) {
                        daylog = this.applyUpdates(daylog, daylogUpdated, true);
                        daylog.save();
                        return response.send(daylog);
                    } else {
                        return response.status(404).send({
                            success: false,
                            message: 'Daylog not found'
                        });
                    }
                }
            );
        } else {
            response.status(401).send({
                success: false,
                message: 'Unauthorized'
            });
        }
    }

    merge(request: express.Request,
          response: express.Response): any {
        const id = request.params[DaylogKey];
        if (id) {
            let daylogUpdated: IDaylog = request.body;
            Daylog.findById(id).exec(
                (error: any, daylog: IDaylogModel) => {
                    if (daylog) {
                        daylog = this.applyUpdates(daylog, daylogUpdated, false);
                        daylog.save();
                        return response.send(daylog);
                    } else {
                        return response.status(404).send({
                            success: false,
                            message: 'Daylog not found'
                        });
                    }
                }
            );
        } else {
            response.status(401).send({
                success: false,
                message: 'Unauthorized'
            });
        }
    }

    remove(request: express.Request,
           response: express.Response): any {
        const id = request.params[DaylogKey];
        if (id) {
            Daylog.findById(id).exec(
                (error: any, daylog: IDaylogModel) => {
                    if (daylog) {
                        daylog.remove();
                        return response.send({
                            success: true,
                            message: 'Daylog removed sucessfully'
                        });
                    } else {
                        return response.status(404).send({
                            success: false,
                            message: 'Daylog not found'
                        });
                    }
                }
            );
        } else {
            response.status(400).send({
                success: false,
                message: 'Bad request'
            });
        }
    }

    output(modelDaylog: IDaylogModel): IDaylog {
        return {
            logId: modelDaylog._id,
            logDate: modelDaylog.logDate,
            description: modelDaylog.description,
            userId: modelDaylog.userId,
            isRunning: modelDaylog.isRunning,
            updateFlag: true,
            logs: modelDaylog.logs
        };
    }

    applyUpdates(currentDaylog: IDaylogModel, newVal: any, replace: boolean): IDaylogModel {
        if (replace) { // for PUT
            currentDaylog.logDate = newVal.logDate || currentDaylog.logDate;
            currentDaylog.userId = newVal.userId || currentDaylog.userId;
        }
        currentDaylog.description = newVal.description || currentDaylog.description;
        currentDaylog.isRunning = (newVal.isRunning === null ? currentDaylog.isRunning : newVal.isRunning);
        currentDaylog.logs = (newVal.logs ? newVal.logs : currentDaylog.logs);
        return currentDaylog;
    }

    sortLogs(logs: ITimelog[]): ITimelog[] {
        if (!logs || logs.length === 0) {
            return null;
        } else {
            return logs.sort((a, b) => a.startTime > b.startTime ? 1 : -1);
        }
    }
}
