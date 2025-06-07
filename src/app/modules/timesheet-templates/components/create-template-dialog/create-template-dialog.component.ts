import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { TemplateStatus } from '../../../../models/template-status';
import { ConfirmModalComponent } from '../../../shared/modals/confirm-modal/confirm-modal.component';
import { Messages } from '../../../../models/message-enum';
import { TimesheetTemplateService } from '../../../shared/services/timesheet-template/timesheet-template.service';
import { TimesheetTemplate } from '../../../../models/timesheet-template';

/**
 * Custom validator to ensure JSON input is valid and meets specific criteria.
 * Validates that:
 * - Input is valid JSON
 * - JSON is an object (not an array)
 * - Object has at least one key-value pair
 * - No empty keys exist
 *
 * @returns ValidatorFn that returns null if valid, or an error object if invalid
 */
function jsonValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) return { required: true };

    try {
      const parsed = JSON.parse(control.value);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { invalidJson: true };
      }

      const keys = Object.keys(parsed);
      if (keys.length === 0) {
        return { emptyJson: true };
      }
      if (keys.some(key => key.trim() === '')) {
        return { emptyKey: true };
      }
    } catch (e) {
      return { invalidJson: true };
    }
    return null;
  };
}

/**
 * Component for creating and editing timesheet templates.
 *
 * This component provides a dialog interface for users to:
 * - Create new timesheet templates
 * - Edit existing timesheet templates
 * - Upload Excel files
 * - Define JSON mappings for Excel templates
 */
@Component({
  selector: 'app-create-template-dialog',
  templateUrl: './create-template-dialog.component.html',
  styleUrls: ['./create-template-dialog.component.scss']
})
export class CreateTemplateDialogComponent implements OnInit {

  /** Currently selected Excel file */
  selectedFile: File | null = null;

  /** Loading state for async operations */
  isLoading = false;

  /** Path of the uploaded file in storage */
  uploadedFilePath: string = '';

  /** ID of the uploaded file */
  uploadedFileId: string = '';

  /** Error message for file-related operations */
  fileError: string | null = null;

  /** Initial form values for dirty checking */
  initialFormValues: any = {};

  /**
   * Form group for template creation/editing.
   * Contains controls for:
   * - Template name (required, 3-100 characters)
   * - Excel file (required)
   * - JSON mapping (required, must be valid JSON)
   * - Status (Active/Inactive)
   * - Filename
   */
  createTemplateForm = this.fb.group({
    id: [''],
    templateName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ]
    ],
    file: [null as File | null, [Validators.required]],
    json: ['', [Validators.required, jsonValidator()]],
    status: [TemplateStatus.Active],
    filename: [''],
    filenameWithoutExtension: ['', [Validators.minLength(3)]],
    url: ['']
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateTemplateDialogComponent>,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private timesheetTemplateService: TimesheetTemplateService
  ) {
    // Initialize form with default JSON structure
    const defaultJson = {
      "ABRUF_NO": "",
      "ABRUF_NAME": "",
      "PROJECT_NAME": "",
      "CLIENT":"",
      "RES_PROJECTLEAD": "",
      "MON_YYYY": "",
      "CONSULTANT": "",
      "PO_NO": "",
      "PG_NAME": "",
      "TOTAL_HOURS": "",
      "EDITABLE_CELL_RANGES": "B17:B47, D17:D47, A61",
      "ROW_INSERTION": "false",
      "HOLIDAY_MARKER": "A, B, C, D",
      "MAN_DAYS": "",
      "DAY1_DATE": "",
      "DAY1_HOURS": "",
      "CITY_END_DAY": "",
      "DAY1_DESCRIPTION": ""
    };
    this.createTemplateForm.patchValue({
      json: JSON.stringify(defaultJson, null, 2)
    });
  }

  /**
   * Initializes the component.
   * - Sets up form for editing if data is provided
   * - Initializes form value tracking
   */
  ngOnInit(): void {
    if (this.data) {
      // Populate form with existing template data for editing
      this.patchTemplateValues({
        ...this.data,
        json: JSON.stringify(this.data.timesheetHeaderData, null, 2)
      });
      // Create a dummy file object to represent the existing file
      this.selectedFile = new File([], this.data.filename);
      // Remove the required validator when editing
      this.createTemplateForm.get('file')?.clearValidators();
      this.createTemplateForm.get('file')?.updateValueAndValidity();
    }
    // Store initial form values for dirty checking
    this.initialFormValues = this.createTemplateForm.value;

    // Subscribe to form value changes to track dirty status
    this.createTemplateForm.valueChanges.subscribe(() => {
      this.updateDirtyStatus();
    });
  }

  /**
   * Updates the form's dirty status by comparing current values with initial values.
   */
  updateDirtyStatus(): void {
    const currentFormValues = this.createTemplateForm.value;
    const isDirty = !this.deepCompare(this.initialFormValues, currentFormValues);
    if (isDirty) {
      this.createTemplateForm.markAsDirty();
    } else {
      this.createTemplateForm.markAsPristine();
    }
  }

  /**
   * Deeply compares two objects for equality.
   *
   * @param obj1 First object to compare
   * @param obj2 Second object to compare
   * @returns True if objects are equal, false otherwise
   */
  deepCompare(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  /**
   * Patches form values with provided template data.
   *
   * @param template Template data to patch into the form
   */
  patchTemplateValues(template: any): void {
    this.createTemplateForm.patchValue({
      id: template.id,
      templateName: template.templateName,
      json: template.json,
      status: template.status,
      filename: template.filename,
      url: template.url
    });
  }

  /**
   * Closes the dialog, prompting the user if there are unsaved changes.
   *
   * @param isClosed Boolean indicating if the dialog should be closed
   */
  closeDialog(isClosed: boolean): void {
    if (this.createTemplateForm.dirty) {
      // Open confirmation dialog if there are unsaved changes
      let dialogRef = this.dialog.open(ConfirmModalComponent, {
        panelClass: 'edit-modal',
        width: '445px',
        height: '220px',
        disableClose: true,
        data: [Messages.closeConfirm, '']
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close(isClosed);
    }
  }

  /**
   * Handles file selection from input.
   * - Updates form with file details
   * - Validates filename length (without extension)
   * - Shows appropriate error messages
   *
   * @param event File input change event
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      // Clear errors when new file is selected
      this.fileError = null;
      this.createTemplateForm.get('filenameWithoutExtension')?.setErrors(null)


      // Validate file extension
      if (!this.validateFileExtension(this.selectedFile)) {
        this.fileError = 'Invalid file type. Please select an Excel file (.xlsx).';
        return; // Exit if the file type is invalid
      }

      const filenameWithoutExtension = this.selectedFile.name.replace(/\.[^/.]+$/, "");

      this.createTemplateForm.patchValue({
        file: this.selectedFile,
        filenameWithoutExtension: filenameWithoutExtension
      });
    }
  }

  /**
   * Validates the file extension.
   *
   * @param file The file to validate
   * @returns True if the file extension is valid, false otherwise
   */
  validateFileExtension(file: File): boolean {
    const validExtensions = ['.xlsx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return validExtensions.includes(`.${fileExtension}`);
  }

  /**
   * Programmatically triggers the file input click. This is needed for the custom upload button
   */
  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      this.renderer.selectRootElement(fileInput).click();
    }
  }

  /**
   * Handles form submission.
   * Determines whether to:
   * - Create new template
   * - Update existing template
   * - Upload new file during edit
   */
  saveOrEditData(): void {
    if (this.data === null) {
      // Create new template
      this.uploadFile();
    } else {
      if (this.selectedFile && this.selectedFile.name !== this.data.filename) {
        // Upload new file and edit existing template
        this.uploadFileAndEdit();
      } else {
        // Edit existing template without uploading a new file
        this.editTemplateData(this.data.id, this.createTemplateForm?.value as TimesheetTemplate);
      }
    }
  }

  /**
   * Uploads a new file for template creation.
   * - Handles duplicate file errors
   * - Updates template data after successful upload
   */
  uploadFile(): void {
    if (this.selectedFile) {
      this.isLoading = true;
      // Clear previous file error
      this.fileError = null;
      this.timesheetTemplateService.uploadFile(this.selectedFile)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (response) => {
            const fullPath = response.headers.get('Location');
            this.uploadedFileId = fullPath?.split('/').pop() || '';
            this.uploadedFilePath = response.body;
            this.updateTemplateData();
          },
          error: (error) => {
            console.error('Error uploading file:', error);
            if (error.status === 409) {
              this.fileError = 'Excel File Name already exists in OneDrive';
              this.toastr.error(this.fileError);
            } else {
              this.toastr.error(error.error?.detail || 'Failed to upload file');
            }
          }
        });
    }
  }

  /**
   * Uploads a new file during template editing.
   * - Handles duplicate file errors
   * - Updates template with new file information
   */
  uploadFileAndEdit(): void {
    if (this.selectedFile) {
      this.isLoading = true;
      // Clear previous file error
      this.fileError = null;
      this.timesheetTemplateService.uploadFileForEdit(this.selectedFile)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (response) => {
            const fullPath = response.headers.get('Location');
            this.uploadedFileId = fullPath?.split('/').pop() || '';
            this.uploadedFilePath = response.body;

            // Prepare updated template data
            const templateData: TimesheetTemplate = {
              id: this.data.id,
              templateName: this.createTemplateForm.get('templateName')?.value || '',
              filename: this.selectedFile!.name,
              url: this.uploadedFilePath,
              timesheetHeaderData: JSON.parse(this.createTemplateForm.get('json')?.value || ''),
              status: this.createTemplateForm.get('status')?.value || ''
            };

            this.editTemplateData(this.data.id, templateData);
          },
          error: (error) => {
            console.error('Error uploading file:', error);
            if (error.status === 409) {
              this.fileError = 'Excel File Name already exists in OneDrive';
              this.toastr.error(this.fileError);
            } else {
              this.toastr.error(error.error?.detail || 'Failed to upload file');
            }
          }
        });
    }
  }

  /**
   * Updates template data after successful file upload.
   * - Sends template name and JSON mapping to server
   * - Handles success/error responses
   */
  updateTemplateData(): void {
    const headerData = {
      templateName: this.createTemplateForm.get('templateName')?.value || '',
      timesheetHeaderData: JSON.parse(this.createTemplateForm.get('json')?.value || '')
    };

    this.isLoading = true;
    this.timesheetTemplateService.updateTemplateData(this.uploadedFileId, headerData)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.toastr.success('Template created successfully');
            this.dialogRef.close(true);
          }
        },
        error: (error) => {
          console.error('Error updating template:', error);
          this.toastr.error(error.error?.message || 'Failed to update template');
        }
      });
  }

  /**
   * Updates existing template data.
   * - Updates template information in database
   * - Handles success/error responses
   *
   * @param templateId ID of template to update
   * @param formData Updated template data
   */
  editTemplateData(templateId: string, formData: TimesheetTemplate): void {
    const templateData: TimesheetTemplate = {
      id: templateId,
      templateName: formData.templateName,
      filename: formData.filename || this.data.filename,
      url: formData.url || this.data.url,
      timesheetHeaderData: JSON.parse(this.createTemplateForm.get('json')?.value || '{}'),
      status: formData.status
    };

    this.isLoading = true;
    this.timesheetTemplateService.editTemplateData(templateId, templateData)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          if (res && res.status === 200) {
            this.dialogRef.close(true);
            this.toastr.success('Template updated successfully');
          }
        },
        error: (err) => {
          console.error('Error updating template:', err);
          this.toastr.error(err.error?.detail || 'Failed to update template');
        }
      });
  }
}
