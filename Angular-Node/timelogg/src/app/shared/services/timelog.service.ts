import { Injectable, EventEmitter } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable, Subscription, Subject } from 'rxjs';
import { AuthService } from '../../auth';
import * as moment from 'moment';

import { IDaylog } from '../../../models/daylog';
import { ITimelog } from '../../../models/timelog';
import { Tasklog } from '../../../models/tasklog';
import {IUser} from '../../../models/user';
import {UtilService} from './util.service';

const msDay = 24 * 60 * 60 * 1000;
const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

@Injectable()
export class TimelogService  {

    headers: Headers;

    daylogChanged: Subject<any> = new Subject<any>();
    updateTimelines: Subject<any> = new Subject<any>();

    dateChanged: EventEmitter<string> = new EventEmitter<string>();

    private daylogs: IDaylog[] = [];

   private currentDate: string;
   private currentUser: IUser;
   private currentDlogRunning: number = -1;
   private copyLastDays: number = 7;

   constructor(private http: Http, private authService: AuthService, private utilService: UtilService) {
       this.populateAuth();
       this.authService.userChanged.subscribe((user) => {
           this.currentUser = user;
           this.headers = this.authService.getHeaders();
       });
      setTimeout(this.refresh.bind(this), 60000); // refresh every minute
   }

   populateAuth(): void {
       this.currentUser = this.authService.getCurrentUser();
       this.headers = this.authService.getHeaders();
   }

   getDirty(idx: number): string {
       return this.daylogs[idx].dirtyCode;
   }
   retrieveDaylogs(): Observable<IDaylog[]> {
       if (this.headers === null) {
           this.populateAuth();
       }
       this.currentDlogRunning = -1;
       return this.http.get('/rest/daylog/list/' + this.currentDate, { headers: this.headers })
           .map((res: Response) => {
               if (res.status < 400) {
                   this.daylogs = res.json().daylogs;
                  // console.log('Retrieved:', res);
                   for (let i = 0 ; i < this.daylogs.length ; i++) {
                       this.daylogs[i].dirtyCode = null;
                     //  this.dirtyDaylogs[i] = null;
                       if (this.daylogs[i].isRunning) {
                           this.currentDlogRunning = i;
                       }
                   }
                   return this.daylogs;
                } else {
                   return Observable.throw({ message: 'No user is logged in' });
               }
           });
    }

    // getTaskIndex(description: string): number {
    //    let idx = -1;
    //    for (let i = 0; i < this.daylogs.length; i++) {
    //        if (this.daylogs[i].description === description) {
    //            idx = i;
    //            break;
    //        }
    //    }
    //    return idx;
    // }
    //
    getTasklist(): string[] {
       return this.daylogs
           .map((dl) => dl.description);
    }

    sortDaylogs(): void {
        const dls = this.daylogs;
        this.daylogs = dls
            .sort((a, b) => a.description.toUpperCase() > b.description.toUpperCase() ? 1 : -1);
        this.daylogChanged.next();
    }

    deleteTask(idx: number): void {
       this.daylogs[idx].dirtyCode = 'D';
        this.saveDlogs();
    }

    refresh(): void {
       const d = new Date();
       console.log('Refresh at ', d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
       if (this.currentDlogRunning >= 0) {
           // Toggle een update of the model
           this.daylogs[this.currentDlogRunning].updateFlag = !this.daylogs[this.currentDlogRunning].updateFlag;
           this.updateTimelines.next();
       }
        this.saveDlogs();
       setTimeout(this.refresh.bind(this), 60000);
   }

   saveDlogs(): void {
      for (let i = 0; i < this.daylogs.length; i++) {
          if (this.daylogs[i].dirtyCode === 'A') {
              this.insertDaylog(this.daylogs[i], i).subscribe((result) => {
                  console.log('inserted', result.logId);
                  if (result.logId != null ) {
                      this.daylogs[result.idx].logId = result.logId;
                  }
                  this.daylogs[result.idx].dirtyCode = null;
              });
           }
          if (this.daylogs[i].dirtyCode === 'U') {
              console.log('update', this.daylogs[i]);
              this.updateDaylog(this.daylogs[i], i).subscribe((idx) => this.daylogs[idx].dirtyCode = null);
          }
          if (this.daylogs[i].dirtyCode === 'D') {
              this.deleteDaylog(this.daylogs[i], i).subscribe((idx) => {
                  this.daylogs.splice(idx, 1);
              });
          }
      }
   }

   insertDaylog(dl: IDaylog, idx: number): Observable<any> {
       if (dl.logs && dl.logs.length > 0 && dl.logs[dl.logs.length - 1].endTime < 0) {
           dl.logs[dl.logs.length - 1].endTime = null;
       }
       return this.http.post('/rest/daylog', JSON.stringify(dl), { headers: this.headers })
           .map((res: Response) => {
               if (res.status >= 400) {
                   throw new Error('Update failed' );
               } else {
                   const newDaylog: IDaylog = res.json();
                  // console.log('Inserted daylog', dl, 'Result-id', newDaylog.logId);
                   return {logId: newDaylog.logId, idx: idx} ;
               }
           })
           .catch ((error) => Observable.throw(error));
   }

    updateDaylog(dl: IDaylog, idx: number): Observable<number> {
        if (dl.logs && dl.logs.length > 0 && dl.logs[dl.logs.length - 1].endTime < 0) {
            dl.logs[dl.logs.length - 1].endTime = null;
        }
         return this.http.put('/rest/daylog/' + dl.logId, JSON.stringify(dl), { headers: this.headers })
            .map((res: Response) => {
                if (res.status >= 400) {
                    throw new Error('Update failed' );
                }
                return idx;
            })
            .catch(error => Observable.throw(error));
    }

    deleteDaylog(dl: IDaylog, idx: number): Observable<number> {
        return this.http.delete('/rest/daylog/' + dl.logId,  { headers: this.headers })
            .map((res: Response) => {
                if (res.status >= 400) {
                    throw new Error('Delete failed' );
                }
                return idx;
            })
            .catch(error => Observable.throw(error));
    }

    setCurrentDate(dt: string): void { // format YYYYMMDD
      this.currentDate = dt;
      this.dateChanged.emit(this.currentDate);
      this.retrieveDaylogs().subscribe((daylogs) => {
            this.daylogs = daylogs;
            this.daylogChanged.next();
        });
   }

   getCurrentDate(): string {
      return this.currentDate;
   }

   getDaylogs(): IDaylog[] {
      return this.daylogs;
   }

    // getDaylog(idx: number): IDaylog {
    //     return this.daylogs[idx];
    // }
    //
    markDirty(idx: number): void {
       this.daylogs[idx].dirtyCode = this.daylogs[idx].dirtyCode || 'U';
    }

    addTasklog(log: Tasklog, date: string): void {
       if (log.getStartTime() > log.getStopTime()) {
          console.error('Start must be before End!!');
          return;
       }
       const tasklog = new Tasklog(log.taskDesc, log.fromHH, log.fromMM, log.fromSS,
           log.comment, log.toHH, log.toMM, log.toSS);
       const tlog: ITimelog = { startTime: tasklog.getStartTime(),
           endTime: tasklog.getStopTime(),
           comment: tasklog.comment };
       this.adjustOverlap(tlog, log.taskDesc);
       this.daylogChanged.next();
   }

   markUpdatedAll(): void {
       this.daylogs.forEach((dl) => dl.updateFlag = !dl.updateFlag);
       this.daylogChanged.next();
   }

   updateTaskDescription(idx: number, desc: string): void {
       this.daylogs[idx].description = desc;
       this.daylogs[idx].dirtyCode = this.daylogs[idx].dirtyCode || 'U';
       this.daylogChanged.next();
   }

   updateTimelog(log: ITimelog, dlogIdx: number, idx: number): void {

      const startStr = this.getParticlesStr(log.startTime);
      let endStr = null;
      if (log.endTime > 0) {
         endStr = this.getParticlesStr(log.endTime);
      }

      this.adjustOverlap(log, this.daylogs[dlogIdx].description);
      this.daylogChanged.next();
      this.updateTimelines.next();
   }

   // getInDaylogs(description: string, date: string): number {
   //     for (let i = 0 ; i < this.daylogs.length ; i++) {
   //         if (this.daylogs[i].description === description && this.daylogs[i].logDate === date) {
   //             return i;
   //         }
   //     }
   //     return -1;
   // }
   //
    copyPreviousDays(): Observable<any> {

       return this.http.get('/rest/task/' + this.daysBack(this.copyLastDays), {headers: this.headers})
           .map((resp: Response) => {
               const tasks: string[] = resp.json().tasks;
                console.log('Copy found', tasks, tasks.length);
                for (let i = 0; i < tasks.length; i++) {
                    let found: boolean = false;
                    console.log('Checking task', tasks[i]);
                    for (let j = 0; j < this.daylogs.length && !found; j++) {
                        found = tasks[i].toUpperCase() === this.daylogs[j].description.toUpperCase();
                    }
                    if (!found) {
                        console.log('Adding task', tasks[i]);
                        this.daylogs.push(this.newDaylog(this.currentDate, null, this.currentUser.userid, tasks[i], false ));
                    } else {
                        console.log('Ignore task', tasks[i]);
                    }
                }
                this.sortDaylogs();
                return 'x';
           });
    }

    getDaylogForTask(description: string): IDaylog[] {
      return this.daylogs.filter(dl => {return dl.description === description && dl.logDate === this.currentDate; } );
   }

   daysBack(daysBefore: number): string {
       if (!(daysBefore > 0)) return this.currentDate;
       let year = parseInt(this.currentDate.substr(0, 4), 10);
       let month = parseInt(this.currentDate.substr(4, 2), 10) - 1;
       let day = parseInt(this.currentDate.substr(6, 2), 10) - 7;
       if (day < 1 ) {
           month = month - 1;
           if (month < 0) {
               month = 11;
               year--;
           }
           day = day + monthDays[month];
       }
       return  '' + year + this.utilService.pad(month + 1) + this.utilService.pad(day + 1);
   }

   // getDlogDescription(logid: string): string {
   //    let result = '';
   //    this.daylogs.forEach(task => {
   //          if (task.logId === logid) {
   //             result = task.description;
   //          }
   //       });
   //    return result;
   // }
   //
   startRunning(dlogIdx: number): void {
      this.stopRunning();
      this.currentDlogRunning = dlogIdx;
      const timelog: ITimelog = {startTime: this.utilService.getLocalTime(), endTime: -1};
    //  console.log('Start', this.daylogs[this.currentDlogRunning], timelog);
      if (this.daylogs[this.currentDlogRunning] && !this.daylogs[this.currentDlogRunning].logs) {
          this.daylogs[this.currentDlogRunning].logs = [];
      }
      this.daylogs[this.currentDlogRunning].isRunning = true;
      this.daylogs[this.currentDlogRunning].logs.push(timelog);
      this.daylogs[this.currentDlogRunning].dirtyCode = this.daylogs[this.currentDlogRunning].dirtyCode || 'U';
    //  console.log('Started', this.daylogs[this.currentDlogRunning], this.dirtyDaylogs[this.currentDlogRunning]);
      this.saveDlogs();
   }

   stopRunning(): void {
     //  console.log('Stop', this.currentDlogRunning);
      if (this.currentDlogRunning >= 0) {
          const now = this.utilService.getLocalTime();
          const dl = this.daylogs[this.currentDlogRunning];
          dl.isRunning = false;
          dl.logs[dl.logs.length - 1].endTime =
                     (now > dl.logs[dl.logs.length - 1].startTime) ?
                        now :
                        dl.logs[dl.logs.length - 1].startTime + 1000;
        //  console.log('Stopping', this.daylogs[this.currentDlogRunning], dl);
          this.daylogs[this.currentDlogRunning].dirtyCode = this.daylogs[this.currentDlogRunning].dirtyCode || 'U';
          this.currentDlogRunning = -1;
          this.saveDlogs();
      }
   }

   adjustOverlap(log: ITimelog, taskDesc: string): void {
      const now = this.utilService.getLocalTime();
      let switchRun = false;
      if (log.endTime > now) {
          log.endTime = now;
          switchRun = true;
      }
      console.log('>adjustOverlap Check for', log);
      this.daylogs.map((dl, dlidx) => {
         console.log('>adjustOverlap  process daylog', dl);
         const sameTask = dl.description === taskDesc;
         if (sameTask) {
             if (switchRun) {
                 const currentRunning = this.currentDlogRunning;
                 this.startRunning(dlidx);
                 if (currentRunning >= 0) {
                     // delete task that was running
                     this.daylogs[currentRunning].logs.splice(this.daylogs[currentRunning].logs.length - 1, 1);
                 }
                 dl.logs[dl.logs.length - 1].startTime = log.startTime;
                 dl.logs[dl.logs.length - 1].comment = log.comment;
             } else {
                 dl.logs.push(log);
                 dl.logs.sort((a, b) => {return (a.startTime - b.startTime); });
                 dl.logs = this.optimize(dl.logs);
             }
             dl.dirtyCode = dl.dirtyCode || 'U';
         } else {
             dl.logs.map((l, idx) => {
                 console.log('>adjustOverlap process log', l);
                 if (log.startTime >= l.startTime && log.startTime <= l.endTime && log.endTime >= l.endTime) {
                     // Overlaps at end, adjust end
                     console.log('>>adjustOverlap: Overlaps at end, adjust end');
                     l.endTime = log.startTime - 1000;
                     dl.dirtyCode = dl.dirtyCode || 'U';
                 } else {
                     if (log.endTime >= l.startTime && log.endTime <= l.endTime && log.startTime <= l.startTime) {
                         // Overlaps at begin, adjust start
                         console.log('>>adjustOverlap: Overlaps at begin, adjust start');
                         l.startTime = log.endTime + 1000;
                         dl.dirtyCode = dl.dirtyCode || 'U';
                     } else {
                         if (log.startTime >= l.startTime && log.endTime <= l.endTime) {
                             // in between, cut log in 2
                             console.log('>>adjustOverlap: in between, cut log in 2');
                             const saveEndTime = l.endTime;
                             l.endTime = log.startTime - 1000;
                             const newLog: ITimelog = {
                                 startTime: log.endTime + 1000,
                                 endTime: saveEndTime,
                                 comment: l.comment
                             };
                             dl.logs.push(newLog);
                             dl.logs.sort((a, b) => {
                                 return (a.startTime - b.startTime);
                             });
                             dl.logs = this.optimize(dl.logs);
                             dl.dirtyCode = dl.dirtyCode || 'U';
                         } else {
                             if (log.startTime <= l.startTime && l.endTime !== null && log.endTime >= l.endTime) {
                                 // full overlap , delete log
                                 console.log('>>adjustOverlap: full overlap, delete');
                                 dl.logs.splice(idx, 1);
                                 dl.dirtyCode = dl.dirtyCode || 'U';
                             }
                         }
                     }
                 }
             });
         }
      });
      this.updateTimelines.next();
   }

   optimize(logs: ITimelog[]): ITimelog[] {
       for (let i = 1; i < logs.length; i++) {
           if (logs[i - 1].endTime > logs[i].startTime) {
               if (logs[i - 1].endTime < logs[i].endTime) {
                   logs[i - 1].endTime = logs[i].endTime;
               }
               logs.splice(i, 1);
           }
       }
       return logs;
   }

   addTask(): void {
     //  console.log('New task for', this.currentUser);
       const exists = this.getDaylogForTask('New...');
     //  console.log('Existing', exists, this.daylogs);
       if (!exists || exists.length === 0) {
           const newDaylog: IDaylog = {
               logId: 'new',
               description: 'New...',
               userId: this.currentUser.userid,
               logDate: this.currentDate,
               isRunning: false,
               dirtyCode: 'A',
               updateFlag: true,
               logs: []
           };
           this.daylogs.push(newDaylog);
   //        this.dirtyDaylogs.push('A');
       //    console.log('Creating new daylog', this.daylogs);
           this.saveDlogs();
           this.daylogChanged.next();
       }
   }

   delete(dlIndex: number, tlIndex: number): void {
      this.daylogs[dlIndex].logs.splice(tlIndex, 1);
      this.daylogChanged.next();
   }

   getStartStr(tlog: ITimelog): string {
      return this.getParticlesStr(tlog.startTime);
   }

   getEndStr(tlog: ITimelog): string {
       if (!tlog.endTime || tlog.endTime < 0) {
           return 'now';
       }
      return this.getParticlesStr(tlog.endTime);
   }

   getDurationStr(tlog: ITimelog): string {
       let endT = tlog.endTime;
      if (!endT || endT < 0) {
          endT = this.utilService.getLocalTime();
      }
      const diff = endT - tlog.startTime;
      return this.getParticlesStr(diff);
   }

   getParticlesStr(timeMsec: number): string {
      return moment(timeMsec).utc().format('HH:mm:ss');
   }

   getDuration(tlog: ITimelog): number {
       let endT = tlog.endTime;
       if (!endT || endT < 0) {
           endT = this.utilService.getLocalTime();
       }
      return endT - tlog.startTime;
   }

   getBarLeftPosition(tlog: ITimelog): number {
       const msecOnDay = Math.floor(tlog.startTime % msDay);
       const leftBarPos = Math.floor((msecOnDay / msDay) * 2400) + 1;
       return leftBarPos;
   }

   getBarWidth(tlog: ITimelog): number {
       const barWidth = Math.floor((this.getDuration(tlog) / msDay) * 2400) + 1;
       return barWidth ;
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

   newDaylog(logDate: string, logId: string, userId: string,
                 description: string, isRunning: boolean): IDaylog {
      const dl = {logDate, logId, userId, description, isRunning, dirtyCode: 'A', updateFlag: true, logs: []};
      return dl;
   }

}
