import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCreateEndClientComponent } from './dialog-create-end-client.component';

describe('DialogCreateEndClientComponent', () => {
  let component: DialogCreateEndClientComponent;
  let fixture: ComponentFixture<DialogCreateEndClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogCreateEndClientComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogCreateEndClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
