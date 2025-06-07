import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[restrictDate]'
})
export class RestrictDateDirective {

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    // Allow only specified keys
    if (!allowedKeys.includes(event.key)) {
      event.preventDefault(); // Prevent the default action (typing)
    }
  }


}
