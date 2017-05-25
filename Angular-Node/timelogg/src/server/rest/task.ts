import * as express from 'express';
import { Task, ITaskModel, ITask, IUserModel, User } from '../../models';

const TaskKey: string = 'taskId';

export class RestTask {
    constructor() {}

    list(
       request: express.Request,
        response: express.Response
    ): any {
         const email = request.body.authemail;
         Task.find({email: email, isActive: true})
             .select('taskId description email')
             .exec(
            (error: any, tasks: ITaskModel[]) => {
                const taskList = tasks.map((task) => {
                    return this.output(task);
                });
                return response.send({
                    tasks: taskList || []
                });
            }
        );
    }

    create(
        request: express.Request,
        response: express.Response
    ): any {
        let task: ITaskModel = request.body;
        User.findOne({email: task.email}).exec((err: any, user: IUserModel) => {
            if (user) {
                task._user = user._id;
                console.log('Populating', task, user);
            }
        })
        .then(() => {
            console.log('Populated', task);
            Task.create(task, (error: any, taskm: ITaskModel) => {
                if (taskm) {
                    return response.send(this.output(taskm));
                } else {
                    console.log('Error', error);
                    return response.status(400).send({
                        success: false,
                        message: error.errors.email.message ? error.errors.email.message : error.message
                    });
                }
            });
        })
        .catch((error) => {
            return response.status(400).send({
                success: false,
                message: error.message || 'No valid user found'
            });
        });
}

    find(
        request: express.Request,
        response: express.Response
    ): any {
        const id = request.params[TaskKey];
        if (id) {
            Task.findById(id)
                .exec((error: any, task: ITaskModel) => {
                    if (task) {
                        return response.send(this.output(task));
                    } else {
                        return response.status(404).send({
                            success: false,
                            message: error.message ? error.message : 'Task not found'
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
        const id = request.params[TaskKey];
        if (id) {
            let taskUpdated: ITask = request.body;
            console.log('Updated:', taskUpdated);
            Task.findById(id).exec(
                (error: any, task: ITaskModel) => {
                    if (task) {
                        task = this.applyUpdates(task, taskUpdated);
                        task.save();
                        return response.send(this.output(task));
                    } else {
                        return response.status(404).send({
                            success: false,
                            message: error.message ? error.message : 'Task not found'
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

    remove(
        request: express.Request,
        response: express.Response
    ): any {
        const id = request.params[TaskKey];
        if (id) {
            Task.findById(id).exec(
                (error: any, task: ITaskModel) => {
                    if (task) {
                        task.remove();
                        return response.send({
                            success: true,
                            message: 'Task removed sucessfully'
                        });
                    } else {
                        return response.status(404).send({
                            success: false,
                            message: 'Task not found'
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

    output(modelTask: ITaskModel): ITask {
        return {
            taskId: modelTask.taskId,
            description: modelTask.description,
            email: modelTask.email,
            isActive: modelTask.isActive
        };
     }
    applyUpdates(currentTask: ITaskModel, newVal: any): ITaskModel {
        currentTask.description = newVal.description || currentTask.description;
        currentTask.isActive = newVal.isActive || currentTask.isActive;
        if (newVal.email && newVal.email !== currentTask.email) {
            User.findOne({email: newVal.email}).exec((err: any, user: IUserModel) => {
                currentTask._user = user._id;
                console.log('Apply update email: Populating user', currentTask, user);
            })
            .then(() => {
                currentTask.email = newVal.email || currentTask.email;
                return currentTask;
            });
        } else {
            currentTask.email = newVal.email || currentTask.email;
            return currentTask;
        }
    }
}
