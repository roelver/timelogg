import { Routes } from '@angular/router';

import { SignupComponent } from './auth/signup.component';
import { SigninComponent } from './auth/signin.component';
import { AuthGuard } from './auth/auth.guard';

import { EntryComponent } from './entry/entry.component';
import { SummaryComponent } from './summary/summary.component';
import { AboutComponent } from './about/about.component';

declare var System: any;

export const AppRoutes: Routes = [
   { path: '', redirectTo: '/signup', pathMatch: 'full' },
   { path: 'signup', component: SignupComponent },
   { path: 'signin', component: SigninComponent },
   { path: 'entry', component: EntryComponent, canActivate: [AuthGuard] },
   { path: 'summary', component: SummaryComponent, canActivate: [AuthGuard] },
   { path: 'about', component: AboutComponent },
   { path: '404', loadChildren: './+pagenotfound/index#PageNotFoundModule' },
   { path: '**', redirectTo: '/404', pathMatch: 'full' }
];
