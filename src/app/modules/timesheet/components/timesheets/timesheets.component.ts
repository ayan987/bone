import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrl: './timesheets.component.scss'
})
export class TimesheetsComponent {
  selectedTabIndex = 0;
  
  constructor() {
    const selectedTabIndex = localStorage.getItem('selectedTimesheetTabIndex');
    if (selectedTabIndex) {
      this.selectedTabIndex = parseInt(selectedTabIndex, 10);
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    localStorage.setItem('selectedTimesheetTabIndex', event.index.toString());
  }

  onActiveTabChange(tabIndex: number): void {
    this.selectedTabIndex = tabIndex;
    localStorage.setItem('selectedTimesheetTabIndex', tabIndex.toString());
  }
}
