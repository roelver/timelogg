import { Injectable } from '@angular/core';

@Injectable()
export class UtilService {

   constructor() {}

   scrollHorizontal(startHH: number): void {
      const scrollTo = (startHH * 100) - 50;
      const currPos = document.getElementById('scrollview').scrollLeft;
      const currWid = document.getElementById('scrollview').offsetWidth;
      if (scrollTo < currPos || scrollTo > currPos + currWid ) {
         const intv = (scrollTo < currPos ? -20 : 20);
         setTimeout(() => {
             this.doScroll(scrollTo, intv);
         }, 0);
      }
   }

   doScroll(pos: number, interval: number): void {
      const toPos = document.getElementById('scrollview').scrollLeft + interval;
      const currWid = document.getElementById('scrollview').offsetWidth;
      document.getElementById('scrollview').scrollLeft = toPos;
      if ((interval > 0 && toPos < pos && toPos < (2400 - currWid))
         || (interval < 0 && toPos > pos && toPos > 0)) {
         setTimeout(() => {
            this.doScroll(pos, interval);
         }, 10);
      }
   }
}
