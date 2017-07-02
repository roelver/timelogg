import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TimelogService } from '../shared/services/timelog.service';
import { UtilService } from '../shared/services/util.service';
import { Tasklog } from '../../models/tasklog';

const styles: string = require('./logform.component.css').toString();

@Component({
  selector: 'tl-logform',
  templateUrl: 'logform.component.html',
  styles: [styles]
})

export class LogformComponent implements OnInit, OnDestroy {

   @Input()
      dt: string;

    public visible = false;
    public visibleAnimate = false;

    currentDate: string; // dt in fmt YYYYMMDD


   constructor(private tlogService: TimelogService,
               private utilService: UtilService) {
   }

   ngOnInit(): void {
   }

   ngOnDestroy(): void {
   }

   onSubmit(form: NgForm): void {
      const manualLog: Tasklog =
            new Tasklog(form.value.taskDesc,
                        form.value.fromHH,
                        form.value.fromMM, 0,
                        form.value.comment,
                        form.value.toHH,
                        form.value.toMM, 0);
      this.tlogService.addTasklog(manualLog);
      this.utilService.scrollHorizontal(manualLog.fromHH);
      this.hide();
   }

   onNewTask(): void {
      this.tlogService.addTask();
   }

    show(): void {
        this.visible = true;
        setTimeout(() => this.visibleAnimate = true, 100);
    }

    hide(): void {
        this.visibleAnimate = false;
        setTimeout(() => this.visible = false, 300);
    }

    onContainerClicked(event: MouseEvent): void {
        if ((<HTMLElement>event.target).classList.contains('modal')) {
            this.hide();
        }
    }
}
