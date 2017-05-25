import { Injectable, EventEmitter } from '@angular/core';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { ITask } from '../../../models/task';

const chars = 'abcdefghijklmnopqrstuvwxyz';

@Injectable()
export class TaskService {

  testTasks: ITask[] = [
    this.newTask('task1', 'roel@romaniflo.nl', 'Read mail', true),
    this.newTask('task2', 'roel@romaniflo.nl', 'Develop ICV solution', true),
    this.newTask('task3', 'roel@romaniflo.nl', 'Resource meeting', true),
    this.newTask('task4', 'roel@romaniflo.nl', 'Bugfixes CDD', true),
    this.newTask('task5', 'test@test.com', 'Planning ABC project', true),
    this.newTask('task6', 'roel@romaniflo.nl', 'Run monthly query', false)
  ];

   tasks: ITask[] = [];

   taskListChanged: EventEmitter<any> = new EventEmitter<any>();

   allShowing: boolean = false;

   constructor() {}

   loadUserTasks(email: string): ITask[] {
     return this.testTasks
        .filter(task => { return task.email === email && ( this.allShowing || task.isActive); } )
        .sort((a, b) => { return (a.description.toUpperCase() > b.description.toUpperCase() ? 1 : -1); });
   }

   addTask(task: ITask): void {
      this.testTasks.push(task);
      this.taskListChanged.emit();
   }

   updateTask(task: ITask): void {
      this.testTasks.map((t, i) => {
         if (t.taskId === task.taskId) {
            this.testTasks[i] = task;
         }
       });
       this.taskListChanged.emit();
   }

   getTask(taskid: string): ITask {
      const result = this.tasks.filter(task => (task.taskId === taskid));
      if (result && result.length > 0) {
         return result[0];
      }
      return null;
  }

   setAllShowing(allShowing: boolean): void {
      this.allShowing = allShowing;
      this.taskListChanged.emit();
   }

  isAllShowing(): boolean {
    return this.allShowing;
  }

  newTaskId(): string {
    return this.randomString(10);
  }

  cloneTask(task: ITask): ITask {
     const result: ITask = this.newTask(task.taskId, task.email, task.description, task.isActive);
     return result;
  }

  randomString(len: number): string {
    let result = '';
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.random() * chars.length);
    }
    return result;
  }

  newTask(taskId: string, email: string,
                description: string, isActive: boolean): ITask {
     const tsk: ITask = {taskId, email, description, isActive};
     return tsk;
  }
}
