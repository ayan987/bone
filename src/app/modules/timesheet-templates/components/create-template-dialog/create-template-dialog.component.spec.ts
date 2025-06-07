import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTemplateDialogComponent } from './create-template-dialog.component';

describe('CreateTemplateDialogComponent', () => {
  let component: CreateTemplateDialogComponent;
  let fixture: ComponentFixture<CreateTemplateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateTemplateDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateTemplateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
