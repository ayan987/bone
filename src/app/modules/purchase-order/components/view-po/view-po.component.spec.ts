import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPoComponent } from './view-po.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CustomDateFormatPipe } from '../../../../customDate-pipe';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

describe('ViewPoComponent', () => {
  let component: ViewPoComponent;
  let fixture: ComponentFixture<ViewPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewPoComponent, CustomDateFormatPipe],
      imports: [HttpClientModule, RouterModule.forRoot([])],
      providers: [{
        provide: MatDialogRef,
        useValue: {}
      }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
