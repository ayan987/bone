import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FilterCriteria } from '../../../../models/active-consultant-filter';
import { ActiveConsultant } from '../../../../models/timesheet-consultant';
import { ActiveConsultantService } from '../../services/active-consultant/active-consultant.service';
import { HttpResponse } from '@angular/common/http';
import { TimesheetTabEnum } from '../../../../models/Timesheettab.enum';

@Component({
  selector: 'app-active-consultants',
  templateUrl: './active-consultants.component.html',
  styleUrl: './active-consultants.component.scss'
})
export class ActiveConsultantsComponent implements OnInit {
  tableHead: string = TimesheetTabEnum.activeConsultant;
  @Output() activeTab = new EventEmitter<any>();

  isLoading = false;
  dataSource: ActiveConsultant[] = [];
  selectedMonthYear: string = '';

  constructor(private activeConsultantService: ActiveConsultantService) { }

  ngOnInit() {
    this.selectedMonthYear = this.getCurrentMonth();
    const filterCriteria: FilterCriteria = {};
    filterCriteria.month = parseInt(this.selectedMonthYear.split('-')[1], 10);
    filterCriteria.year = parseInt(this.selectedMonthYear.split('-')[0], 10);
    this.getAllActiveConsultants(filterCriteria);
  }

  getAllActiveConsultants(filter: FilterCriteria): void {
      this.isLoading = true;
      this.activeConsultantService.getAllActiveConsultants(filter).subscribe({
        next: (response: HttpResponse<ActiveConsultant[]>) => {
          if (response.status === 200) {
            this.dataSource = response.body || [];
            this.dataSource = this.dataSource.filter((timesheet: ActiveConsultant) => timesheet.poNo !== null);
            this.isLoading = false;
          }
        },
        error: (err: any) => {
          console.log(err);
          this.isLoading = false;
        },
      });
  }

    getCurrentMonth(): string {
      const today = new Date();
      const year = today.getFullYear();
      let month: number | string = today.getMonth() + 1;
      if (month < 10) {
        month = '0' + month;
      }

      return `${year}-${month}`;
    }

    onActiveTabChange(tabIndex: number): void {
      this.activeTab.emit(tabIndex);
    }
}
