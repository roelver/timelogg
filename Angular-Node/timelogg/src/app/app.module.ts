import { BrowserModule  } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { ResizableModule } from 'angular-resizable-element';

// App component
import { AppComponent } from './app.component';

// Routing
import { AppRoutes } from './app.routing';

// Shared components
import { SharedModule } from './shared/shared.module';

import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { SignupComponent } from './auth/signup.component';
import { SigninComponent } from './auth/signin.component';

import { EntryModule } from './entry/entry.module';
import { SummaryComponent } from './summary/summary.component';
import { AboutComponent } from './about/about.component';

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,
        ResizableModule,
        // App modules
        SharedModule,
        EntryModule,
        RouterModule.forRoot(AppRoutes)
    ],
    declarations: [
        AppComponent,
        SignupComponent,
        SigninComponent,
        SummaryComponent,
        AboutComponent
    ],
    providers: [
      AuthService,
      AuthGuard,
   ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {}
