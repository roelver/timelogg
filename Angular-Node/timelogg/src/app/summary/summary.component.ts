import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

const styles: string = require('./summary.component.css').toString();

@Component({
  selector: 'tl-summary',
  templateUrl: 'summary.component.html',
  styles: [styles]
})
export class SummaryComponent implements OnInit {

  constructor(private _router: Router) {}

  ngOnInit(): void {
  }

  onNavigate(): void {
     this._router.navigate(['/entry']);
  }

}
