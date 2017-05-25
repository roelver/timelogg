import * as express from 'express';

import { User, IUser, IUserModel } from '../../models';

const UserKey: string = 'email';

export class RestUser {
    constructor() {}

    list(
       request: express.Request,
        response: express.Response
    ): any {
         User.find({})
         .select('email displayName role')
         .exec(
            (error: any, users: IUserModel[]) => {
                return response.send({
                    users: users || []
                });
            }
        );
    }

    // Create for admin
    create(
        request: express.Request,
        response: express.Response
    ): any {
            let userData: IUser = request.body ? request.body : {};
            const user = new User({
              displayName: userData.displayName,
              email: userData.email,
              provider: 'local',
              password: userData.password,
              userid: userData.userid,
              role: userData.role
            });
            user.save(() => {
               console.log('User saved', user);
               return response.send({'_id': user._id, displayName: user.displayName, email: user.email });
            },
            error => {
               console.log('Error', error);
               return response.status(400).send({
                   success: false,
                   message: error.errors.email.message ? error.errors.email.message : error.message
               });
            });
    }

    find(
        request: express.Request,
        response: express.Response
    ): any {
        const id = request.params[UserKey];
        if (id) {
            User.findById(id)
            .select('_id displayName userid provider email role')
            .exec(
                (error: any, user: IUserModel) => {
                    if (user) {
                        return response.send(user);
                    } else {
                        return response.status(404).send({
                            success: false,
                            message: 'User not found'
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
        const id = request.params[UserKey];
        if (id) {
            let data = [];
            request.on('data', chunk => {
                data.push(chunk);
            }).on('end', () => {
                let userString = Buffer.concat(data).toString();
                let userUpdated: IUser = userString ? JSON.parse(userString) : {};
                User.findById(id).exec(
                    (error: any, user: IUserModel) => {
                        if (user) {
                            if (userUpdated.email) { user.email = userUpdated.email; }
                            if (userUpdated.displayName) { user.displayName = userUpdated.displayName; }
                            user.save();
                            return response.send(user);
                        } else {
                            return response.status(404).send({
                                success: false,
                                message: 'User not found'
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
        const id = request.params[UserKey];
        if (id) {
            User.findById(id).exec(
                (error: any, user: IUserModel) => {
                    if (user) {
                        user.remove();
                        return response.send({
                            success: true,
                            message: 'User removed sucessfully'
                        });
                    } else {
                        return response.status(404).send({
                            success: false,
                            message: 'User not found'
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
