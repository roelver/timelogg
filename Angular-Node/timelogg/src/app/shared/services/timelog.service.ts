import { Injectable, EventEmitter } from '@angular/core';
import * as moment from 'moment';

import { TaskService } from './task.service';

import { ITask } from '../../../models/task';
import { IDaylog } from '../../../models/daylog';
import { ITimelog } from '../../../models/timelog';
import { Tasklog } from '../../../models/tasklog';

const chars = 'abcde fghijkl mnopqrstuv wxyz abdefgikl mnoprstuv aeiouaeiou';
const msDay = 24 * 60 * 60 * 1000;


@Injectable()
export class TimelogService  {

   testUser: string = 'roel@romaniflo.nl';

   tasks: ITask[] = [];

   fixedTestDaylogs: IDaylog[] = [
     this.newDaylog('20170507', 'task4', 'roel@romaniflo.nl', 'Bugfixes CDD', false),
     this.newDaylog('20170507', 'task2', 'roel@romaniflo.nl', 'Develop ICV solution', false),
     this.newDaylog('20170507', 'task3', 'roel@romaniflo.nl', 'Resource meeting', false)];

   daylogs: IDaylog[] = [];

   currentDate: string;
   currentTaskRunning: ITask = null;

   daylogChanged: EventEmitter<any> = new EventEmitter<any>();
   dateChanged: EventEmitter<string> = new EventEmitter<string>();

   constructor(private taskService: TaskService) {
      this.daylogs = this.addTimeLogs(this.fixedTestDaylogs);
      this.tasks = this.taskService.loadUserTasks(this.testUser);
      console.log('Loaded tasks', this.tasks);
      this.taskService.taskListChanged.subscribe(() => {
         this.tasks = this.taskService.loadUserTasks(this.testUser);
         console.log('Updating tasks', this.tasks);
      });
      setTimeout(this.refresh.bind(this), 60000); // refresh every minute
   }

   refresh(): void {
      this.daylogChanged.emit();
      setTimeout(this.refresh.bind(this), 60000);
   }

   setCurrentDate(dt: string): void { // format YYYYMMDD
      this.currentDate = dt;
      this.dateChanged.emit(this.currentDate);
      console.log('TimelogService, update date', this.currentDate);
   }

   getCurrentDate(): string {
      return this.currentDate;
   }

   getDaylogs(userEmail: string, generated: boolean): IDaylog[] {
      if (generated) {
         this.populateRandomDaylogs();
         this.daylogChanged.emit();
      }
      const filtered = this.daylogs
         .filter( dl => {return dl.userId === userEmail; } )
         .sort((a, b) => {return (a.description > b.description ? 1 : -1); } );
      console.log('getDaylogs', this.daylogs, filtered, userEmail);
      return filtered;
   }

   addTasklog(log: Tasklog, date: string, userEmail: string, fromForm: boolean): void {
      console.log('Adding log', log);
      this.adjustOverlap(log);
      const tasklog = new Tasklog(log.taskId, log.fromHH, log.fromMM, log.fromSS,
                                  log.comment, log.toHH, log.toMM, log.toSS);
      const tlog: ITimelog = { startTime: tasklog.getStartTime(),
                     endTime: tasklog.getStopTime(),
                     comment: tasklog.comment };
      if (this.isInDaylogs(tasklog.taskId, date)) {
         console.log('Adding to existing log', this.daylogs);
         this.daylogs.map(dl => {
               if (dl.taskId === tasklog.taskId && dl.logDate === date) {
                  dl.logs.push(tlog);
                  dl.logs.sort((a, b) => {return (a.startTime - b.startTime); });
                  if (!fromForm) {
                     dl.isRunning = true;
                  }
               }
            });
      } else {
         if (!fromForm) {
            this.daylogs.map(dl => { dl.isRunning = false; } );
         }
         const dlog: IDaylog = this.newDaylog(date, log.taskId, userEmail, this.getTaskDescription(log.taskId), !fromForm);
         dlog.logs.push(tlog);
         this.daylogs.push(dlog);
      }
      this.daylogChanged.emit();
   }

   updateTimelog(log: ITimelog, dlog: IDaylog, idx: number): void {

      const startStr = this.getParticlesStr(log.startTime);
      let endStr = null;
      if (log.endTime > 0) {
         endStr = this.getParticlesStr(log.endTime);
      }

      const tasklog = new Tasklog(dlog.taskId, parseInt(startStr.substr(0, 2), 10),
                                               parseInt(startStr.substr(3, 2), 10),
                                               parseInt(startStr.substr(6, 2), 10),
                                  log.comment, (endStr ? parseInt(endStr.substr(0, 2), 10) : null),
                                               (endStr ? parseInt(endStr.substr(3, 2), 10) : null),
                                               (endStr ? parseInt(endStr.substr(6, 2), 10) : null));
      this.adjustOverlap(tasklog, dlog);

      this.daylogs.map(dl => {
            if (dl.taskId === tasklog.taskId && dl.logDate === dlog.logDate) {
                  dl.logs[idx] = log;
                  dl.logs.sort((a, b) => {return (a.startTime - b.startTime); });
               }
            });
      this.daylogChanged.emit();
   }

   isInDaylogs(taskId: string, date: string): boolean {
      const found = this.daylogs.filter(dl => { return dl.taskId === taskId && dl.logDate === date; } );
      return (found != null && found.length > 0);
   }

   getDaylogForTask(taskId: string): IDaylog[] {
      return this.daylogs.filter(dl => {return dl.taskId === taskId && dl.logDate === this.currentDate; } );
   }

   getTaskDescription(taskid: string): string {
      let result = '';
      this.tasks.forEach(task => {
            if (task.taskId === taskid) {
               result = task.description;
            }
         });
      return result;
   }

   startRunning(task: ITask): void {
      const now = new Date();
      const tasklog = new Tasklog(task.taskId, now.getHours(), now.getMinutes(), now.getSeconds(), '');
      this.stopRunning(this.currentTaskRunning);
      this.addTasklog(tasklog, this.currentDate, this.testUser, false);
      this.currentTaskRunning = task;
   }

   stopRunning(task: ITask): void {
      console.log('Stop', task);
      const now = new Date();
      if (task !== null) {
         this.daylogs.map(dl => {
            console.log('Comparing', dl.taskId, dl.logDate,  this.currentDate,
                        dl.taskId === task.taskId, dl.logDate === this.currentDate);
            if (dl.taskId === task.taskId && dl.logDate === this.currentDate) {
                  dl.isRunning = false;
                  dl.logs[dl.logs.length - 1].endTime =
                     (now.getMilliseconds() > dl.logs[dl.logs.length - 1].startTime) ?
                        now.getMilliseconds() :
                        dl.logs[dl.logs.length - 1].startTime + 1000;
            }
         });
         this.currentTaskRunning = null;
      }
   }

   adjustOverlap(log: Tasklog, currentDlog: IDaylog = null): void {
      console.log('In adjustOverlap', log, currentDlog);
      const startTime = (log.fromHH * 60 * 60 * 1000) +
                        (log.fromMM * 60 * 1000) +
                        ((log.fromSS ? log.fromSS : 0) * 1000);
      const endTime = ((log.toHH ? log.toHH : 0) * 60 * 60 * 1000) +
                      ((log.toMM ? log.toMM : 0) * 60 * 1000) +
                      ((log.toSS ? log.toSS : 0) * 1000);
      console.log('adjustOverlap', log, startTime, endTime);
      this.daylogs.map(dl => {
         console.log('process daylog', dl);
         if (dl.logDate === this.currentDate) {
            if (currentDlog === null || dl.taskId !== currentDlog.taskId) {
               // Adjust other timelogs
               dl.logs.map((l, idx) => {
                  console.log('process log', l);
                  if (endTime !== 0 && l.endTime !== 0) {
                     if (startTime >= l.startTime && startTime <= l.endTime && endTime >= l.endTime) {
                        // Overlaps at end, adjust end
                        console.log('Overlaps at end, adjust end');
                        l.endTime = startTime - 1000;
                        if (l.endTime <= l.startTime) {
                           console.log('Negative or 0, delete');
                           dl.logs.splice(idx, 1);
                        }
                     } else {
                        if (endTime >= l.startTime && endTime <= l.endTime && startTime <= l.startTime) {
                           // Overlaps at begin, adjust start
                           console.log('Overlaps at begin, adjust start');
                           l.startTime = endTime + 1000;
                        } else {
                           if (startTime >= l.startTime && endTime <= l.endTime) {
                              // in between, cut log in 2
                              console.log('in between, cut log in 2');
                              const newEnd = Math.floor(l.endTime / 1000);
                              const newEndHH = Math.floor(newEnd / (60 * 60));
                              const newEndMM = Math.floor(((newEnd / (60 * 60)) - newEndHH) * 60);
                              const newEndSS = (newEnd % 60);
                              l.endTime = startTime - 1000;
                              const newTask = new Tasklog(dl.taskId, log.toHH, log.toMM, log.toSS,
                                                          l.comment, newEndHH, newEndMM, newEndSS);
                              console.log('Insert new Tasklog', newTask);
                              this.addTasklog(newTask, this.currentDate, this.testUser, true);
                           } else {
                              if (startTime <= l.startTime && endTime >= l.endTime) {
                                 // full overlap , delete log
                                 dl.logs.splice(idx, 1);
                              }
                           }
                        }
                     }
                  }
               });
            }
         }
      });
   }

   populateRandomDaylogs(): void {
      this.daylogs = [];
      const len = Math.floor(Math.random() * this.tasks.length);
      for (let i = 0; i < len; i++) {
         const taskid = Math.floor(Math.random() * this.tasks.length);
         this.daylogs.push(this.createRandomDaylog(this.testUser, this.tasks[taskid],
                                                   Math.floor((Math.random() * 5)) + 1, null));
         this.tasks.splice(taskid, 1);
      }
   }

   createRandomDaylog(userid: string, task: ITask, numTimelogs: number, logDate?: string): IDaylog {

      if (!logDate) {
         const dt = new Date();
         logDate = (dt.getFullYear()) + (dt.getMonth() < 9 ? '0' : '') + (dt.getMonth() + 1) +
            (dt.getDate() < 10 ? '0' : '') + dt.getDate();
      }
      const dlog: IDaylog = this.newDaylog(logDate, task.taskId, userid, task.description, false);
      let nextStart = 0;
      for (let i = 0; (i < numTimelogs || 0) || nextStart >= msDay; i++) {
         const tlog: ITimelog = this.randomTimelog(nextStart);
         nextStart = tlog.endTime;
         dlog.logs.push(tlog);
      }
      return dlog;
   }

   randomString(len: number): string {
      let result = '';
      for (let i = 0; i < len; i++) {
         result += chars.charAt(Math.random() * chars.length);
      }
      return result;
   }

   randomTimelog(after: number): ITimelog {
       const startTime = Math.floor(after + (Math.random() * (msDay / 5)));
       const endTime = Math.floor(Math.min(startTime + (Math.random() * (msDay / 15)), msDay));
       return this.newTimelog(startTime, endTime, this.randomString(20));
   }

   delete(dlIndex: number, tlIndex: number): void {
      this.daylogs[dlIndex].logs.splice(tlIndex, 1);
      this.daylogChanged.emit();
   }

   getStartStr(tlog: ITimelog): string {
      return this.getParticlesStr(tlog.startTime);
   }

   getEndStr(tlog: ITimelog): string {
      return this.getParticlesStr(tlog.endTime);
   }

   getDurationStr(tlog: ITimelog): string {
      if (tlog.endTime === 0) return '';

      const diff = tlog.endTime - tlog.startTime;
      return this.getParticlesStr(diff);
   }

   getParticlesStr(timeMsec: number): string {
      return moment(timeMsec).utc().format('HH:mm:ss');
   }

   getDuration(tlog: ITimelog): number {
      let ended = tlog.endTime;
      if (ended === 0) {
         const now = new Date();
         ended = ((now.getHours() * 60 * 60 * 1000) +  (now.getMinutes() * 60 * 1000) + (now.getSeconds() * 1000));
      }
      return ended - tlog.startTime;
   }

   getBarLeftPosition(tlog: ITimelog): number {
      const leftBarPos = Math.floor((tlog.startTime / msDay) * 2400) + 1;
      return leftBarPos;
   }

   getBarWidth(tlog: ITimelog): number {
       return Math.floor((this.getDuration(tlog) / msDay) * 2400) + 1 ;
   }

   getDetails(tlog: ITimelog): string {
      return this.getStartStr(tlog) + ' - ' +
             this.getEndStr(tlog) +
             ' (' + this.getDurationStr(tlog) + ') ' +
             tlog.comment;
   }

   onResize(edge: any, tlog: ITimelog): ITimelog {
      // 100 pixels is 1 hour = 3600000 msec , 1 pixel = 36000 msec
      if (edge.hasOwnProperty('left')) {
         tlog.startTime = tlog.startTime + (edge.left * 36000);
      } else {
         if (edge.hasOwnProperty('right')) {
            tlog.endTime = tlog.endTime + (edge.right * 36000);
         }
      }
      return tlog;
   }

   newDaylog(logDate: string, taskId: string, userId: string,
                 description: string, isRunning: boolean): IDaylog {
      const dl = {logDate, taskId, userId, description, isRunning, logs: []};
      return dl;
   }
   newTimelog(startTime: number, endTime: number, comment: string): ITimelog {
      const tl = {startTime, endTime, comment};
      return tl;
   }

   addTimeLogs(dlogs: IDaylog[]): IDaylog[] {
      console.log('Daylogs before', dlogs);
      dlogs[0].logs.push(this.newTimelog(11861359, 16741812, 'nfoshw  jkibbzi iul '));
      dlogs[0].logs.push(this.newTimelog(27705858, 29075424, 'nfgvt opi z t tojucu'));
      dlogs[0].logs.push(this.newTimelog(33355870, 34564983, 'aednbt tnbircms ejdo'));
      dlogs[0].logs.push(this.newTimelog(46436803, 47809766, 'uzo ux hsxiuae otvui'));

      dlogs[1].logs.push(this.newTimelog(15653995, 16473350, 're urvj aeetupuuoidb'));

      dlogs[2].logs.push(this.newTimelog(10796311, 15962859, 'o rtp   efbaieruimfy'));
      dlogs[2].logs.push(this.newTimelog(28814938, 34424716, 'dlvordeoykiuejgzoirb'));
      dlogs[2].logs.push(this.newTimelog(43522324, 46397732, 'clroxasuc  bauailqoa'));
      dlogs[2].logs.push(this.newTimelog(54793305, 56257525, 'gxyenbiatkj oguaordy'));
      dlogs[2].logs.push(this.newTimelog(56581777, 60835821, 'bh a rbvqadoi ogeevk'));
      console.log('Daylogs after', dlogs);
      return dlogs;
   }
}
