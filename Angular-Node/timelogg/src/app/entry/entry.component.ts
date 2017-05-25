import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import * as moment from 'moment';

import { TimelineareaComponent } from './timelinearea/timelinearea.component';
import { AuthService } from '../auth/auth.service';
import { TaskService } from '../shared/services/task.service';
import { TimelogService } from '../shared/services/timelog.service';
import { UtilService } from '../shared/services/util.service';
import { Tasklog } from '../../models/tasklog';
import { ITask } from '../../models/task';
import { ITimelog } from '../../models/timelog';
import { IDaylog } from '../../models/daylog';
// import 'rxjs/Rx';
// import {Observable} from 'rxjs/Observable';
import { ErrorService } from '../shared/services/error.service';

const styles: string = require('./entry.component.css').toString();

@Component({
  selector: 'tl-entry',
  templateUrl: 'entry.component.html',
  styles: [styles]
})

export class EntryComponent implements OnInit {

   @Input()
      dt: string;

   currentDate: string; // dt in fmt YYYYMMDD

   tasklist: ITask[] = [];

   dlogList: IDaylog[] = [];

   userEmail: string;

   allShowing: boolean = false;

   @ViewChild('f') manualForm: NgForm;

   @Output()
      hours: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
   @Output()
      mins: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                        19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
                        36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
                        52, 53, 54, 55, 56, 57, 58, 59];

   constructor(private taskService: TaskService,
               private authService: AuthService,
               private tlogService: TimelogService,
               private errorService: ErrorService,
               private utilService: UtilService) {
   }

   ngOnInit(): void {
      this.dt = moment().format('YYYY-MM-DD');
      this.currentDate = moment().format('YYYYMMDD');
      this.tlogService.setCurrentDate(this.currentDate);
      this.userEmail = this.authService.getCurrentUser();
      if (this.userEmail !== null) {
         this.tasklist = this.taskService.loadUserTasks(this.userEmail);
         this.taskService.taskListChanged.subscribe(() =>
            this.tasklist = this.taskService.loadUserTasks(this.userEmail));
         this.dlogList = this.tlogService.getDaylogs(this.userEmail, false);
         console.log('Init: Filtered daylogs', this.dlogList);
         this.tlogService.daylogChanged.subscribe(() => {
            this.dlogList = this.tlogService.getDaylogs(this.userEmail, false);
            console.log('Update: Filtered daylogs', this.dlogList);
         });
      }
   }

   onDateChange(newDate: string): void {
      this.dt = newDate;
      this.currentDate = newDate.replace(/-/g, '');
      console.log('New date selected', this.currentDate);
      this.tlogService.setCurrentDate(this.currentDate); // sync with service that emits the event
   }

   onSubmit(form: NgForm): void {
      const manualLog: Tasklog =
            new Tasklog(form.value.taskId,
                        form.value.fromHH,
                        form.value.fromMM, 0,
                        form.value.comment,
                        form.value.toHH,
                        form.value.toMM, 0);
      console.log('Manual Tasklog: ', manualLog);
      this.tlogService.addTasklog(manualLog, this.currentDate, this.userEmail, true);
      this.utilService.scrollHorizontal(manualLog.fromHH);
      this.manualForm.reset({fromHH: 0, fromMM: 0, toHH: 0, toMM: 0 });
   }

   onNewTask(): void {
      const tmp: ITask = { description: '',
                           isActive: true,
                           taskId: this.taskService.newTaskId(),
                           email: this.userEmail};
      this.taskService.addTask(tmp);
   }

   showAll(): void {
      this.allShowing = true;
      this.taskService.setAllShowing(true); // sync with service that emits the event
   }

   showActive(): void {
      this.allShowing = false;
      this.taskService.setAllShowing(false); // sync with service that emits the event
   }

   getStartStr(tlog: ITimelog): string {
      return this.tlogService.getStartStr(tlog);
   }
   getEndStr(tlog: ITimelog): string {
      return this.tlogService.getEndStr(tlog);
   }
   getDurationStr(tlog: ITimelog): string {
      return this.tlogService.getDurationStr(tlog);
   }
}
