import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil, filter } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

import { ProjectService } from '../../services/project/project.service';
import { EndclientService } from '../../../shared/services/end-client/endclient.service';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { ProjectLocation } from '../../../../models/projectLocation';
import { locationOptions } from '../../data/location-options';
import { ResponsiblePersonDto } from '../../../../models/end-client.model';
import { Project } from '../../../../models/project';
import { EndClient } from '../../../../models/endClient';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  isSaving = false;
  endClientList: EndClient[] = [];
  availablePersons: ResponsiblePersonDto[] = [];

  form = this.fb.group({
    id: [''],
    projectName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^(?!.*<[^>]*>)(?!.*<\/[^>]*>).*$/),
      ],
    ],
    projectDescription: ['', Validators.pattern(/^(?!.*<[^>]*>)(?!.*<\/[^>]*>).*$/)],
    projectLocation: [null as ProjectLocation | null, Validators.required],
    endClientId: [null as string | null, Validators.required],
    responsiblePerson: [null as ResponsiblePersonDto | null, Validators.required],
    abrufRequired: [true],
    status: ['DRAFT'],
  });

  showAbrufMessage = false;
  showPoMessage = false;
  showEndClientMessage = false;
  locationOptions = locationOptions;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private endClientService: EndclientService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<CreateProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: [Project, any] | null
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    // 1. Load end clients
    this.endClientService.getAllEndClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        this.endClientList = resp.body || [];
  
        // If editing, now that we know the list, set availablePersons and patch both controls
        if (this.data) {
          const [proj, extras] : any = this.data;
          // find matching end client and populate persons
          const ec = this.endClientList.find(e => e.id === proj.endClients?.id)!;
          this.availablePersons = ec?.responsiblePersons;
  
          // Now patch both controls in one go
          this.form.patchValue({
            projectName: proj.projectName,
            projectDescription: proj.projectDescription,
            projectLocation: proj.projectLocation,
            endClientId: proj.endClients?.id,
            responsiblePerson: proj.responsiblePerson,
            abrufRequired: proj.abrufRequired,
            status: proj.status
          });
  
          this.patchLocation(proj.projectLocation);
        }
      });
  
    // 2. Bind changes
    this.bindEndClientChange();
    const [proj, extras] : any = this.data;
    this.handleAbrufPoRestrictions(extras);
  }
  

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private bindEndClientChange() {
    this.form
      .get('endClientId')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        filter(id => id !== null)
      )
      .subscribe(id => {
        const ec = this.endClientList.find(x => x.id === id);
        this.availablePersons = ec?.responsiblePersons || [];
        this.form.get('responsiblePerson')!.reset();
      });
  }

  private patchLocation(loc: ProjectLocation) {
    const match = this.locationOptions.find(
      o => o.cityName === loc.cityName && o.countryCode === loc.countryCode
    );
    if (match) {
      this.form.get('projectLocation')!.setValue(match);
    }
  }

  private handleAbrufPoRestrictions(extras: any) {
    const hasActiveAbrufs = extras?.pca?.some((p: any) =>
      p.abrufs.some((a: any) => a.abrufName !== 'No Abruf' && a.status === 'ACTIVE')
    );
    const hasActivePOs = extras?.po?.some((p: any) => p.status === 'ACTIVE');

    if (hasActiveAbrufs || hasActivePOs) {
      this.showAbrufMessage = hasActiveAbrufs;
      this.showPoMessage = hasActivePOs;
      this.showEndClientMessage = true;
      ['abrufRequired', 'endClientId'].forEach(ctrl =>
        this.form.get(ctrl)!.disable()
      );
    }
  }

  comparePRP(a: ResponsiblePersonDto, b: ResponsiblePersonDto) {
    return a?.id === b?.id;
  }

  saveProject() {
    if (this.form.invalid) return;

    this.isSaving = true;
    const f: any = this.form.getRawValue();
    const selected: any = this.endClientList.find(ec => ec.id === f.endClientId)!;
    const payload: Project = {
      ...f,
      endClients: { id: selected.id, name: selected.endClientName },
      responsiblePerson: f.responsiblePerson,
    };

    const call$ = this.data
      ? this.projectService.updateProject(this.data[0].id, payload)
      : this.projectService.createProject(payload);

    call$.subscribe({
      next: (res: HttpResponse<Project>) => {
        this.toastr.success(
          this.data ? 'Project updated' : 'Project created'
        );
        this.dialogRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving = false;
        if (err.status === 409) {
          this.toastr.error('Project already exists');
          this.form.get('projectName')!.setErrors({ duplicate: true });
        }
      },
    });
  }

  closeDialog() {
    if (this.form.dirty) {
      this.dialog
        .open(ConfirmModalComponent, {
          panelClass: 'edit-modal',
          width: '445px',
          height: '220px',
          disableClose: true,
          data: ['Discard changes?', ''],
        })
        .afterClosed()
        .pipe(takeUntil(this.destroy$))
        .subscribe(ok => ok && this.dialogRef.close(false));
    } else {
      this.dialogRef.close(false);
    }
  }
}
