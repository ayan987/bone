import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveConsultantsComponent } from './active-consultants.component';

describe('ActiveConsultantsComponent', () => {
  let component: ActiveConsultantsComponent;
  let fixture: ComponentFixture<ActiveConsultantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActiveConsultantsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActiveConsultantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
