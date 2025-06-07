// highlight.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'textHighlight' })
export class TexthighlightPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(text: any, search: string): SafeHtml {
    if (text == null) return ''; // Handle null/undefined
    const inputText = String(text); // Convert number/boolean/etc. to string

    if (!search) return inputText;
    // escape RegExp chars in search
    const esc = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const re = new RegExp(esc, 'gi');

    // wrap matches in <strong>
    const highlighted = inputText.replace( re, (match) => `<strong>${match}</strong>` );
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
