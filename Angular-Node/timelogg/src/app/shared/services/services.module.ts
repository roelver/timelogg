import { NgModule, ModuleWithProviders } from '@angular/core';

// import { TodoService } from './todo.service';
// import { UserService } from './user.service';
import { ErrorService } from './error.service';
import { TaskService } from './task.service';
import { TimelogService } from './timelog.service';
import { UtilService } from './util.service';

const SERVICES = [
        ErrorService,
        TaskService,
        TimelogService,
        UtilService
     ];

@NgModule({
    providers: [
        ...SERVICES
    ]
})
export class ServicesModule {}
