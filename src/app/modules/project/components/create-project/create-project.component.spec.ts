import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { CreateProjectComponent } from './create-project.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface Project {
  id: string;
  projectName: string;
  projectDescription: string;
  abrufRequired: boolean;
  status: string;
}

describe('CreateProjectComponent', () => {
  let component: CreateProjectComponent;
  let fixture: ComponentFixture<CreateProjectComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CreateProjectComponent>>;
  let toastr: ToastrService;

  beforeEach(async () => {
    const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', ['close','open']);

    await TestBed.configureTestingModule({
      declarations: [CreateProjectComponent],
      imports: [ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, BrowserAnimationsModule, HttpClientModule,
        ToastrModule.forRoot(), MatCheckboxModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: dialogRefSpyObj },
        { provide: MAT_DIALOG_DATA, useValue: {  } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProjectComponent);
    component = fixture.componentInstance;
    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<CreateProjectComponent>>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable dialog close', () => {
    expect(dialogRefSpy.disableClose).toBeTrue();
  });

  it('should close the dialog when closeDialog is called', () => {
    component.closeDialog(true);
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should close the dialog when closeDialog is called and form is not dirty', () => {
    component.createProjectForm = { dirty: false } as any;
    component.closeDialog(true);
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should create a project and handle success response', () => {
    const mockProject: Project = {
      id: '',
      projectName: 'New Project',
      projectDescription: '',
      abrufRequired: false,
      status: ''
    };
    // Arrange
    const projectServiceSpy = spyOn((component as any).projectService, 'createProject').and.returnValue(of(new HttpResponse<Project>({ status: 201 | 200, body: null })));

    // Act
    component.createProject(mockProject);

    // Assert
    expect(component.isCreatingProject).toBeTrue();
    expect(projectServiceSpy).toHaveBeenCalledWith(mockProject);
  });

  it('should create a project and handle error response', () => {
    const mockProject: Project = {
      id: '',
      projectName: 'New Project',
      projectDescription: '',
      abrufRequired: false,
      status: ''
    };
    // Arrange
    const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
    const projectServiceSpy = spyOn((component as any).projectService, 'createProject').and.returnValue(throwError(errorResponse));

    // Act
    component.createProject(mockProject);

    // Assert
    expect(component.isCreatingProject).toBeFalse();
    expect(projectServiceSpy).toHaveBeenCalledWith(mockProject);
  });

  it('should call createProject when data is null', () => {
    spyOn(component, 'createProject');
    component.data = null;
    component.saveProject();
    expect(component.createProject).toHaveBeenCalledWith(component.createProjectForm.value as Project);
  });

  it('should update the Projeect data and show success toaster', () => {
    // Set createProjectForm to a valid state
    component.createProjectForm = new FormGroup({
      id: new FormControl('1'),
      projectName: new FormControl('Test Short Name'),
      projectDescription: new FormControl('Test Legal Name'),
      abrufRequired: new FormControl(false),
      status: new FormControl('Test Status')
    });

    // Mock the Project service updateProject method
    spyOn((component as any).projectService, 'updateProject').and.returnValue(of({ status: 200 } as any));


    // Mock the toastr service and its success method
    const toastr = { success: jasmine.createSpy('success') };
    (component as any).toastr = toastr;

    // Trigger the editproject method
    component.editProject('1', component.createProjectForm.value as Project);

    // Assert that the showToasterSuccess method is called with the correct message
    expect(toastr.success).toHaveBeenCalledWith('Project updated successfully');
  });

  it('should handle validation errors when form is invalid in edit project', () => {
    const mockProjectId = '123';
    const mockProject: Project = {
      id: '123',
      projectName: 'Updated Project',
      projectDescription: '',
      abrufRequired: false,
      status: ''
    };
    // Arrange
    component.createProjectForm.setErrors({ invalid: true });
    const projectServiceSpy = spyOn((component as any).projectService, 'updateProject');
    const toastrWarningSpy = spyOn((component as any).toastr, 'warning');
    // Act
    component.editProject(mockProjectId, mockProject);
    // Assert
    expect(projectServiceSpy).not.toHaveBeenCalled();
    expect(toastrWarningSpy).toHaveBeenCalledWith('Form has validation errors.');
    expect(component.dialogRef.close).not.toHaveBeenCalled();
  });
});
