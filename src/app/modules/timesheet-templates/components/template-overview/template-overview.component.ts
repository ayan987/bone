import { Component, OnDestroy, OnInit } from '@angular/core';
import { TemplateStatus } from '../../../../models/template-status';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CreateTemplateDialogComponent } from '../create-template-dialog/create-template-dialog.component';
import { TimesheetTemplateService } from '../../../shared/services/timesheet-template/timesheet-template.service';
import { TimesheetTemplate } from '../../../../models/timesheet-template';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DeleteModalComponent } from '../../../shared/modals/delete-modal/delete-modal.component';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { PoService } from '../../../shared/services/po/po.service';

/**
 * Component for displaying and managing timesheet templates.
 *
 * This component provides an overview of all timesheet templates,
 * allowing users to create, edit, and delete templates.
 */
@Component({
  selector: 'app-template-overview',
  templateUrl: './template-overview.component.html',
  styleUrls: ['./template-overview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class TemplateOverviewComponent implements OnInit, OnDestroy {
  /** Subject to manage unsubscription on component destroy */
  private readonly destroy$ = new Subject<void>();

  /** Data source for the template table */
  dataSource: TimesheetTemplate[] = [];

  /** Columns to be displayed in the template table */
  displayedColumns: string[] = ['templateName', 'status', 'action'];

  /** Active and Inactive template statuses */
  Active = TemplateStatus.Active;
  Inactive = TemplateStatus.Inactive;

  /** Track the row ID that had an error for animation */
  errorRowId: string | null = null;
  isLoading: boolean = false;

  /**
   * Constructor for TemplateOverviewComponent.
   *
   * @param dialog - MatDialog instance for opening dialogs
   * @param _templateService - Service for managing timesheet templates
   * @param toastr - ToastrService instance for displaying notifications
   */
  constructor(
    public dialog: MatDialog,
    private _templateService: TimesheetTemplateService,
    private _poService: PoService,
    private toastr: ToastrService,
    public dialogRefConfirm: MatDialogRef<DeleteModalComponent>,
  ) {}

  /**
   * Initializes the component.
   * Fetches all templates when the component is loaded.
   */
  ngOnInit(): void {
    this.getAllTemplates();
  }

  /**
   * Cleans up subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Fetches all timesheet templates from the server.
   * Filters out templates with null or empty names and statuses.
   */
  getAllTemplates() {
    this.isLoading = true;
    this._templateService.getAllTemplates()
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res) => {
          // Filter out entries with null templateName or status
          this.dataSource = res.filter((template: TimesheetTemplate) =>
            template.templateName != null &&
            template.templateName !== '' &&
            template.status != null
          );
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error fetching templates:', err);
          this.toastr.error(err.error?.message || 'Failed to fetch templates');
        }
    });
  }

  /**
   * Opens a dialog to create a new template.
   * Refreshes the template list upon dialog closure if a new template was created.
   */
  createTemplate() {
    let dialogRef = this.dialog.open(CreateTemplateDialogComponent, {
      panelClass: 'create-modal',
      width: '1000px',
      height: '715px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllTemplates();
      }
    });
  }

  /**
   * Initiates the editing process for a specific template.
   *
   * @param id - The ID of the template to edit
   */
  editTemplate(id: string) {
    this.getTemplateById(id);
  }

  /**
   * Fetches a specific timesheet template by its ID.
   * Opens a dialog to edit the template if found.
   *
   * @param id - The ID of the template to retrieve
   */
  getTemplateById(id: string): void {
    this._templateService.getTemplateById(id).subscribe({
      next: (res) => {
        if (res.status === 200) {
          let dialogRef = this.dialog.open(CreateTemplateDialogComponent, {
            panelClass: 'create-modal',
            width: '1000px',
            height: '715px',
            disableClose: true,
            data: {... res.body, id},
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.getAllTemplates();
            }
          });
        }
      },
      error: (err) => {
        console.error('Error fetching template by ID:', err);
        this.toastr.error('Failed to fetch template details');
      }
    });
  }

  /**
   * Initiates the deletion process for a specific timesheet template.
   *
   * This method first checks if the specified template is assigned to any purchase orders (POs).
   * If the template is assigned, an error message is displayed in a toastr notification,
   * and the corresponding row in the table will shake to indicate the error.
   * If the template is not assigned, a confirmation dialog is opened to confirm the deletion.
   * Upon confirmation, the template is deleted, and a success message is displayed.
   *
   * @param id - The ID of the template to delete.
   *
   * @returns void
   *
   * @throws {Error} Handles errors that may occur during the check for template assignment
   *                 or the deletion process, displaying appropriate toastr notifications.
   */
  deleteTemplateById(id: string): void {
    // First, check if the template is assigned to a PO
    this._poService.checkTemplateDelete(id).subscribe({
      next: res => {
        if (res) {
          const poNumbers = res.split(':')[1].trim();
          this.toastr.error(`Template cannot be deleted because it is assigned to the following POs: ${poNumbers}`);
          this.errorRowId = id;

          // Reset errorRowId after a short delay to allow for multiple clicks
          setTimeout(() => {
            this.errorRowId = null; // Reset after shaking
          }, 1000); // Adjust the duration as needed (1000ms = 1 second)
          return; // Exit the method if the template is assigned
        }

        const dialogRef = this.dialog.open(ConfirmModalComponent, {
          data: [Messages.deleteTemplateMessage, Messages.deleteTemplateTitle]
        });

        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            this._templateService.deleteTemplate(id).subscribe({
              next: res => {
                this.toastr.success(Messages.deleteTemplateSuccess);
                this.getAllTemplates();
              },
              error: err => {
                this.toastr.error(Messages.deleteTemplateError)
                console.error('Error deleting template: ', err)
              }
            })
          }
        })
      },
      error: err => {
        console.error(err);
        this.toastr.error(Messages.deleteTemplateError)
      }
    });
  }
}
