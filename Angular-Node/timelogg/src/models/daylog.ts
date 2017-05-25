import * as mongoose from 'mongoose';

import { ITimelog } from './timelog';

export interface IDaylog {
   logDate: string;
   taskId: string;
   userId: string;
   description: string;
   isRunning: boolean;
   logs: ITimelog[];
}

export interface IDaylogModel extends IDaylog, mongoose.Document {}

export const DaylogSchema = new mongoose.Schema({
   logDate: String,
   taskId: String,
   userId: String,
   description: String,
   isRunning: Boolean,
   logs: []
});

export const Daylog = mongoose.model<IDaylogModel>('Daylog', DaylogSchema);
