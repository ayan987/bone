import { ClientProjectService } from './../../../shared/services/client-project/client-project.service';
import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectComponent } from '../create-project/create-project.component';
import { MatSort } from '@angular/material/sort';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ProjectService } from '../../services/project/project.service';
import { ToastrService } from 'ngx-toastr';
import { AssignClientToProjectComponent } from '../assign-client-to-project/assign-client-to-project.component';
import { CreateAbrufComponent } from '../create-abruf/create-abruf.component';
import { firstValueFrom } from 'rxjs';
import { CreatePoDialogComponent } from '../create-po-dialog/create-po-dialog.component';
import { AbrufService } from '../../../shared/services/abruf/abruf.service';
import { DeleteModalComponent } from '../../../shared/modals/delete-modal/delete-modal.component';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { Router } from '@angular/router';
import { ConsultantStatus } from '../../../../models/consultants-status-enum';
import { PoService } from '../../../shared/services/po/po.service';
import { Util } from '../../../../libraries/Util';
import { Modules } from '../../../../models/modules-enum';
import { ProjectStatus } from '../../../../models/project-status.enum';
import { AssignStatusEnum } from '../../../../models/assign-status-enum';
import { CreateMilestoneComponent } from '../create-milestone/create-milestone.component';

export interface Project {
  _id: string;
  name: string;
}

export interface Client {
  _id: string;
  name: string;
  shortName?: string;
}

export interface PO {
  _id: string;
  poNo: string;
  poDate?: string;
  poStartDt?: string;
  poEndDt?: string;
  currency: string;
  comments?: string;
  project?: Project;
  client?: Client;
  abruf?: Abruf;
  pg?: PG[];
  status?: string;
  poBudget?: string;
}

export interface Abruf {
  _id: string;
  abrufName: string;
  abrufNo: string;
}

export interface PG {
  pgId: string;
  pgName: string;
  pgBudget: number;
  remoteRate: string;
  NoOfConsultants: number;
}

export interface ProjectClient {
  project: Project;
  client: Client;
  po: PO[];
}

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent implements OnInit {
  displayedColumns: string[] = ['project', 'client'];
  dataSource: any = [];
  isProjectsLoading = false;
  allClients: any = [];
  remainingHrs: any;
  remainingDays: any;
  remainingMonths: any;
  clipboardTooltip = "Copy to clipboard";

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private projectService: ProjectService,
    private toastr: ToastrService,
    private clientProjectService: ClientProjectService,
    private abrufService: AbrufService,
    private router: Router,
    private poService: PoService
  ) {}

  ngOnInit() {
    this.getAllClientList();
    this.getProjectOverview();
  }

  getPOsAssociatedWithAbruf(project: any, abrufId: any) {
    let result = [];
    for (let po of project.po) {
      if (po.abrufs && po.abrufs.includes(abrufId)) {
        result.push(po);
      }
    }
    return result;
  }

  openCreateProjectDialog() {
    const dialogRef = this.dialog.open(CreateProjectComponent, {
      width: '700px',
      height: '675px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getProjectOverview();
      }
    });
  }

  openCreatePODialog(project?: any) {
    if (!project) {
      project = {};
    }
    project.poId = null;
    const dialogRef = this.dialog.open(CreatePoDialogComponent, {
      width: '1300px',
      height: '700px',
      data: project,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getProjectOverview();
        this.toastr.success('PO created successfully');
      }
    });
  }

  //Method to open the abruf component
  openAddAbrufDialog(projectDetails?: any) {
    const dialogRef = this.dialog.open(CreateAbrufComponent, {
      width: '700px',
      height: '620px',
      disableClose: true,
      // data: projectDetails?._id
      data: { projectId: projectDetails?._id, endClients: projectDetails?.endClients }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getProjectOverview();
      }
    });
  }

  //Method to show the project overview screen
  getProjectOverview(): void {
    this.isProjectsLoading = true;
    this.clientProjectService.getProjectOverview().subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.status === 200) {
          const data = response.body.filter(
            (item: any) =>
              (item.status === ProjectStatus.active ||
              item.status === ProjectStatus.draft)
          );
          data.forEach((item: any) => {
            item.pca = item.pca.filter((pca: any) => pca.status === AssignStatusEnum.active);
          });
          // Sort the data in alphabetical order
          this.dataSource = data.sort((a: any, b: any) =>
            a.projectName.localeCompare(b.projectName)
          );
          this.isProjectsLoading = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isProjectsLoading = false;
        console.log('An error occurred:', err.message);
      },
    });
  }

  viewPODetails(poId: any) {
    this.router.navigate(['/purchase-order/po-details', poId]);
  }

  editPODetails(project: any, poId: string) {
    project.poId = poId;
    const dialogRef = this.dialog.open(CreatePoDialogComponent, {
      width: '1300px',
      height: '700px',
      data: project,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getProjectOverview();
        this.toastr.success('PO updated successfully');
      }
    });
  }

  getAllClientList(): void {
    this.clientProjectService.getAllClients().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.allClients = response.body;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('An error occured', err);
      },
    });
  }

  //Method to get the client name by id in the html
  getClientName(clientId: string): any {
    const data = this.allClients.filter(
      (result: any) => result.id === clientId
    );
    return data[0]?.shortName;
  }

  //Method of assign the client with project
  async openAssignClientToProjectDialog(assignData: any) {
    const response: HttpResponse<Project[]> = await firstValueFrom(
      this.projectService.getProjectById(assignData._id)
    );
    let projectData: any = response.body;
    const dialogRef = this.dialog.open(AssignClientToProjectComponent, {
      width: '600px',
      // height: '700px',
      data: {
        id: projectData.id,
        projectName: projectData.projectName,
        status: projectData.status,
        clients: assignData.pca,
        endClients: projectData.endClients,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getProjectOverview();
      }
    });
  }

  //Method to get project by ID
  editProject(projectId: string, project: any): void {
    this.projectService.getProjectById(projectId).subscribe({
      next: (response: HttpResponse<Project[]>) => {
        if (response.status === 200) {
          let dialogRef = this.dialog.open(CreateProjectComponent, {
            panelClass: 'create-modal',
            width: '700px',
            height: '680px',
            disableClose: true,
            data: [response.body, project],
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.getProjectOverview();
            }
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('An error occurred:', err.message);
      },
    });
  }

  //Method to edit abruf
  editAbruf(pcaId: any, abrufId: any, endClients: any): void {
    this.abrufService.getAbrufById(pcaId, abrufId).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.status === 200) {
          let dialogRef = this.dialog.open(CreateAbrufComponent, {
            panelClass: 'create-modal',
            width: '700px',
            height: '620px',
            disableClose: true,
            data: [pcaId, response.body, endClients],
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.getProjectOverview();
            }
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('An error occurred:', err.message);
      },
    });
  }

  //Method to delete abruf
  deleteAbruf(abrufId: string, abrufNo: string, project: any): void {
    let haspo = false;
    for (let po of project.po) {
      if (po.abrufs && po.abrufs.includes(abrufId) && po.status === 'ACTIVE') {
        haspo = true;
        break;
      }
    }
    if (haspo) {
      let dialogRef = this.dialog.open(DeleteModalComponent, {
        panelClass: 'edit-modal',
        width: '550px',
        height: '250px',
        disableClose: true,
        data: Util.showModalMessages(Modules.Abruf, abrufNo, Messages.deleteAbrufMessage)
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.getProjectOverview();
        }
      });
    } else {
      let dialogRef = this.dialog.open(ConfirmModalComponent, {
        panelClass: 'edit-modal',
        width: '445px',
        height: '220px',
        disableClose: true,
        data: [Messages.deleteAbruf, Messages.deleteAbrufHeading],
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.deleteAbrufApi(abrufId);
        }
      });
    }
  }

  //Api to delete abruf
  deleteAbrufApi(abrufId: any): void {
    this.abrufService.deleteAbruf(abrufId).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.status === 200) {
          this.toastr.success('Abruf deleted successfully');
          this.getProjectOverview();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('An error occurred:', err.message);
      },
    });
  }

  //Method to get consultant count by status
  getConsultantCount(pgsArray: any): any {
    if (pgsArray) {
      const data = pgsArray?.filter(
        (result: any) => result.status === ConsultantStatus.Active
      );
      return data.length;
    }
  }

  deletePODetails(poNo: any, poId: string): void {
    const poIdValue: any = { poId: poId, pgId: '', consultantId: '' };
    this.poService.checkAssignedConsultantToPG(poIdValue).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.body === true && response.status === 200) {
          let dialogRef = this.dialog.open(ConfirmModalComponent, {
            panelClass: 'edit-modal',
            width: '445px',
            height: '220px',
            disableClose: true,
            data: [Messages.deletePo, Messages.deletePoHeading],
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.deletePOApi(poId);
            }
          });
        } else if (response.body === false && response.status === 200) {
          let dialogRef = this.dialog.open(DeleteModalComponent, {
            panelClass: 'edit-modal',
            width: '590px',
            height: '270px',
            disableClose: true,
            data: Util.showModalMessages(Modules.PO, poNo, Messages.deletePoMessage),
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.getProjectOverview();
            }
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
  }

  deletePOApi(poId: any): void {
    this.poService.deletePOById(poId).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.status === 200) {
          this.toastr.success('PO deleted successfully');
          this.getProjectOverview();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('An error occurred:', err.message);
      },
    });
  }

  calculateRemainingBudget(pg: any): void {
    const additionalInfo = pg?.additionalInfo;
    const consultantCount = this.getConsultantCount(pg?.pgConsultants);
    if (!additionalInfo || Object.keys(additionalInfo).length === 0) {
      const remainingHrs = pg.totalOnsiteHours + pg.totalRemoteHours;
      this.setRemainingTime(remainingHrs, consultantCount);
    } else {
      const { pgTotalHours, timesheetTotalHours } =
        this.calculateTotalHours(additionalInfo);
        const remainingHrs = pgTotalHours - timesheetTotalHours;
      this.setRemainingTime(remainingHrs, consultantCount);
    }
  }

  private setRemainingTime(remainingHours: number, pgConsultants: number): void {
    const remainingDays = remainingHours / 8;
    // const remainingMonths = remainingDays / 30;
    const remainingMonths = remainingHours / (160 * pgConsultants); //New billable formula by client
    this.remainingHrs = this.formatRemainingTime(remainingHours);
    this.remainingDays = this.formatRemainingTime(remainingDays);
    this.remainingMonths = this.formatRemainingTime(remainingMonths);
  }

  private calculateTotalHours(additionalInfo: any): {
    pgTotalHours: number;
    timesheetTotalHours: number;
  } {
    let pgTotalHours: number = 0;
    let timesheetTotalHours: number = 0;

    if (additionalInfo.pgWithRemoteAndOnsite === true) {
      let pgTotalOnsiteHours = additionalInfo.pgtotalOnsiteHours;
      let pgTotalRemoteHours = additionalInfo.pgtotalRemoteHours;

      timesheetTotalHours = additionalInfo.totalTimesheetHours;
      pgTotalHours = pgTotalOnsiteHours + pgTotalRemoteHours;
    } else if (additionalInfo.pgWithRemoteAndOnsite === false) {
      pgTotalHours = additionalInfo.pgtotalOnsiteHours;
      timesheetTotalHours = additionalInfo.totalTimesheetOnsiteHours;
    }

    return { pgTotalHours, timesheetTotalHours };
  }

  private formatRemainingTime(remainingValue: number): any {
    let strRemainingValue = Util.convertNumberToLocalFormat(remainingValue);

    return strRemainingValue;
  }

  /*** Delete Project Method */
  deleteProject(ProjectData: any): void {
    const associatedPO = ProjectData.po.filter(
      (item: any) => item.status === ProjectStatus.active
    );
    if (associatedPO.length != 0) {
      this.dialog.open(DeleteModalComponent, {
        panelClass: 'edit-modal',
        width: '590px',
        height: '270px',
        disableClose: true,
        data: Util.showModalMessages(Modules.Project, ProjectData.projectName, Messages.deleteProjectMessages),
      });
    } else {
      let dialogRef = this.dialog.open(ConfirmModalComponent, {
        panelClass: 'edit-modal',
        width: '445px',
        height: '220px',
        disableClose: true,
        data: [Messages.deleteProjectOverview, Messages.deleteProjectHeading],
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.deleteProjectApi(ProjectData._id);
        }
      });
    }
  }

  /*** Delete Project Api Call */
  deleteProjectApi(projectId: string): void {
    this.projectService.deleteProjectById(projectId).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.status === 200) {
          this.toastr.success('Project deleted successfully');
          this.getProjectOverview();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('An error occurred:', err.message);
      },
    });
  }

  /** Create new Milestone */
  openCreateMilestoneDialog(projectDetails?: any): void {
    const dialogRef = this.dialog.open(CreateMilestoneComponent, {
      width: '1200px',
      height: '700px',
      data: projectDetails
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getProjectOverview();
      }
    });
  }

  navigateToPGDetails(poId: string, pgId: string): void {
    this.router.navigate(['/purchase-order/po-details', poId], {
      queryParams: { pgId: pgId }
    });
  }
}
