import { Component, OnInit, Input } from '@angular/core';
import { UtilService, TimelogService } from '../../shared/services';
import { TaskformComponent } from '../taskform/taskform.component';

const styles: string = require('./taskline.component.css').toString();

@Component({
  selector: 'tl-taskline',
  templateUrl: 'taskline.component.html',
  styles: [styles]
})

export class TasklineComponent implements OnInit {

  @Input()
     myTask: string;
  @Input()
    idx: number;
  @Input()
    currentDate: string;
  @Input()
    userEmail: string;
  @Input()
    isRunning: boolean;

   isFormVisible: boolean = false;
   topMenu: number = 80;
  today: Date;

   myForm: TaskformComponent;

  constructor(private tlogService: TimelogService,
              private utilService: UtilService) {}

  ngOnInit(): void {}

   startRunning(): void {
      this.isRunning = true;
      this.tlogService.startRunning(this.idx);
      this.utilService.scrollHorizontal((new Date()).getHours());
   }

   stopRunning(): void {
      this.isRunning = false;
      this.tlogService.stopRunning();
   }

   isToday(): boolean {
      return this.utilService.isToday(this.currentDate);
   }

   toggleForm(): void {
      console.log('Toggle to', !this.isFormVisible);
      this.isFormVisible = !this.isFormVisible;
   }

    deleteTask(): void {
        this.tlogService.deleteTask(this.idx);
        this.hideForm();
    }

   hideForm(): void {
      this.isFormVisible = false;
   }

   onSaveTask(desc: string): void {
      this.myTask = desc;
      this.tlogService.updateTaskDescription(this.idx, desc);
      this.hideForm();
   }
 }
