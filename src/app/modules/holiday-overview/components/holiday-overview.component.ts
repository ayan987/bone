import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { HolidayService } from '../services/holiday.service';
import { Holiday } from '../../../models/holiday';
import { ToastrService } from 'ngx-toastr';

interface Location {
  cityName: string;
  countryCode: string;
}

interface MonthHolidays {
  name: string;
  holidays: {
    day: string;
    name: string;
  }[]
};

@Component({
  selector: 'app-holiday-overview',
  templateUrl: './holiday-overview.component.html',
  styleUrls: ['./holiday-overview.component.scss']
})
export class HolidayOverviewComponent implements OnInit {
  locationCtrl: FormControl = new FormControl('');
  yearCtrl: FormControl = new FormControl('');
  
  currentYear = new Date().getFullYear();
  years = [this.currentYear - 1, this.currentYear, this.currentYear + 1];
  
  months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  monthsData: MonthHolidays[] = this.months.map(month => ({
    name: month,
    holidays: []
  }))

  locations: Location[] = [
    // { cityName: "Kolkata", countryCode: "IN" },
    { cityName: "Nürnberg", countryCode: "DE" },
    { cityName: "Berlin", countryCode: "DE" }
  ];

  @ViewChild('holidayDirective') private holidayDirective!: FormGroupDirective;
  createHolidayForm: FormGroup;
  showCreateForm = false;
  hasHolidays = false;
  disableCopy = false;
  daysInMonth: number[] = [];
  editingHoliday: { month: string; day: string; name: string; id: string } | null = null;
  private currentHolidayId?: string;

  constructor(
    private fb: FormBuilder,
    private holidayService: HolidayService,
    public toastr: ToastrService) {
      this.createHolidayForm = this.fb.group({
        month: ['', [Validators.required]],
        day: [{value: '', disabled: true}, [Validators.required]],
        name: ['', [Validators.required, Validators.maxLength(100)]]
      })
    }

  ngOnInit() {
    this.yearCtrl.setValue(this.currentYear);

    this.locationCtrl.valueChanges.subscribe(() => {
      this.loadHolidays();
    });

    this.yearCtrl.valueChanges.subscribe(() => {
      this.loadHolidays();
      (this.yearCtrl.value === this.currentYear - 1) ? this.disableCopy = true : this.disableCopy = false;
    });

    // Subscribe to month changes to update available days
    this.createHolidayForm.get('month')?.valueChanges.subscribe(month => {
      this.updateDaysInMonth(month);
      month ? this.createHolidayForm.get('day')?.enable() : this.createHolidayForm.get('day')?.disable()
    })
  }

  loadHolidays() {
    const location = this.locationCtrl.value;
    const year = this.yearCtrl.value;
    
    if (!location?.cityName || !year) {
      this.showCreateForm = false;
      return;
    }

    this.showCreateForm = true;

    this.monthsData = this.months.map(month => ({
      name: month,
      holidays: []
    }));

    this.holidayService.getHolidaysByCityAndYear(location.cityName, year)
      .subscribe({
        next: (res: Holiday) => {
          if (!res) {
            // Set the flag to show Copy button if no holidays are created yet for that year
            this.hasHolidays = false;
          } else {
            this.currentHolidayId = res.id;
            this.hasHolidays = res.holidayDates.length > 0;
            if (res.holidayDates) {
              res.holidayDates.forEach(holiday => {
                const monthIndex = parseInt(holiday.month) - 1; // Convert month to 0 based index
                if (this.monthsData[monthIndex]) {
                  this.monthsData[monthIndex].holidays.push({
                    day: holiday.day,
                    name: holiday.name
                  });
                  // Sort holidays by day
                  this.monthsData[monthIndex].holidays.sort((a, b) => parseInt(a.day) - parseInt(b.day));
                }
              });
            }
          }
        },
        error: (err) => {
          console.error('Error loading holidays:', err)
        }
      })
  }

  updateDaysInMonth(monthName: string) {
    const monthIndex = this.months.indexOf(monthName);
    if (monthIndex === -1) {
      this.daysInMonth = [];
      return;
    }

    const year = this.yearCtrl.value;
    const daysCount = new Date(year, monthIndex + 1, 0).getDate();
    this.daysInMonth = Array.from({ length: daysCount }, (_, i) => i + 1)
  }

  createHoliday() {
    if (this.createHolidayForm.invalid) return;

    const location = this.locationCtrl.value;
    const year = this.yearCtrl.value;
    const formValues = this.createHolidayForm.value;
    
    const monthIndex = (this.months.indexOf(formValues.month) + 1).toString().padStart(2, '0');
    const day = formValues.day.toString().padStart(2, '0');

    // Collect all existing holidays
    const existingHolidays = this.monthsData
      .flatMap((month) => month.holidays.map(holiday => ({
        day: holiday.day,
        month: (this.months.indexOf(month.name) + 1).toString().padStart(2, '0'),
        name: holiday.name
      })));

    // Add new holiday
    const newHoliday = {
      day: day,
      month: monthIndex,
      name: formValues.name
    }

    const holidayData = {
      cityName: location.cityName,
      countryCode: location.countryCode,
      year: year,
      holidayDates: [ ...existingHolidays, newHoliday]
    };

    this.holidayService.createHoliday(holidayData).subscribe({
      next: () => {
        this.holidayDirective.resetForm();
        this.createHolidayForm.reset();
        this.toastr.success('Holiday created successfully');
        this.loadHolidays();
      },
      error: (error) => {
        console.error('Error creating holiday:', error);
      }
    });
  }

  copyFromPreviousYear() {
    const location = this.locationCtrl.value;
    const year = this.yearCtrl.value;

    if (!location?.cityName || !year) return;

    const reqBody = {
      cityName: location.cityName,
      countryCode: location.countryCode,
      year: year,
      holidayDates: []
    }

    this.holidayService.copyHoliday(reqBody).subscribe({
      next: () => {
        this.toastr.success('Holidays copied from previous year successfully');
        this.loadHolidays();
      },
      error: (error) => {
        this.toastr.error(error.error.detail)
        console.error('Error copying holidays:', error)
      }
    })
  }

  editHoliday(month: string, holiday: { day: string; name: string }) {
    this.editingHoliday = { month, ...holiday, id: `${month}-${holiday.day}-${holiday.name}` };
    this.updateDaysInMonth(month);
  }

  saveHoliday(month: string, holiday: { day: string; name: string }, newDay: string, newName: string) {
    if ((!newName.trim() || newName === holiday.name) && newDay === holiday.day) {
      this.editingHoliday = null;
      return;
    }

    const location = this.locationCtrl.value;
    const year = this.yearCtrl.value;
    
    // Collect all existing holidays
    const existingHolidays = this.monthsData
      .flatMap((m) => m.holidays.map(h => ({
        day: h === holiday ? newDay : h.day,
        month: (this.months.indexOf(m.name) + 1).toString().padStart(2, '0'),
        name: h === holiday ? newName : h.name
      })));

    const holidayData = {
      cityName: location.cityName,
      countryCode: location.countryCode,
      year: year,
      holidayDates: existingHolidays
    };

    this.holidayService.updateHoliday(this.currentHolidayId!, holidayData).subscribe({
      next: () => {
        this.editingHoliday = null;
        this.toastr.success('Holiday updated successfully')
        this.loadHolidays();
      },
      error: (error) => {
        console.error('Error updating holiday:', error);
      }
    });
  }

  cancelEdit() {
    this.editingHoliday = null;
  }

  deleteHoliday(month: string, holiday: { day: string; name: string }) {
    const location = this.locationCtrl.value;
    const year = this.yearCtrl.value;
    
    // Collect all existing holidays except the one to delete
    const remainingHolidays = this.monthsData
      .flatMap((m) => m.holidays
        .filter(h => !(h.day === holiday.day && m.name === month)) // Remove the holiday to delete
        .map(h => ({
          day: h.day,
          month: (this.months.indexOf(m.name) + 1).toString().padStart(2, '0'),
          name: h.name
        }))
      );

    const holidayData = {
      cityName: location.cityName,
      countryCode: location.countryCode,
      year: year,
      holidayDates: remainingHolidays
    };

    this.holidayService.updateHoliday(this.currentHolidayId!, holidayData).subscribe({
      next: () => {
        this.toastr.success('Holiday deleted successfully')
        this.loadHolidays();
      },
      error: (error) => {
        console.error('Error deleting holiday:', error);
      }
    });
  }
}
