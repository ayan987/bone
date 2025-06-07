import { ValidatorFn, AbstractControl, FormGroup, ValidationErrors, FormArray } from "@angular/forms";

export class CustomValidators {
  public static uniqueControlValidator(controlName: any): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const formArray: any = control as FormGroup;
      const controls = formArray.controls.map((clt: FormGroup) => clt.get(controlName));
      const controlValues = controls.map((ctrl: AbstractControl) => ctrl.value);

      const uniqueControls = new Set(controlValues);
      const hasDuplicates = controlValues.length !== uniqueControls.size;

      controls.forEach((ctrl: AbstractControl) => {
        if (hasDuplicates && controlValues.filter((v: any) => v === ctrl.value).length > 1) {
          ctrl.setErrors({ 'duplicate': true });
        } else {
          const errors = ctrl.errors;
          if (errors) {
            delete errors['duplicate'];
            if (Object.keys(errors).length === 0) {
              ctrl.setErrors(null);
            }
          }
        }
      });

      return hasDuplicates ? { 'duplicate': true } : null;
    };
  }

  public static dateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDateControl = control.get('startDate');
      const endDateControl = control.get('endDate');

      if (!startDateControl || !endDateControl) {
        return null;
      }

      const startDate = startDateControl.value;
      const endDate = endDateControl.value;

      if (startDate && endDate && startDate > endDate) {
        endDateControl.setErrors({ ...endDateControl.errors, endDateBeforeStartDate: true });
        return { endDateBeforeStartDate: true };
      } else if (endDateControl.errors){
          const { endDateBeforeStartDate, ...otherErrors } = endDateControl.errors;
          endDateControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      }

      return null;
    };
  }

  public static dateExceedValidator(arrayName: any, control1: any, control2: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const abrufs = control.get(arrayName) as FormArray;

      if (!abrufs) {
        return null;
      }

      let hasError = false;

      abrufs.controls.forEach((group: AbstractControl) => {
        const startDateControl = group.get(control1);
        const endDateControl = group.get(control2);

        if (startDateControl && endDateControl) {
          const startDate = startDateControl.value;
          const endDate = endDateControl.value;

          if (startDate && endDate && startDate > endDate) {
            endDateControl.setErrors({ ...endDateControl.errors, endDateBeforeStartDate: true });
            hasError = true;
          } else if (endDateControl.errors) {
            const { endDateBeforeStartDate, ...otherErrors } = endDateControl.errors;
            endDateControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
          }
        }
      });

      return hasError ? { endDateBeforeStartDate: true } : null;
    };
  }

  static dateRangeValidator(startControlName: string, endControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startControl = formGroup.get(startControlName);
      const endControl = formGroup.get(endControlName);

      if (startControl && endControl) {
        const startDate = new Date(startControl.value);
        const endDate = new Date(endControl.value);

        if (startControl.errors && !startControl.errors['endBeforeStart']) {
          return null;
        }

        if (endControl.errors && !endControl.errors['endBeforeStart']) {
          return null;
        }

        if (startDate && endDate && startDate > endDate) {
          endControl.setErrors({ endBeforeStart: true });
          endControl.setErrors({ ...endControl.errors, endBeforeStart: true });
          return { dateRange: true };
        } else {
          startControl.setErrors(null);
          endControl.setErrors(null);
          return null;
        }
      }
      return null;
    };
  }

  public static minDateValidator(minDateString: string): ValidatorFn {
    const minDate = CustomValidators.parseDateString(minDateString);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!minDate) {
        console.error('Invalid minDate provided');
        return null; // Invalid minDate, skip validation
      }

      const controlDate = new Date(control.value);
      if (isNaN(controlDate.getTime())) {
        return null; // Not a valid date in the control
      }

      return controlDate < minDate ? { poStartDateError: true } : null;
    };
  }

  public static maxDateValidator(minDateString: string): ValidatorFn {
    const minDate = CustomValidators.parseDateString(minDateString);
    return (control: AbstractControl): ValidationErrors | null => {
      if (!minDate) {
        console.error('Invalid minDate provided');
        return null; // Invalid minDate, skip validation
      }

      const controlDate = new Date(control.value);
      if (isNaN(controlDate.getTime())) {
        return null; // Not a valid date in the control
      }

      return controlDate > minDate ? { poEndDateError: true } : null;
    };
  }

  public static parseDateString(dateString: string): Date | null {
    const [day, month, year] = dateString.split('.').map(part => parseInt(part, 10));
    if (!day || !month || !year) {
      return null; // Invalid date format
    }
    return new Date(year, month - 1, day); // JavaScript Date uses 0-indexed months
  }

  public static uniqueEmailValidator(formArray: AbstractControl): ValidationErrors | null {
    const controls = (formArray as FormArray).controls;
    const emails = controls.map(ctrl => ctrl.get('email')?.value?.trim().toLowerCase() ?? '');
    let hasDuplicates = false;

    // Clear previous errors
    controls.forEach(ctrl => {
      const errors = ctrl.get('email')?.errors;
      if (errors) {
        delete errors['duplicateEmail'];
        if (Object.keys(errors).length === 0) {
          ctrl.get('email')?.setErrors(null);
        } else {
          ctrl.get('email')?.setErrors(errors);
        }
      }
    });

    emails.forEach((email, idx) => {
      if (!email) return;
      // Check if this email appears elsewhere
      if (emails.indexOf(email) !== idx) {
        hasDuplicates = true;
        const errors = controls[idx].get('email')?.errors || {};
        errors['duplicateEmail'] = true;
        controls[idx].get('email')?.setErrors(errors);
      }
    });

    return hasDuplicates ? { duplicateEmails: true } : null;
  }
}
