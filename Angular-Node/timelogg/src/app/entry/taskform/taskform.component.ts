import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

const styles: string  = require('./taskform.component.css').toString();

@Component({
  selector: 'div[tl-taskform]',
  templateUrl: 'taskform.component.html',
  styles: [styles]
})
export class TaskformComponent implements OnInit {

    @Input()
    myDesc: string;

    @Output()
    deleteTask: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    saveTask: EventEmitter<string> = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {
      console.log('Edit task', this.myDesc);
  }

  delete(): void {
     this.deleteTask.emit(true);
  }

  save(): void {
     this.saveTask.emit(this.myDesc);
  }
}
