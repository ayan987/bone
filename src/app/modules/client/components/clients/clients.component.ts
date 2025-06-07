import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent {
  selectedTabIndex = 0;

  constructor() {
    const selectedTabIndex = localStorage.getItem('selectedClientTabIndex');
    if (selectedTabIndex) {
      this.selectedTabIndex = parseInt(selectedTabIndex, 10);
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    localStorage.setItem('selectedClientTabIndex', event.index.toString());
  }
}
