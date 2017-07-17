import * as mongoose from 'mongoose';

import { ITimelog } from './timelog';
import {User, IUserModel} from './user';

export interface IDaylog {
    logId?: string;
   logDate: string;
   userId: string;
   description: string;
   isRunning: boolean;
   dirtyCode?: string;
   updateFlag: boolean; // to force a model update
   logs?: ITimelog[];
}

export interface IDaylogModel extends IDaylog, mongoose.Document {}

export const DaylogSchema = new mongoose.Schema({
   logDate: String,
    userId: String,
   _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
   description: String,
   isRunning: Boolean,
   logs: []
});

DaylogSchema
    .virtual('logId')
    .set(function(id: string): void {
        this._id = id;
    })
    .get(function(): string {
        return this._id;
    });


DaylogSchema
    .pre('save', function(next: Function): any {
        User.findById(this.userId).exec((err: any, userm: IUserModel) => {
          if (err) next(err);
          if (!userm) {
             next( new Error('No user found with this id') );
          } else {
              next();
          }
       });
    });

export const Daylog = mongoose.model<IDaylogModel>('Daylog', DaylogSchema);
