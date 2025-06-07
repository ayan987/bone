import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private readonly el: ElementRef) {}

  // Check if the target or one of its ancestors has the ignored class
  private isIgnored(target: HTMLElement): boolean {
    return !!target.closest('.mat-mdc-autocomplete-panel');
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: HTMLElement): void {
    const clickedInside = this.el.nativeElement.contains(targetElement);

    if (this.isIgnored(targetElement)) {
      return;
    }
    // Debug log to ensure the directive is working:
    // console.log('Clicked element:', targetElement, 'Inside:', clickedInside);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
