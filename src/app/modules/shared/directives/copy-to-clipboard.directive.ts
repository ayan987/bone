// src/app/shared/copy-to-clipboard.directive.ts
import { Directive, Input, HostListener } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

@Directive({
  selector: '[applyCopyToClipboard]'
})
export class CopyToClipboardDirective {
  @Input('applyCopyToClipboard') text?: string;

  constructor(
    private readonly clipboard: Clipboard,
    private readonly snackBar: MatSnackBar
  ) {}

  @HostListener('click')
  onClick() {
    if(this.text) {
      this.clipboard.copy(this.text);
      this.snackBar.open('Copied!', '', { duration: 2000 });
    }
  }
}
