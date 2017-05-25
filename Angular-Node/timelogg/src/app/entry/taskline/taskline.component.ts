import { Component, OnInit, Input } from '@angular/core';
import { TaskService, UtilService, TimelogService } from '../../shared/services';
import { TaskformComponent } from '../taskform/taskform.component';
import { ITask } from '../../../models/task';

const styles: string = require('./taskline.component.css').toString();

@Component({
  selector: 'tl-taskline',
  templateUrl: 'taskline.component.html',
  styles: [styles]
})

export class TasklineComponent implements OnInit {

  @Input()
     myTask: ITask;
  @Input()
    idx: number;
  @Input()
    currentDate: string;
  @Input()
    userEmail: string;

   editTask: ITask;

   isFormVisible: boolean = false;
   topMenu: number = 80;
   isRunning: boolean = false;
  today: Date;

   myForm: TaskformComponent;

  constructor(private _taskService: TaskService,
              private tlogService: TimelogService,
              private utilService: UtilService) {}

  ngOnInit(): void {
     this.tlogService.daylogChanged.subscribe(() => {
       let dlogList = this.tlogService.getDaylogs(this.userEmail, false);
       dlogList.forEach(dl => {
         if (this.myTask.taskId === dl.taskId && this.currentDate === dl.logDate) {
           this.isRunning = dl.isRunning;
           // stop all running tasks after midnight;
           if (this.isRunning) {
             if (!this.isToday()) {
               this.stopRunning();
             }
           }
         }
       });
     });

  }

   hideStartButton(): boolean {
      return this.isRunning;
   }

   startRunning(): void {
      this.isRunning = true;
      this.tlogService.startRunning(this.myTask);
      this.utilService.scrollHorizontal((new Date()).getHours());
   }

   stopRunning(): void {
      this.isRunning = false;
      this.tlogService.stopRunning(this.myTask);
   }

   isToday(): boolean {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      return (today === this.currentDate);
   }

   toggleForm(): void {
      this.isFormVisible = !this.isFormVisible;
      if (this.isFormVisible) {
         this.editTask = Object.create(this.myTask);
         console.log('show form', this.editTask);
      }
   }

   hideForm(): void {
      this.isFormVisible = false;
   }

   saveTask(task: ITask): void {
      console.log('Save task', task);
      this.myTask = task;
      this._taskService.updateTask(task);
      this.hideForm();
  }
}
