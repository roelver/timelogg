import {Injectable, EventEmitter} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable, Subject} from 'rxjs';
import * as moment from 'moment';

import {AuthService} from '../../auth';
import {UtilService} from './util.service';

import {IDaylog} from '../../../models/daylog';
import {ITimelog} from '../../../models/timelog';
import {Tasklog} from '../../../models/tasklog';
import {IUser} from '../../../models/user';

const msDay = 24 * 60 * 60 * 1000;
const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const copyLastDays = 4;

@Injectable()
export class TimelogService {

    headers: Headers;

    daylogChanged: Subject<any> = new Subject<any>();
    updateTimelines: Subject<any> = new Subject<any>();

    dateChanged: EventEmitter<string> = new EventEmitter<string>();

    private daylogs: IDaylog[] = [];
    private retrieving: boolean = false;

    private currentDate: string;
    private currentUser: IUser;
    private currentDlogRunning: number = -1;

    constructor(private http: Http, private authService: AuthService, private utilService: UtilService) {
        this.authService.userChanged.subscribe((user) => {
            this.currentUser = user;
            this.refreshAuthorizationHeaders();
        });
        // Start main refresh mechanism
        setTimeout(this.refresh.bind(this), 60000);
    }

    // Authorization related
    populateAuth(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.refreshAuthorizationHeaders();
    }

    waitForAuthorizationHeaders(): void {
        this.populateAuth();
        const sec = this.getSec() + 1;
        while (!this.headers.has('Authorization') && this.getSec() < sec) {
        }
    }

    refreshAuthorizationHeaders(): void {
        this.headers = this.authService.getHeaders();
        if (!this.headers.has('Authorization')) {
            setTimeout(this.refreshAuthorizationHeaders(), 50);
            return;
        }
    }

    retrieveDaylogs(): Observable<IDaylog[]> {
        if (this.retrieving) return;
        this.getCurrentDate();
        this.waitForAuthorizationHeaders();
        this.currentDlogRunning = -1;
        this.retrieving = true;
        setTimeout(this.resetRetrieving(), 1000);
        return this.http.get('/rest/daylog/list/' + this.currentDate, {headers: this.headers})
            .map((res: Response) => {
                this.retrieving = false;
                if (res.status < 400) {
                    this.daylogs = res.json().daylogs;
                    for (let i = 0; i < this.daylogs.length; i++) {
                        this.daylogs[i].dirtyCode = null;
                        if (this.daylogs[i].isRunning) {
                            if (this.currentDate !== this.getToday()) {
                                this.currentDlogRunning = -1;
                                this.daylogs[i].isRunning = false;
                                this.daylogs[i].dirtyCode = 'U';
                                this.daylogs[i].logs[this.daylogs[i].logs.length - 1].endTime =
                                    this.utilService.getTimeMsec('23:59:59');
                            } else {
                                this.currentDlogRunning = i;
                            }
                        }
                    }
                    this.daylogChanged.next();
                    return this.daylogs;
                } else {
                    return Observable.throw({message: 'No user is logged in'});
                }
            });
    }

    resetRetrieving(): void {
        this.retrieving = false;
    }

    sortDaylogs(): void {
        const dls = this.daylogs;
        this.daylogs = dls
            .sort((a, b) => a.description.toUpperCase() > b.description.toUpperCase() ? 1 : -1);
        this.daylogChanged.next();
    }

    deleteTask(idx: number): void {
        if (this.currentDlogRunning === idx) {
            this.currentDlogRunning = -1;
        }
        if (this.daylogs[idx].dirtyCode === 'A') {
            this.daylogs.splice(idx, 1);
            return;
        }
        this.daylogs[idx].dirtyCode = 'D';
        this.saveDlogs();
    }

    refresh(): void {
        const d = new Date();
        console.log('Refresh at ', d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
        if (this.currentDlogRunning >= 0) {
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
                    if (result.logId != null) {
                        this.daylogs[result.idx].logId = result.logId;
                    }
                    this.daylogs[result.idx].dirtyCode = null;
                });
            }
            if (this.daylogs[i].dirtyCode === 'U') {
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
        return this.http.post('/rest/daylog', JSON.stringify(dl), {headers: this.headers})
            .map((res: Response) => {
                if (res.status >= 400) {
                    throw new Error('Update failed');
                } else {
                    const newDaylog: IDaylog = res.json();
                    return {logId: newDaylog.logId, idx: idx};
                }
            })
            .catch((error) => Observable.throw(error));
    }

    updateDaylog(dl: IDaylog, idx: number): Observable<number> {
        if (dl.logs && dl.logs.length > 0 && dl.logs[dl.logs.length - 1].endTime < 0) {
            dl.logs[dl.logs.length - 1].endTime = null;
        }
        return this.http.put('/rest/daylog/' + dl.logId, JSON.stringify(dl), {headers: this.headers})
            .map((res: Response) => {
                if (res.status >= 400) {
                    throw new Error('Update failed');
                }
                return idx;
            })
            .catch(error => Observable.throw(error));
    }

    deleteDaylog(dl: IDaylog, idx: number): Observable<number> {
        return this.http.delete('/rest/daylog/' + dl.logId, {headers: this.headers})
            .map((res: Response) => {
                if (res.status >= 400) {
                    throw new Error('Delete failed');
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

    markDirty(idx: number): void {
        this.daylogs[idx].dirtyCode = this.daylogs[idx].dirtyCode || 'U';
    }

    addTasklog(log: Tasklog): void {
        if (log.getStartTime() > log.getStopTime()) {
            alert('Start must be before End!!');
            return;
        }
        const tasklog = new Tasklog(log.taskDesc, log.fromHH, log.fromMM, log.fromSS,
            log.comment, log.toHH, log.toMM, log.toSS);
        const tlog: ITimelog = {
            startTime: tasklog.getStartTime(),
            endTime: tasklog.getStopTime(),
            comment: tasklog.comment
        };
        this.adjustOverlap(tlog, log.taskDesc);
        this.saveDlogs();
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

    updateTimelog(log: ITimelog, dlogIdx: number): void {
        this.adjustOverlap(log, this.daylogs[dlogIdx].description);
        this.saveDlogs();
        this.daylogChanged.next();
        this.updateTimelines.next();
    }

    copyPreviousDays(): Observable<any> {
        return this.http.get('/rest/task/' + this.daysBack(), {headers: this.headers})
            .map((resp: Response) => {
                const tasks: string[] = resp.json().tasks;
                for (let i = 0; i < tasks.length; i++) {
                    let found: boolean = false;
                    for (let j = 0; j < this.daylogs.length && !found; j++) {
                        found = tasks[i].toUpperCase() === this.daylogs[j].description.toUpperCase();
                    }
                    if (!found) {
                        this.daylogs.push(this.newDaylog(this.currentDate, null, this.currentUser.userid, tasks[i], false));
                    }
                }
                this.sortDaylogs();
                this.saveDlogs();
                return 'x';
            });
    }

    daysBack(): string {
        if (!(copyLastDays > 0)) return this.currentDate;
        const today = this.getToday();
        let year = parseInt(today.substr(0, 4), 10);
        let month = parseInt(today.substr(4, 2), 10) - 1;
        let day = parseInt(today.substr(6, 2), 10) - copyLastDays;
        if (day < 1) {
            month = month - 1;
            if (month < 0) {
                month = 11;
                year--;
            }
            day = day + monthDays[month];
        }
        return '' + year + this.utilService.pad(month + 1) + this.utilService.pad(day + 1);
    }

    startRunning(dlogIdx: number): void {
        this.stopRunning();
        this.currentDlogRunning = dlogIdx;
        const timelog: ITimelog = {startTime: this.utilService.getLocalTime(), endTime: -1};
        if (this.daylogs[this.currentDlogRunning] && !this.daylogs[this.currentDlogRunning].logs) {
            this.daylogs[this.currentDlogRunning].logs = [];
        }
        this.daylogs[this.currentDlogRunning].isRunning = true;
        this.daylogs[this.currentDlogRunning].logs.push(timelog);
        this.daylogs[this.currentDlogRunning].dirtyCode = this.daylogs[this.currentDlogRunning].dirtyCode || 'U';
        this.saveDlogs();
    }

    stopRunning(): void {
        if (this.currentDlogRunning >= 0) {
            const now = this.utilService.getLocalTime();
            const dl = this.daylogs[this.currentDlogRunning];
            dl.isRunning = false;
            dl.logs[dl.logs.length - 1].endTime =
                (now > dl.logs[dl.logs.length - 1].startTime) ?
                    now :
                    dl.logs[dl.logs.length - 1].startTime + 1000;
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
        this.daylogs.map((dl, dlidx) => {
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
                    dl.logs.sort((a, b) => {
                        return (a.startTime - b.startTime);
                    });
                    dl.logs = this.optimize(dl.logs);
                }
                dl.dirtyCode = dl.dirtyCode || 'U';
            } else {
                dl.logs.map((l, idx) => {
                    if (log.startTime >= l.startTime && log.startTime <= l.endTime && log.endTime >= l.endTime) {
                        // Overlaps at end, adjust end
                        l.endTime = log.startTime - 1000;
                        dl.dirtyCode = dl.dirtyCode || 'U';
                    } else {
                        if (log.endTime >= l.startTime && log.endTime <= l.endTime && log.startTime <= l.startTime) {
                            // Overlaps at begin, adjust start
                            l.startTime = log.endTime + 1000;
                            dl.dirtyCode = dl.dirtyCode || 'U';
                        } else {
                            if (log.startTime >= l.startTime && log.endTime <= l.endTime) {
                                // in between, cut log in 2
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

    addTask(): void {
        const exists = this.getDaylogForTask('New...');
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
            this.saveDlogs();
            this.daylogChanged.next();
        }
    }

    deleteLog(dlIndex: number, tlIndex: number): void {
        this.daylogs[dlIndex].logs.splice(tlIndex, 1);
        this.daylogs[dlIndex].dirtyCode = this.daylogs[dlIndex].dirtyCode || 'U';
        this.saveDlogs();
        this.daylogChanged.next();
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
        return {logDate, logId, userId, description, isRunning, dirtyCode: 'A', updateFlag: true, logs: []};
    }

    // ----------      All kind of getters      --------
    getSec(): number {
        const dat = new Date();
        return dat.getMinutes() * 60 + dat.getSeconds();
    }

    getDirty(idx: number): string {
        return this.daylogs[idx].dirtyCode;
    }

    getTasklist(): string[] {
        if (!this.daylogs) {
            this.retrieveDaylogs();
        }
        return this.daylogs
            .map((dl) => dl.description);
    }

    getToday(): string {
        return moment().format('YYYYMMDD');
    }

    getCurrentDate(): string {
        this.currentDate = this.currentDate || this.getToday();
        return this.currentDate;
    }

    getCurrentDt(): string {
        this.getCurrentDate();
        return this.currentDate.substring(0, 4) + '-' +
            this.currentDate.substring(4, 6) + '-' +
            this.currentDate.substring(6, 8);
    }

    getDaylogs(): IDaylog[] {
        return this.daylogs;
    }

    getDaylogForTask(description: string): IDaylog[] {
        return this.daylogs.filter(dl => {
            return dl.description === description && dl.logDate === this.currentDate;
        });
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
        return barWidth;
    }

    getDetails(tlog: ITimelog): string {
        return this.getStartStr(tlog) + ' - ' +
            this.getEndStr(tlog) +
            ' (' + this.getDurationStr(tlog) + ') ' +
            tlog.comment;
    }

}
