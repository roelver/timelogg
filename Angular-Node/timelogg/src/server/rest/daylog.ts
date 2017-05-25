import * as express from 'express';

import { Daylog, IDaylog, IDaylogModel, ITimelog } from '../../models';

const DaylogKey: string = 'daylog';

export class RestDaylog {

    constructor() {}

    list(
       request: express.Request,
        response: express.Response
    ): any {
         Daylog.find({}).exec(
            (error: any, daylogs: IDaylogModel[]) => {
                return response.send({
                    daylogs: daylogs || []
                });
            }
        );
    }

    create(
        request: express.Request,
        response: express.Response
    ): any {
        let data = [];
        request.on('data', chunk => {
            data.push(chunk);
        }).on('end', () => {
            let daylogString = Buffer.concat(data).toString();
            let daylog: IDaylog = daylogString ? JSON.parse(daylogString) : {};
            Daylog.create(daylog, (error: any, daylogm: IDaylogModel) => {
                if (daylogm) {
                    return response.send(daylogm);
                } else {
                    return response.status(400).send({
                        success: false,
                        message: 'Invalid parameters'
                    });
                }
            });
        });
    }

    find(
        request: express.Request,
        response: express.Response
    ): any {
        const id = request.params[DaylogKey];
        if (id) {
            Daylog.findById(id).exec(
                (error: any, daylog: IDaylogModel) => {
                    if (daylog) {
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
            response.status(400).send({
                success: false,
                message: 'Bad request'
            });
        }
    }

    update(
        request: express.Request,
        response: express.Response
    ): any {
        const id = request.params[DaylogKey];
        if (id) {
            let data = [];
            request.on('data', chunk => {
                data.push(chunk);
            }).on('end', () => {
                let daylogString = Buffer.concat(data).toString();
                let daylogUpdated: IDaylog = daylogString ? JSON.parse(daylogString) : {};
                Daylog.findById(id).exec(
                    (error: any, daylog: IDaylogModel) => {
                        if (daylog) {
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
            });
        } else {
            response.status(401).send({
                success: false,
                message: 'Unauthorized'
            });
        }
    }

    remove(
        request: express.Request,
        response: express.Response
    ): any {
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

}
