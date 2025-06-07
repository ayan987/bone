import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndClientListComponent } from './end-client-list.component';

describe('EndClientListComponent', () => {
  let component: EndClientListComponent;
  let fixture: ComponentFixture<EndClientListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EndClientListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EndClientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
