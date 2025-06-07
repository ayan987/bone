import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appDecimalRestriction]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DecimalRestrictionDirective,
      multi: true
    }
  ]
})
export class DecimalRestrictionDirective implements ControlValueAccessor {
  private onChange!: (val: string | null) => void;
  private onTouched!: () => void;
  private value!: string | null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) { }

  @HostListener('input', ['$event.target.value'])
  onInputChange(value: string) {
    // Check if the value is empty (user deleted the entire value)
    if (value === '') {
      this.updateTextInput(null, this.value !== null);
      return;
    }

    // Remove non-numeric characters except commas
    let sanitizedValue = value.replace(/[^\d,]/g, '');

    //Remove the leading zero in the input fields
    sanitizedValue = sanitizedValue.replace(/^0+(?=\d)/, '');

    // If there is more than one comma, remove the last one
    const commaCount = sanitizedValue.split(',').length - 1;
    if (commaCount > 1) {
      const lastCommaIndex = sanitizedValue.lastIndexOf(',');
      sanitizedValue = sanitizedValue.slice(0, lastCommaIndex) + sanitizedValue.slice(lastCommaIndex + 1);
    }

    // If there are more than two digits after the comma, remove the last one
    const parts = sanitizedValue.split(',');
    if (parts.length > 1 && parts[1].length > 2) {
      parts[1] = parts[1].slice(0, -1);
      sanitizedValue = parts.join(',');
    }

    const numericValue = parseFloat(sanitizedValue.replace(/,/g, '.'));

    // Check if the numeric value is within the specified range
    if (!isNaN(numericValue)) {
      this.updateTextInput(sanitizedValue, this.value !== sanitizedValue);
    } else {
      // If the value is out of range, revert to the previous value
      this.updateTextInput(this.value, false);
    }
  }


  @HostListener('blur')
  onBlur() {
    this.onTouched();
  }

  private updateTextInput(value: string | null, propagateChange: boolean) {
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
    if (propagateChange) {
      this.onChange(value);
    }
    this.value = value;
  }

  // ControlValueAccessor Interface
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }

  writeValue(value: any): void {
    value = value ? String(value) : null; // Convert to string
    this.updateTextInput(value, false);
  }
}
