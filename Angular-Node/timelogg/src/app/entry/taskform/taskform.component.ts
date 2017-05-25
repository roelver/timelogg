import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ITask } from '../../../models/task';
import { TaskService } from '../../shared/services/task.service';

const styles: string  = require('./taskform.component.css').toString();

@Component({
  selector: 'div[tl-taskform]',
  templateUrl: 'taskform.component.html',
  styles: [styles]
})
export class TaskformComponent implements OnInit {

  @Input()
  myTask: ITask;
  editTask: ITask;

  @Output()
  hideForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output()
  saveTask: EventEmitter<ITask> = new EventEmitter<ITask>();

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
      this.editTask = this.taskService.cloneTask(this.myTask);
      console.log('Edit task', this.editTask, this.myTask);
  }

  hide(): void {
     this.editTask = this.taskService.cloneTask(this.myTask);
     this.hideForm.emit(true);
  }

  save(): void {
     console.log('Save task', this.editTask);
     this.saveTask.emit(this.editTask);
  }

}
