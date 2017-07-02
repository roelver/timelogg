import { Component } from '@angular/core';

@Component({
  selector: 'tl-about',
  template: `
    <h2>About Timelogg</h2>
    <p>Timelogg is a simple Angular2 app to register time on several tasks.</p>
    <p>The Entry page shows the tasks in timeline view. The Summary page shows all tasks in tabular view, with totals per task and per day. </p>
    <p>There are 2 way to record spent time:</p>
        <ul>
            <li>Entry mode - Start/stop the realtime tracker for the task</li>
            <li>Manual mode - Add timelog events at any time in the past</li>
        </ul>
    <p>Use the buttons at the bottom to create new tasks, or copy the tasks you were working on for the last 4 days.</p>
  `
})
export class AboutComponent {

   constructor() {}

}
