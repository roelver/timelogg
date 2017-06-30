import { Injectable } from '@angular/core';

const msDay = 24 * 60 * 60 * 1000;

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

   getLocalTime(): number {
       const now = new Date();
       return ((now.getTime() - (now.getTimezoneOffset() * 60000)) % msDay);

   }
   isToday(dt: string): boolean {
      const today = this.formatDate(new Date()).slice(0, 10).replace(/-/g, '');
      return (today === dt);
   }

   formatDate(dt: Date): string {
      return dt.getFullYear() +
          '-' + this.pad(dt.getMonth() + 1) +
          '-' + this.pad(dt.getDate()) +
          'T' + this.pad(dt.getHours()) +
          ':' + this.pad(dt.getMinutes()) +
          ':' + this.pad(dt.getSeconds()) +
          '.' + (dt.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
          'Z';
   }

   pad(x: number): string {
      if (x < 9) {
         return '0' + x;
      }
      return '' + x;
   }


}
