import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[scrollTracker]'
})
export class ScrollTrackerDirective {
  @Output() scrollingFinished = new EventEmitter<void>();

  emitted = false;
  private isBeyond80 = false;

  // @HostListener("window:scroll", ['$event.target'])
  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    const target = event.target as HTMLElement;

    // The distance the user has scrolled from the top
    const scrollTop = target.scrollTop;

    // The total scrollable height
    const scrollHeight = target.scrollHeight;

    // The height of the visible area
    const clientHeight = target.clientHeight;

    // Calculate how far along the user is (0 to 1)
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    // const isNowBeyond80 = scrollPercentage >= 0.8;

    // if (!this.isBeyond80 && isNowBeyond80) {
    //   this.scrollingFinished.emit();
    // }

    // this.isBeyond80 = isNowBeyond80;
    // Check if we've passed the 80% mark
    if (!this.emitted && scrollPercentage >= 0.8) {
      this.emitted = true;
      this.scrollingFinished.emit();
    }
  }

  public resetEightyPercentGuard() {
    this.emitted = false;
  }
  // public onScroll(): void {
  //   console.log('Scrolling detected');
    // if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.emitted) {
    //   this.emitted = true;
    //   this.scrollingFinished.emit();
    //   console.log('Scroll finished');
    // } else if ((window.innerHeight + window.scrollY) < document.body.offsetHeight) {
    //   this.emitted = false;
    // }
  // }
}
