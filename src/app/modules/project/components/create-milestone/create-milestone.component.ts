import { AfterContentInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AssignStatusEnum } from '../../../../models/assign-status-enum';
import { ClientProjectService } from '../../../shared/services/client-project/client-project.service';
import { AbrufStatus } from '../../../../models/abruf-status-enum';
import { MatSelect } from '@angular/material/select';
import { Util } from '../../../../libraries/Util';
import { ToastrService } from 'ngx-toastr';
import { InfoModalComponent } from '../../../shared/modals/info-modal/info-modal.component';
import { Milestone } from '../../../../models/milestone.model';
import { MilestoneService } from '../../../shared/services/milestone/milestone.service';

@Component({
  selector: 'app-create-milestone',
  templateUrl: './create-milestone.component.html',
  styleUrl: './create-milestone.component.scss',
})
export class CreateMilestoneComponent implements OnInit, AfterContentInit{
  isCreatingMilestone: boolean = false;
  showMilestoneForm: boolean = false;
  showViewMilestone: boolean = false;
  showMilestoneErrorsBtn : boolean = false

  createMilestoneForm = this.fb.group({
    id: [''],
    projectId: [''],
    clientId: [''],
    abrufs: this.fb.array(
      [ this.fb.group({ abruf: ['',[Validators.required]] }), ]
    ),
    abrufId: [''],
    pcaId: [''],
    milestoneName: ['', [Validators.required, Validators.maxLength(700), Validators.minLength(3)]],
    milestoneStartDate: ['', [Validators.required]],
    milestoneEndDate: ['']
  });
  protected _onDestroy = new Subject();
  public projectCtrl: FormControl = new FormControl('', [Validators.required]);
  public projectFilterCtrl: FormControl = new FormControl();
  public filteredProjects: any = new ReplaySubject(1);
  @ViewChild('singleSelect', { static: true }) singleSelect!: MatSelect;
  projectWithClients: any = [];
  filteredAbrufs: any = [];
  viewMilestones: any = [];
  clipboardTooltip = "Copy to clipboard"

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly dialog: MatDialog,
    public dialogRef: MatDialogRef<CreateMilestoneComponent>,
    private readonly clientProjectService: ClientProjectService,
    public toastr: ToastrService,
    private readonly milestoneService: MilestoneService) {}

  ngOnInit(): void {
    this.abrufs.disable();
    this.abrufs.valueChanges.subscribe((abrufData: any) => {
      const abrufId = abrufData[0]?.abruf?.id;
      if(abrufId){
        this.getMilestonesByAbrufId(abrufId);
        this.showViewMilestone = true;
      } else {
        this.showViewMilestone = false;
      }
    });

    this.createMilestoneForm.valueChanges.subscribe(() => {
      if(this.createMilestoneForm.valid){
        this.showMilestoneErrorsBtn = false;
      }
    });
  }

  ngAfterContentInit(): void {
    this.getProjectWithClientAndPopulate();
  }

  getMilestonesByAbrufId(abrufId: string): void {
    this.milestoneService.getMilestoneByAbrufId(abrufId).subscribe({
      next: (response: HttpResponse<Milestone[]>) => {
        if(response.status === 200) {
          this.viewMilestones = response.body ?? [];
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    });
  }

  /** Save the Milestone */
  saveMilestone(): void {
    const milestoneData = this.prepareData();

    if(!this.checkDuplicateMilestone(milestoneData)){
      this.milestoneService.createMilestone(milestoneData).subscribe({
        next: (response: HttpResponse<Milestone[]>) => {
          console.log(response)
          if(response.status === 201) {
            this.toastr.success('Milestone added successfully');
            this.getMilestonesByAbrufId(milestoneData[0]?.abrufId);
            this.showMilestoneForm = !this.showMilestoneForm;

            this.createMilestoneForm.get('milestoneName')?.reset();
            this.createMilestoneForm.get('milestoneStartDate')?.reset();
            this.createMilestoneForm.get('milestoneEndDate')?.reset();
            this.clearValidationOfMilestone();
          }
        },
        error: (err: HttpErrorResponse) => {
          if(err.status === 409) {
            this.toastr.error('Milestone already exists');
            this.createMilestoneForm.get('milestoneName')?.setErrors({ 'duplicateMilestone': true });
          }
          console.log(err);
        }
      });
    } else {
      this.toastr.error('Milestone already exists');
      this.createMilestoneForm.get('milestoneName')?.setErrors({ 'duplicateMilestone': true });
    }
  }

  private checkDuplicateMilestone(milestoneData: Milestone[]): boolean {
    const milestoneName = milestoneData[0].milestoneName;
    const isDuplicate = this.viewMilestones.some((milestone: any) => {
      return milestone.milestoneName === milestoneName;
    });
    return isDuplicate;
  }

  /**Preparing data for the API Call */
  private prepareData() {
    this.createMilestoneForm.get('projectId')?.setValue(this.projectCtrl?.value.projectId);
    this.createMilestoneForm.get('clientId')?.setValue(this.projectCtrl.value.clientId);
    this.createMilestoneForm.get('pcaId')?.setValue(this.projectCtrl.value.id);

    const formValues = this.createMilestoneForm.value;
    const abrufIdString = formValues.abrufs?.map((item: any) => item.abruf.id).join(',') ?? '';

    const formattedData: Milestone = {
      id: formValues.id ?? '',
      pcaId: formValues.pcaId ?? '',
      projectId: formValues.projectId ?? '',
      clientId: formValues.clientId ?? '',
      abrufId: abrufIdString,
      milestoneName: formValues.milestoneName ?? '',
      milestoneStartDate: Util.dateString(this.createMilestoneForm.get('milestoneStartDate')?.value) ?? '',
      milestoneEndDate: Util.dateString(this.createMilestoneForm.get('milestoneEndDate')?.value) ?? ''
    };

    return [formattedData];
  }
  /**Delete Milestone */
  deleteMilestoneModal(milestone: Milestone): void {
    let dialogRef = this.dialog.open(ConfirmModalComponent, {
      panelClass: 'delete-modal',
      width: '445px',
      height: '220px',
      disableClose: true,
      data: [Messages.deleteMilestone, Messages.deleteMilestoneTitle]
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteMilestone(milestone);

      }
    });
  }

  deleteMilestone(milestone: Milestone): void {
    this.milestoneService.deleteMilestone(milestone.id).subscribe({
      next: (response: HttpResponse<Milestone>) => {
        console.log(response)
        if(response.status === 200) {
          this.toastr.success('Milestone deleted successfully');
          this.getMilestonesByAbrufId(milestone.abrufId);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    });
  }
  /** Get Project and client association and populate in the select field*/
  getProjectWithClientAndPopulate() {
    this.getClientProject();

    this.projectFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterProjectWithClients();
      });

    this.projectCtrl.valueChanges.subscribe((selectedValue) => {
      if (selectedValue) {
        this.filterAbrufWithProjectAndClient(
          selectedValue.projectId,
          selectedValue.clientId
        );
      }
    });
  }
  /** Filter Abruf with Project and client */
  filterAbrufWithProjectAndClient(projectId: string, clientId: string): void {
    this.isCreatingMilestone = true;
    this.clientProjectService
      .filterAbrufWithProjectAndClient(projectId, clientId)
      .subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.abrufs.reset();
            if (this.projectCtrl.value?.abrufRequired) {
              this.filteredAbrufs = response.body[0]?.abrufs.filter(
                (abruf: any) =>
                  abruf.status === AbrufStatus.active &&
                  abruf.abrufName !== 'No Abruf'
              );
              this.abrufs.enable();
            } else {
              this.filteredAbrufs = response.body[0]?.abrufs.filter(
                (abruf: any) => abruf.status === AbrufStatus.active
              );
              this.abrufs.enable();
            }
            if (this.filteredAbrufs?.length === 0) {
              this.showNoAbrufModal();
            }
            this.isCreatingMilestone = false;
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('An error occurred:', err.message);
          this.isCreatingMilestone = false;
        },
      });
  }
  /** Get Proejct and client association */
  getClientProject(): void {
    this.isCreatingMilestone = true;
    this.clientProjectService.getAssociatedClientProject().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          response.body = response.body.filter(
            (item: any) => item.status === AssignStatusEnum.active && item.abrufRequired === true
          );
          if (this.data?._id) {
            this.projectWithClients = response.body
              .filter((item: any) => item.projectId === this.data._id)
              .slice();
          } else {
            this.projectWithClients = response.body;
          }
          this.filteredProjects?.next(this.projectWithClients.slice());
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('An error occurred:', err.message);
        this.isCreatingMilestone = false;
      },
    });
  }
  /** Compare the two clients */
  compareClients(client1: any, client2: any): boolean {
    return client1 && client2 ? client2.id === client1.id : client2 === client1;
  }
  /** Get helper method to return the abrufs */
  get abrufs() {
    return this.createMilestoneForm.controls['abrufs'] as FormArray;
  }
  /** Filter Search of the project and clients */
  protected filterProjectWithClients() {
    if (!this.projectWithClients) {
      return;
    }

    let search = this.projectFilterCtrl.value;
    if (!search) {
      this.filteredProjects.next(this.projectWithClients.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    this.filteredProjects.next(
      this.projectWithClients.filter(
        (item: any) =>
          item.projectName.toLowerCase().indexOf(search) > -1 ||
          item.shortName.toLowerCase().indexOf(search) > -1
      )
    );
  }

  /** Close Dialog for the modal */
  closeDialog(): void {
    this.dialogRef.close(false);
  }
  /**No abruf modal */
  showNoAbrufModal() {
    let dialogRef = this.dialog.open(InfoModalComponent, {
      panelClass: 'edit-modal',
      width: '445px',
      height: '220px',
      disableClose: true,
      data: [Messages.noAbrufTextForMilestone, Messages.noAbrufHeading],
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.projectCtrl.reset();
        this.abrufs.disable();
        dialogRef.close(true);
      }
    });
  }
  toggleMilestoneFormArea() {
    this.showMilestoneForm = !this.showMilestoneForm;
  }

  validateDate(): void {
    this.createMilestoneForm.updateValueAndValidity();
  }

  clearValidationOfMilestone(): void {
    this.createMilestoneForm.get('milestoneName')?.clearValidators();
    this.createMilestoneForm.get('milestoneName')?.updateValueAndValidity();

    this.createMilestoneForm.get('milestoneStartDate')?.clearValidators();
    this.createMilestoneForm.get('milestoneStartDate')?.updateValueAndValidity();
    this.showMilestoneErrorsBtn = true;
  }

  restoreValidator(controlName: string): void {
    const control = this.createMilestoneForm.get(controlName);
    if (!control) {
      return;
    }
    if (controlName === 'milestoneName') {
      // Reapply the desired validators on focus
      control.setValidators([Validators.required, Validators.maxLength(700), Validators.minLength(3)]);
      control.updateValueAndValidity();
    } else {
      control.setValidators([Validators.required]);
      control.updateValueAndValidity();
    }
  }
}
