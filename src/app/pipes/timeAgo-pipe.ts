import {
  Pipe,
  PipeTransform,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

@Pipe({
  name: 'timeAgo',
  pure: false   // <– mark it impure so Angular will check it each CD cycle once scheduled
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {
  private timer: any;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  transform(dateIso?: string): string {
    if (!dateIso) return '';

    const created = new Date(dateIso);
    const now     = new Date();
    const diffMs  = now.getTime() - created.getTime();
    const diffS   = Math.floor(diffMs / 1000);

    let result: string;
    let timeToUpdate = 0;

    if (diffS < 60) {
      result = 'less than a minute ago';
      // schedule next check when it crosses 60s
      timeToUpdate = (60 - diffS) * 1000;
    }
    else if (diffS < 3600) {
      const mins = Math.floor(diffS / 60);
      result = `${mins} min ago`;
      // schedule next check when it crosses into the next minute
      timeToUpdate = (60 - diffS % 60) * 1000;
    }
    else if (diffS < 86400) {
      const hrs = Math.floor(diffS / 3600);
      result = `${hrs} hours ago`;
      // schedule next check when it crosses into the next hour
      timeToUpdate = (3600 - diffS % 3600) * 1000;
    }
    else {
      // older than a day → static German format
      const pad = (n: number) => String(n).padStart(2, '0');
      result =
        `${pad(created.getDate())}.${pad(created.getMonth()+1)}.${created.getFullYear()}` + ` at ` +
        `${pad(created.getHours())}:${pad(created.getMinutes())}`;
      // no further updates needed
      timeToUpdate = 0;
    }

    // clear any existing timer and set a new one
    this._removeTimer();
    if (timeToUpdate > 0) {
      this.timer = setTimeout(() => {
        // ask Angular to check the pipe again
        this.cdr.markForCheck();
      }, timeToUpdate);
    }

    return result;
  }

  ngOnDestroy() {
    this._removeTimer();
  }

  private _removeTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
