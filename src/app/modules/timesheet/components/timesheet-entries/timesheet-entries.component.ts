import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FilterCriteria } from '../../../../models/active-consultant-filter';
import { ActiveConsultantService } from '../../services/active-consultant/active-consultant.service';
import { GeneratedTimesheet } from '../../../../models/generated-timesheet';
import { TimesheetStatus } from '../../../../models/timesheet-status-enum';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TimesheetTabEnum } from '../../../../models/Timesheettab.enum';

@Component({
  selector: 'app-timesheet-entries',
  templateUrl: './timesheet-entries.component.html',
  styleUrl: './timesheet-entries.component.scss'
})
export class TimesheetEntriesComponent implements OnInit {
  tableHead: string = TimesheetTabEnum.viewTimesheet;
  dataSource: GeneratedTimesheet[] = [];
  queuedCount = 0;
  emailQueueCount = 0;
  filterCriteria: FilterCriteria = {};
  noMoreData = false;
  loadingMore = false;

  constructor(private readonly activeConsultantService: ActiveConsultantService) { }

  ngOnInit() {
    this.loadInitialTimesheets();
  }

  /**
   * Loads the initial timesheets.
   */
  loadInitialTimesheets(): void {
    this.filterCriteria.page = 0;
    this.filterCriteria.pageSize = 100;
    this.fetchAndUpdateData(false);
  }

  loadDataOnTimesheetDelete(event: any): void {
    this.fetchAndUpdateData(false);
  }

  /**
   * Loads more timesheets when a scroll event is emitted.
   */
  loadMoreData(event: any): void {
    if (this.loadingMore || this.noMoreData) {
      return;
    }
    this.loadingMore = true;
    // Store the previous page value.
    const previousPage = this.filterCriteria.page ?? 0;
    this.filterCriteria.page = previousPage + 1;
    this.fetchAndUpdateData(true, previousPage);
  }

  /**
   * Applies new filter criteria and resets the data.
   */
  applyNewFilterCriteria(newCriteria: Partial<FilterCriteria>): void {
    this.filterCriteria = { ...newCriteria, page: 0, pageSize: 100 };
    this.dataSource = [];
    this.queuedCount = 0;
    this.emailQueueCount = 0;
    this.fetchAndUpdateData(false);
  }

  /**
   * Consolidated method to fetch timesheets and update data.
   * @param append if true, merge new data with existing; if false, replace the data.
   * @param previousPage optional previous page value (used in load-more scenario)
   */
  private fetchAndUpdateData(append: boolean, previousPage?: number): void {
    this.fetchTimesheets().subscribe({
      next: (newData: GeneratedTimesheet[]) => {
        if (newData.length === 0) {
          // If no data returned, revert to the previous page to prevent further increment.
          if (previousPage !== undefined) {
            this.filterCriteria.page = previousPage;
          }
          this.noMoreData = true;
          setTimeout(() => (this.noMoreData = false), 8000);
        } else {
          this.dataSource = append ? this.mergeTimesheetData(this.dataSource, newData) : newData;
        }
        this.updateQueuedCountAndPoll();
      },
      error: (err: any) => this.handleError(err)
    });
  }

  /**
   * Helper method to call the service and return timesheet data.
   */
  private fetchTimesheets(): Observable<GeneratedTimesheet[]> {
    return this.activeConsultantService.getTimesheets(this.filterCriteria).pipe(
      tap(() => (this.loadingMore = false)),
      map((response: HttpResponse<GeneratedTimesheet[]>) =>
        response.status === 200 ? response.body ?? [] : []
      )
    );
  }

  /**
   * Updates queued count and triggers polling if there are timesheets in queued/started state.
   */
  private updateQueuedCountAndPoll(): void {
    this.queuedCount = this.dataSource.filter(item =>
      item?.statuses?.statusKey === TimesheetStatus.genqueued ||
      item?.statuses?.statusKey === TimesheetStatus.started
    ).length;
    this.emailQueueCount = this.dataSource.filter(item =>
      item?.statuses?.statusKey === TimesheetStatus.emailqueued
    ).length;
    if (this.queuedCount > 0 || this.emailQueueCount > 0) {
      this.startPolling();
    }
  }

  /**
   * Polls for updated timesheet data.
   */
  startPolling(): void {
    // Adjust filter criteria to fetch the complete current set.
    this.filterCriteria.page = 0;
    this.filterCriteria.pageSize = this.dataSource.length;
    setTimeout(() => {
      this.fetchTimesheets().subscribe({
        next: (newData: GeneratedTimesheet[]) => {
          this.dataSource = this.mergeTimesheetData(this.dataSource, newData);
          this.updateQueuedCountAndPoll();
        },
        error: (err: any) => this.handleError(err)
      });
    }, 4000);
  }

  /**
   * Merges existing and incoming timesheet data to update items.
   */
  private mergeTimesheetData(
    existing: GeneratedTimesheet[],
    incoming: GeneratedTimesheet[]
  ): GeneratedTimesheet[] {
    if (incoming.length === 0) {
      return existing;
    }

    const timesheetMap = new Map<string | number, GeneratedTimesheet>();

    // Add all existing items to the map if their id is defined.
    for (const item of existing) {
      if (item.id !== undefined) {
        timesheetMap.set(item.id, item);
      }
    }

    // Process incoming items if their id is defined.
    for (const item of incoming) {
      if (item.id !== undefined) {
        if (timesheetMap.has(item.id)) {
          const existingItem = timesheetMap.get(item.id);
          // Overwrite only if the existing item's status is queued or started.
          if (existingItem &&
              ((existingItem.statuses.statusKey === TimesheetStatus.genqueued ||
              existingItem.statuses.statusKey === TimesheetStatus.started) || (existingItem.statuses.statusKey === TimesheetStatus.emailqueued))) {
            timesheetMap.set(item.id, item);
          }
        } else {
          // Add new items.
          timesheetMap.set(item.id, item);
        }
      }
    }

    // Return the merged items as an array.
    return Array.from(timesheetMap.values());
  }



  /**
   * Handles errors from the timesheet service.
   */
  private handleError(err: any): void {
    console.error(err);
  }
}
