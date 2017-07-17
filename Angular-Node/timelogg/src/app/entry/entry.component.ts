import {Component, OnInit, OnDestroy, Input, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from '../auth/auth.service';
import {TimelogService} from '../shared/services/timelog.service';
import {IUser} from '../../models/user';
import {Subscription} from 'rxjs/Subscription';

const styles: string = require('./entry.component.css').toString();

@Component({
    selector: 'tl-entry',
    templateUrl: 'entry.component.html',
    styles: [styles]
})

export class EntryComponent implements OnInit, OnDestroy {

    @Input()
    dt: string;

    currentDate: string; // dt in fmt YYYYMMDD

    tasklist: string[];


    currentUser: IUser;

    loadSubscription: Subscription;
    copySubscription: Subscription;

    @ViewChild('f') manualForm: NgForm;

    @Output()
    hours: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    @Output()
    mins: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
        19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
        36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
        52, 53, 54, 55, 56, 57, 58, 59];

    constructor(private authService: AuthService,
                private tlogService: TimelogService) {
    }

    ngOnInit(): void {
        this.dt = this.tlogService.getCurrentDt();
        this.currentDate = this.tlogService.getCurrentDate();
        this.currentUser = this.authService.getCurrentUser();
        this.tasklist = this.tlogService.getTasklist();
        this.loadSubscription = this.tlogService.daylogChanged.subscribe(() => {
            this.tasklist = this.tlogService.getTasklist();
        });
    }

    ngOnDestroy(): void {
        this.loadSubscription.unsubscribe();
        if (this.copySubscription) {
            this.copySubscription.unsubscribe();
        }
    }

    onCopyRecent(): void {
        // Subscription is required to make the query trigger
        this.copySubscription = this.tlogService.copyPreviousDays().subscribe((data) => {
            this.tasklist = this.tlogService.getTasklist();
        });
    }

    onDateChange(newDate: string): void {
        this.dt = newDate;
        this.currentDate = newDate.replace(/-/g, '');
        this.tlogService.setCurrentDate(this.currentDate); // sync with service that emits the event
    }

    onNewTask(): void {
        this.tlogService.addTask();
    }

    redrawAll(): void {
        this.tlogService.markUpdatedAll();
    }

}
