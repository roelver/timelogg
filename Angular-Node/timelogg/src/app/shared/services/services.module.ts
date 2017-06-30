import { NgModule, ModuleWithProviders } from '@angular/core';

import { ErrorService } from './error.service';
import { TimelogService } from './timelog.service';
import { UtilService } from './util.service';

const SERVICES = [
        ErrorService,
        TimelogService,
        UtilService
     ];

@NgModule({
    providers: [
        ...SERVICES
    ]
})
export class ServicesModule {}
