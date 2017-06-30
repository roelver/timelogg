export class Tasklog {

   constructor(public taskDesc: string,
               public fromHH: number,
               public fromMM: number,
               public fromSS: number = 0,
               public comment: string = '',
               public toHH: number = 0,
               public toMM: number = 0,
               public toSS: number = 0) {
      this.taskDesc = taskDesc;
      this.fromHH = fromHH;
      this.fromMM = fromMM;
      this.fromSS = fromSS;
      this.toHH = toHH;
      this.toMM = toMM;
      this.toSS = toSS;
      this.comment = comment;
   }

   getDuration(): number {
      return this.getStopTime() - this.getStartTime();
   }

   getStartTime(): number {
      return ((this.fromHH ? this.fromHH : 0) * 60 * 60 * 1000) +
             ((this.fromMM ? this.fromMM : 0) * 60 * 1000) +
             ((this.fromSS ? this.fromSS : 0) * 1000);
   }

   getStopTime(): number {
      return ((this.toHH ? this.toHH : 0) * 60 * 60 * 1000) +
             ((this.toMM ? this.toMM : 0) * 60 * 1000) +
             ((this.toSS ? this.toSS : 0) * 1000);
   }
   setStartTime(millis: number): void {

   }

   setStopTime(millis: number): void {

   }
}
