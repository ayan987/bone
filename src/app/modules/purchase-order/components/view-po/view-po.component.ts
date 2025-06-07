import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectStatus } from '../../../../models/project-status.enum';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { PoService } from '../../../shared/services/po/po.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AssignConsultantComponent } from '../assign-consultant/assign-consultant.component';
import { TimesheetService } from '../../../shared/services/timesheet/timesheet.service';
import { Util } from '../../../../libraries/Util';

@Component({
  selector: 'app-view-po',
  templateUrl: './view-po.component.html',
  styleUrl: './view-po.component.scss',
})
export class ViewPoComponent {
  isPOLoading = false;
  itemId!: any;
  projectDetails!: any;
  draft = ProjectStatus.draft;
  active = ProjectStatus.active;
  panelOpenState = true;
  po!: any;
  showConsultantCount = 0;
  iscountShown: boolean = false;

  abrufsDetails: any = [];

  constructor(
    private router: Router,
    private poService: PoService,
    private tsService: TimesheetService,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<AssignConsultantComponent>
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.itemId = this.route.snapshot.paramMap.get('id');
    this.getPOById(this.itemId);
    
    // Get pgId from query params
    this.route.queryParams.subscribe(params => {
      const pgId = params['pgId'];
      if (pgId) {
        // Wait for PO data to load before scrolling
        this.poService.getPOById(this.itemId).subscribe({
          next: () => {
            setTimeout(() => {
              const element = document.getElementById(`pg-${pgId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }
        });
      }
    });
  }

  getConsultantCount(event: any): void {
    this.getPOById(this.itemId);
  }

  remainingBudgetApi(pgId: any): void {
    this.updatePgWithTotalHours(this.itemId, pgId);
  }

  getAbrufDetailsById(id: string) {
    const abrufDetail = this.po.abrufDetails.find(
      (detail: any) => detail.id === id
    );
    this.abrufsDetails.push(abrufDetail);
  }

  getPOById(poId: string): void {
    this.isPOLoading = true;
    this.poService.getPOById(poId).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.status === 200) {
          this.po = response.body;
          this.po.deFormattedPoTotalBudget= Util.convertNumberToLocalFormat(this.po?.poTotalBudget);
          this.abrufsDetails = [];
          this.po.abrufs.forEach((abrufId: any) => {
            this.getAbrufDetailsById(abrufId);
          });
          this.isPOLoading = false;
          this.po?.pgs.forEach((pg: any) => {
            this.updatePgWithTotalHours(poId, pg.id);
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('An error occurred:', err.message);
        this.isPOLoading = false;
      },
    });
  }

  goToProjectOverview() {
    this.router.navigate(['/project-overview']);
  }

  private initializeTimesheet(pg: any): void {
    if (!pg.timesheet) {
      pg.timesheet = {
        totalAllocatedOnsiteHours: '0',
        totalAllocatedRemoteHours: '0',
        remainingOnsiteHours: '0',
        remainingOnsiteDays: '0',
        remainingRemoteHours: '0',
        remainingRemotedays: '0',
        warning: false,
      };
    }
  }

  async updatePgWithTotalHours(poId: string, pgId: string): Promise<void> {
    const totalAllocatedTimesheetHours = await this.getTotalAllocatedTimesheetHoursForOnsiteAndRemote(poId, pgId);
    if (totalAllocatedTimesheetHours) {
      const pg = this.po.pgs.find((pg: any) => pg.id === pgId);
      if (pg) {
        this.initializeTimesheet(pg);
        this.updateTimesheet(pg, totalAllocatedTimesheetHours);
        this.updateDeFormattedValues(pg);
      }
    }
  }



  private updateTimesheet(pg: any, totalAllocatedTimesheetHours: any): void {
    this.updateOnsiteHours(pg, totalAllocatedTimesheetHours);
    this.updateRemoteHours(pg, totalAllocatedTimesheetHours);
  }

  private updateOnsiteHours(pg: any, totalAllocatedTimesheetHours: any): void {
    if (Util.isNumeric(pg.totalOnsiteHours) && Util.isNumeric(totalAllocatedTimesheetHours.totalOnsiteHours)) {
      pg.timesheet.totalAllocatedOnsiteHours = Util.convertNumberToLocalFormat(totalAllocatedTimesheetHours.totalOnsiteHours);
      let remainingOnsiteHours = pg.totalOnsiteHours - totalAllocatedTimesheetHours.totalOnsiteHours;
      pg.timesheet.remainingOnsiteHours = Util.convertNumberToLocalFormat(remainingOnsiteHours);
      pg.timesheet.remainingOnsiteDays = Util.convertNumberToLocalFormat(remainingOnsiteHours / 8);
    }
  }

  private updateRemoteHours(pg: any, totalAllocatedTimesheetHours: any): void {
    if (Util.isNumeric(pg.totalRemoteHours) && Util.isNumeric(totalAllocatedTimesheetHours.totalRemoteHours)) {
      pg.timesheet.totalAllocatedRemoteHours = Util.convertNumberToLocalFormat(totalAllocatedTimesheetHours.totalRemoteHours);
      let remainingRemoteHours = pg.totalRemoteHours - totalAllocatedTimesheetHours.totalRemoteHours;
      pg.timesheet.remainingRemoteHours = Util.convertNumberToLocalFormat(remainingRemoteHours);
      pg.timesheet.remainingRemotedays = Util.convertNumberToLocalFormat(remainingRemoteHours / 8);
    }
  }


  private updateDeFormattedValues(pg: any): void {
    pg.deFormattedTotalOnsiteHours = Util.isNumeric(pg.totalOnsiteHours) ? Util.convertNumberToLocalFormat(pg.totalOnsiteHours) : '0,00';
    pg.deFormattedTotalOnsiteDays = Util.isNumeric(pg.totalOnsiteDays) ? Util.convertNumberToLocalFormat(pg.totalOnsiteDays) : '0,00';
    pg.deFormattedTotalRemoteHours = Util.isNumeric(pg.totalRemoteHours) ? Util.convertNumberToLocalFormat(pg.totalRemoteHours) : '0,00';
    pg.deFormattedTotalRemoteDays = Util.isNumeric(pg.totalRemoteDays) ? Util.convertNumberToLocalFormat(pg.totalRemoteDays) : '0,00';
  }
  async getTotalAllocatedTimesheetHoursForOnsiteAndRemote(poId: string,pgId: string): Promise<any> {
    const response: HttpResponse<any> = await this.tsService.getTimesheetTotalsForOnsiteAndRemote(poId, pgId);
    const responsebody = response.body;
    return responsebody;
  }
}
