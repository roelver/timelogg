import {Component, OnInit, Input, ViewChild, OnDestroy} from '@angular/core';
import {IDaylog, ITimelog} from '../../../models';
import {TimelogService} from '../../shared/services/timelog.service';
import {ResizeEvent} from 'angular-resizable-element';
import {ContextMenuComponent} from 'ngx-contextmenu';
import {Subscription} from 'rxjs/Subscription';

const styles: string = require('./timelinebar.component.css').toString();

@Component({
    selector: 'tl-timelinebar',
    templateUrl: 'timelinebar.component.html',
    styles: [styles]
})
export class TimelinebarComponent implements OnInit, OnDestroy {

    @Input()
    idx: number;

    @Input()
    myTlog: ITimelog;

    @Input()
    miDlogIdx: number;

    @Input()
    updateFlag: boolean;

    isResizing: boolean = false;
    updateSubscription: Subscription;

    left: string;
    width: string;
    details: string;

    @ViewChild('optionMenu') public optionMenu: ContextMenuComponent;

    constructor(private tlogService: TimelogService) {
    }

    ngOnInit(): void {
        this.updateProperties();
        this.updateSubscription = this.tlogService.updateTimelines.subscribe(() => this.updateProperties());
    }

    ngOnDestroy(): void {
        if (this.updateSubscription) {
            this.updateSubscription.unsubscribe();
        }
    }

    updateProperties(): void {
        this.left = '' + this.tlogService.getBarLeftPosition(this.myTlog) + 'px';
        this.width = '' + this.tlogService.getBarWidth(this.myTlog) + 'px';
        this.details = this.tlogService.getDetails(this.myTlog);
    }

    onDelete(event: any): void {
        this.tlogService.deleteLog(this.miDlogIdx, this.idx);
    }

    onResizeStart(event: ResizeEvent): void {
        this.isResizing = true;
    }

    onResizeEnd(event: ResizeEvent): void {
        this.isResizing = false;
        this.myTlog = this.tlogService.onResize(event.edges, this.myTlog);
        this.tlogService.updateTimelog(this.myTlog, this.miDlogIdx);
    }

    onValidateResize(): boolean {
        return true;
    }

    markDirty(): void {
        this.tlogService.markDirty(this.miDlogIdx);
    }

}
