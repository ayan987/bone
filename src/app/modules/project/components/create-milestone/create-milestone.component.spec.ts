import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMilestoneComponent } from './create-milestone.component';

describe('CreateMilestoneComponent', () => {
  let component: CreateMilestoneComponent;
  let fixture: ComponentFixture<CreateMilestoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateMilestoneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateMilestoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
