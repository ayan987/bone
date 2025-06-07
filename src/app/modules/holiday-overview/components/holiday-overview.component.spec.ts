import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayOverviewComponent } from './holiday-overview.component';

describe('HolidayOverviewComponent', () => {
  let component: HolidayOverviewComponent;
  let fixture: ComponentFixture<HolidayOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HolidayOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HolidayOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
