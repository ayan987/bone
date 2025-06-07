import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_MODULES } from './material.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorHandlerInterceptor } from './interceptor/error-handler.interceptor';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DateFormat } from '../../models/date-format';
import { ToastrModule } from 'ngx-toastr';
import { UploadProgressOverlayComponent } from './components/upload-progress-overlay/upload-progress-overlay.component';
import { ConfirmModalComponent } from './modals/confirm-modal/confirm-modal.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { RestrictDateDirective } from './directives/restrictdate.directive';
import { DeleteModalComponent } from './modals/delete-modal/delete-modal.component';
import { InfoModalComponent } from './modals/info-modal/info-modal.component';
import { MatDialogRef } from '@angular/material/dialog';
import { DecimalRestrictionDirective } from './directives/decimal.directive';
import { JwtInterceptor } from './interceptor/jwt.interceptor';
import { CopyToClipboardDirective } from './directives/copy-to-clipboard.directive';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { ScrollTrackerDirective } from './directives/scroll-tracker.directive';
import { CustomDateFormatPipe } from '../../pipes/customDate-pipe';
import { DecimalToCommaPipe } from '../../pipes/decimal-to-comma-pipe';
import { TimeAgoPipe } from '../../pipes/timeAgo-pipe';
import { StatusToColorPipe } from '../../pipes/statusColor-pipe';
import { ImportWarningCountPipe } from '../../pipes/import-warning-count.pipe';
import { TexthighlightPipe } from '../../pipes/text-highlight.pipe';
import { GermanToEnglishDatePipe } from '../../pipes/german-to-english-date.pipe';
@NgModule({
  declarations: [UploadProgressOverlayComponent, ConfirmModalComponent, RestrictDateDirective, DeleteModalComponent,
    CustomDateFormatPipe, InfoModalComponent, DecimalToCommaPipe, DecimalRestrictionDirective, ClickOutsideDirective, ScrollTrackerDirective, CopyToClipboardDirective, TimeAgoPipe, StatusToColorPipe, ImportWarningCountPipe, TexthighlightPipe, GermanToEnglishDatePipe],
  imports: [
    CommonModule,
    MAT_MODULES,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastrModule.forRoot(),
  ],
  exports: [
    MAT_MODULES,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    UploadProgressOverlayComponent,
    RestrictDateDirective,
    CustomDateFormatPipe,
    InfoModalComponent,
    DecimalToCommaPipe,
    DecimalRestrictionDirective,
    ClickOutsideDirective,
    ScrollTrackerDirective,
    CopyToClipboardDirective,
    TimeAgoPipe,
    StatusToColorPipe,
    ImportWarningCountPipe,
    TexthighlightPipe,
    GermanToEnglishDatePipe
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlerInterceptor, multi: true },
    { provide: DateAdapter, useClass: MomentDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: DateFormat },
    { provide: MatDialogRef, useValue: {} },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        { provide: MAT_DATE_FORMATS, useValue: DateFormat },
      ],
    };
  }
}
