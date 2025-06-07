import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { FormBuilder, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TimesheetLabelsService } from '../../services/timesheet-labels/timesheet-labels.service';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

interface LabelItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-timesheet-labels',
  templateUrl: './timesheet-labels.component.html',
  styleUrls: ['./timesheet-labels.component.scss']
})
export class TimesheetLabelsComponent implements OnInit, OnChanges {
  @Input() assignedLabelsObj!: { timesheetId: string; labels: LabelItem[] };
  @ViewChild(MatAutocompleteTrigger) matAutocompleteTrigger!: MatAutocompleteTrigger;
  @ViewChild('labelInput') labelInput!: ElementRef<HTMLInputElement>;
  isVisible: boolean = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  timesheetLabels: LabelItem[] = [];
  masterTimesheetLabels: LabelItem[] = [];
  filteredLabels: LabelItem[] = [];
  labelForm = this.fb.group({
    currentLabel: ['',[Validators.minLength(2), Validators.maxLength(20)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly timesheetLabelsService: TimesheetLabelsService,
    private readonly announcer: LiveAnnouncer,
    public toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.labelForm.get('currentLabel')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value: any) => {
        this.applyFilter(value);
      });

    this.getAllTimesheetLabels();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.assignedLabelsObj) {
      this.timesheetLabels = this.assignedLabelsObj.labels ?? [];
    } else {
      this.timesheetLabels = [];
    }
    const currentSearchTerm = this.labelForm.get('currentLabel')?.value ?? '';
    this.applyFilter(currentSearchTerm);
  }

  /**
   * Fetch all possible labels from an API and store them in masterTimesheetLabels.
   */
  getAllTimesheetLabels(): void {
    this.timesheetLabelsService.getAllLabels().subscribe({
      next: (response: any) => {
        this.masterTimesheetLabels = response.body || [];
        // Filter once we have data
        const currentSearchTerm = this.labelForm.get('currentLabel')?.value ?? '';
        this.applyFilter(currentSearchTerm);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  /**
   * Called when user types in the input or after assignedLabels changes,
   * to filter out already selected labels & match search text.
   */
  applyFilter(searchTerm: string): void {
    const query = searchTerm.toLowerCase();

    this.filteredLabels = this.masterTimesheetLabels
      // Remove labels that are already in timesheetLabels
      .filter(m => !this.timesheetLabels.some(t => t.id === m.id))
      // Filter by the typed text
      .filter(m => m.label.toLowerCase().includes(query));
  }

  /**
   * Show the input field (dropdown).
   */
  showLabelField(event: MouseEvent): void {
    event.stopPropagation();
    this.isVisible = true;
    setTimeout(() => {
      // Focus the input:
      this.labelInput?.nativeElement.focus();

      // If you also want to select all existing text in the input:
      this.labelInput?.nativeElement.select();
    }, 0);
  }

  /**
   * Hide the input field (dropdown) when clicked outside.
   */
  onOutsideClick(): void {
    this.isVisible = false;
  }

  /**
   * Called when the user presses Enter or a separator key inside the input
   * to create a new label from the typed text.
   */
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value && (this.timesheetLabels.some((item: any) => item.label === value) || this.masterTimesheetLabels.some((item: any) => item.label === value)) ) {
      this.toastr.warning("Label already exists");
    }else if (value && this.labelForm.valid) {
      const newLabel: LabelItem = { id: '', label: value };
      // Optionally call your API to create/assign the new label
      this.addLabelsToTimsheetApi({ labels: [newLabel] });
    }

    // Clear the form field
    this.labelForm.patchValue({ currentLabel: '' });
    this.applyFilter('');
  }

  /**
   * Called when a user removes a chip from the timesheetLabels array.
   */
  remove(labelObj: LabelItem): void {
    const index = this.timesheetLabels.findIndex(item => item.id === labelObj.id);
    if (index >= 0) {
      this.removeLabelsFromTimsheetApi(labelObj.id);
      this.timesheetLabels.splice(index, 1);
      this.announcer.announce(`Removed ${labelObj.label}`);
      // Re-filter so the removed label appears in the dropdown again
      const currentSearchTerm = this.labelForm.get('currentLabel')?.value ?? '';
      this.applyFilter(currentSearchTerm);
    }
  }

  removeAllLabel(fullLabelObj: LabelItem[]): void {
    // 1. If nothing to remove, just return
    if (!fullLabelObj || fullLabelObj.length === 0) {
      return;
    }

    // 3. Call the backend for each label removal
    const removalCalls = fullLabelObj.map(label =>
      this.timesheetLabelsService.removeLabelsFromTimsheet(
        this.assignedLabelsObj.timesheetId,
        label.id
      )
    );

    // 4. Use forkJoin to run them all in parallel and handle the final result
    forkJoin(removalCalls).subscribe({
      next: (results) => {
        // Each item in `results` corresponds to one successful removal response
        this.timesheetLabels = this.timesheetLabels.filter(
          label => !fullLabelObj.some(toRemove => toRemove.id === label.id)
        );
        const currentSearchTerm = this.labelForm.get('currentLabel')?.value ?? '';
        this.applyFilter(currentSearchTerm);
        console.log('All labels removed successfully:', results);
      },
      error: (err) => {
        console.error('Error removing labels:', err);
      }
    });
  }

  /**
   * Called when an autocomplete option is selected from the dropdown.
   */
  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedItem = event.option.value as LabelItem;

    // Only add if not already in timesheetLabels
    if (!this.timesheetLabels.some(label => label.id === selectedItem.id)) {
      this.addLabelsToTimsheetApi({ labels: [selectedItem] });
    }

    // Reset the input
    this.labelForm.patchValue({ currentLabel: '' });
    this.applyFilter('');
  }

  checkOption(event: any) {
    // this prevents the click event to get to the autocomplete component
    event.stopPropagation();
}

  /**
   * Example API call to assign labels to a timesheet.
   */
  addLabelsToTimsheetApi(newLabels: { labels: LabelItem[] }): void {
    if (!this.assignedLabelsObj?.timesheetId) return;
    this.timesheetLabelsService.assignLabelsToTimsheet(
      this.assignedLabelsObj.timesheetId,
      newLabels
    ).subscribe({
      next: (response: any) => {
        if (response.status === 200 || response.status === 201) {
          const responseBody = response.body.labels;
          const getLabelData = responseBody?.filter((item: any) => item.label === newLabels.labels[0]?.label);
          this.timesheetLabels.push(getLabelData[0]);
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  removeLabelsFromTimsheetApi(labelId: string): void {
    if (!this.assignedLabelsObj?.timesheetId) return;
    this.timesheetLabelsService.removeLabelsFromTimsheet(
      this.assignedLabelsObj.timesheetId,
      labelId
    ).subscribe({
      next: (response: any) => {
        if (response.status === 200 || response.status === 201) {
          console.log('Label removed successfully');
        }
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }
}
