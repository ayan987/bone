import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';

import { MatCardModule } from '@angular/material/card';

import { MatDialog } from '@angular/material/dialog';
import { ProjectListComponent } from './project-list.component';
import { CreateProjectComponent } from '../create-project/create-project.component';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ProjectService } from '../../services/project/project.service';

describe('ProjectListComponent', () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;
  let dialog: MatDialog;
  let projectService: any;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectListComponent],
      providers: [MatDialog],
      imports: [
        MatCardModule,
        MatMenuModule,
        MatIconModule,
        HttpClientModule,
        ToastrModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();


    fixture = TestBed.createComponent(ProjectListComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    projectService = TestBed.inject(ProjectService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the create project dialog', () => {
    spyOn(dialog, 'open').and.callThrough();
    component.openCreateProjectDialog();
    expect(dialog.open).toHaveBeenCalledWith(CreateProjectComponent, {
      width: '500px',
      height: '585px',
    });
  });

  //Project overview
  it('should display the project overview table', () => {
    const table = document.getElementById('tblProjectOverview');
    expect(table).toBeTruthy();
  });
});
