import {Component, OnInit, OnDestroy} from '@angular/core';
import {TimelogService} from '../shared/services/timelog.service';
import {Subscription} from 'rxjs/Subscription';
import {IDaylog} from '../../models/daylog';
import moment = require('moment');
import {ITimelog} from '../../models/timelog';

const styles: string = require('./summary.component.css').toString();

@Component({
    selector: 'tl-summary',
    templateUrl: 'summary.component.html',
    styles: [styles]
})
export class SummaryComponent implements OnInit, OnDestroy {

    dt: string;

    currentDate: string; // dt in fmt YYYYMMDD

    allDaylogs: IDaylog[];
    daylogsChangedSubscription: Subscription;
    retrieveDaylogsSubscription: Subscription;

    constructor(private tlogService: TimelogService) {
    }

    ngOnInit(): void {
        this.currentDate = this.tlogService.getCurrentDate(); // format YYYYMMDD
        this.dt = this.tlogService.getCurrentDt(); // format YYYY-MM-DD

        this.retrieveDaylogsSubscription = this.tlogService.retrieveDaylogs().subscribe((daylogs) => {
            this.allDaylogs = daylogs;
        });
        this.daylogsChangedSubscription = this.tlogService.daylogChanged.subscribe(() => {
            this.allDaylogs = this.tlogService.getDaylogs();
        });
    }

    ngOnDestroy(): void {
        if (this.retrieveDaylogsSubscription) {
            this.retrieveDaylogsSubscription.unsubscribe();
        }
        if (this.daylogsChangedSubscription) {
            this.daylogsChangedSubscription.unsubscribe();
        }
    }

    onDateChange(newDate: string): void {
        this.dt = newDate;
        this.currentDate = newDate.replace(/-/g, '');
        this.tlogService.setCurrentDate(this.currentDate);
    }

    taskDuration(idx: number): string {
        let sum = 0;
        for (let i = 0; i < this.allDaylogs[idx].logs.length; i++) {
            sum += this.tlogService.getDuration(this.allDaylogs[idx].logs[i]);
        }
        return this.tlogService.getParticlesStr(sum);
    }

    totalDuration(): string {
        let sum = 0;
        for (let j = 0; j < this.allDaylogs.length; j++) {
            for (let i = 0; i < this.allDaylogs[j].logs.length; i++) {
                sum += this.tlogService.getDuration(this.allDaylogs[j].logs[i]);
            }
        }
        return this.tlogService.getParticlesStr(sum);
    }

    // Temp. for displaying the daylogs
    getStartStr(tlog: ITimelog): string {
        return this.tlogService.getStartStr(tlog);
    }

    getEndStr(tlog: ITimelog): string {
        return this.tlogService.getEndStr(tlog);
    }

    getDurationStr(tlog: ITimelog): string {
        // To prevent and exception
        if (tlog.endTime <= 0) {
            return 'Running';
        } else {
            return this.tlogService.getDurationStr(tlog);
        }
    }

}
