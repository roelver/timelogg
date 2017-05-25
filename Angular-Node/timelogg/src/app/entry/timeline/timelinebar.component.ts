import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IDaylog, ITimelog } from '../../../models';
import { TimelogService } from '../../shared/services/timelog.service';
import { ResizeEvent } from 'angular-resizable-element';
import { ContextMenuComponent } from 'ngx-contextmenu';

const styles: string = require('./timelinebar.component.css').toString();

@Component({
  selector: 'tl-timelinebar',
  templateUrl: 'timelinebar.component.html',
  styles: [styles]
})
export class TimelinebarComponent implements OnInit {

   @Input()
      idx: number;

  @Input()
    miDlog: IDaylog;

  @Input()
    myTlog: ITimelog;

  @Input()
    miDlogIdx: number;

    mouseOver: number = -1;
    isResizable: boolean = false;
    isResizing:  boolean = false;



  @ViewChild('optionMenu') public optionMenu: ContextMenuComponent;

  constructor(private tlogService: TimelogService) { }

  ngOnInit(): void {
  }

  getLeft(): string {
    return '' + this.tlogService.getBarLeftPosition(this.myTlog) + 'px';
  }

  getWidth(): string {
    return '' + this.tlogService.getBarWidth(this.myTlog) + 'px';
  }

  showDetails(): string {
    return this.tlogService.getDetails(this.myTlog);
  }

  onDelete(event: any): void {
     console.log('Delete: ', event, this.myTlog);
     this.tlogService.delete(this.miDlogIdx, this.idx);
  }
  onResizeStart(event: ResizeEvent): void {
    console.log('ResizeStart', event);
    this.isResizing = true;
  }

  onResizeEnd(event: ResizeEvent): void {
    console.log('ResizeEnd', event);
    this.isResizing = false;
    this.myTlog = this.tlogService.onResize(event.edges, this.myTlog);
    this.tlogService.updateTimelog(this.myTlog, this.miDlog, this.idx);
  }

  onValidateResize(): boolean {
    return true;
  }
}
