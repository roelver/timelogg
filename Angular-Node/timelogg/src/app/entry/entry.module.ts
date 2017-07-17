import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ResizableModule } from 'angular-resizable-element';
import { ContextMenuModule } from 'ngx-contextmenu';

import { EntryComponent } from './entry.component';
import { TaskformComponent } from './taskform';
import { TasklineComponent } from './taskline';
import { TimelineComponent, TimelinebarComponent } from './timeline';
import { TimelineareaComponent } from './timelinearea';
import { LogformComponent } from './logform.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ResizableModule,
        ContextMenuModule
    ],
    declarations: [
        EntryComponent,
        LogformComponent,
        TaskformComponent,
        TasklineComponent,
        TimelineComponent,
        TimelinebarComponent,
        TimelineareaComponent
    ]
})
export class EntryModule {}
