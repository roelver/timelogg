import * as mongoose from 'mongoose';
import {IUserModel, IUser, User} from './user';

export interface ITask {
    taskId: string;
    description?: string;
    isActive: boolean;
    email: string;
    _user?: string;
}

export interface ITaskModel extends ITask, mongoose.Document {}

export const TaskSchema = new mongoose.Schema({
    description: {type: String, required: true},
    isActive: Boolean,
    email: {type: String, required: true},
    _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

// Proxy a taskId
TaskSchema
    .virtual('taskId')
    .set(function(id: string): void {
        this._id = id;
    })
    .get(function(): string {
       return this._id;
    });

// Validate empty email
TaskSchema
    .path('email')
    .validate(function(email: string): any {
       return email.length;
    }, 'Email cannot be blank');

TaskSchema
    .path('email')
    .validate(function(email: string): any {
       const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
       return re.test(email);
    }, 'Email is not valid');

/**
 * Pre-save hook - populate user
 */
TaskSchema
    .pre('save', function(next: Function): any {

        console.log('pre-save', this);
        // User.findOne({email: this.email}).exec((err: any, userm: IUserModel) => {
        //     if (userm && this._user !== userm._id) {
        //         this._user = userm._id;
        //     }
        //     console.log('pre-save', this);
        // });
        next();
    });

export const Task = mongoose.model<ITaskModel>('Task', TaskSchema);
