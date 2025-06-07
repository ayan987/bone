import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { CreateClientsComponent } from '../create-clients/create-clients.component';
import { ClientListComponent } from './client-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('ClientListComponent', () => {
  let component: ClientListComponent;
  let fixture: ComponentFixture<ClientListComponent>;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientListComponent],
      providers: [
        { provide: ToastrService, useClass: ToastrService },
        {
          provide: MatDialog,
          useValue: '',
        },
      ],
      imports: [HttpClientTestingModule, ToastrModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientListComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call dialog.open and handle afterClosed when createClients is called', () => {
    // arrange
    const dialogConfig = {
      panelClass: 'create-modal',
      width: '500px',
      height: '500px',
      disableClose: true,
    };

    const afterClosedResult = 'yes';
    const afterClosedSpy = jasmine.createSpyObj('afterClosed', ['subscribe']);
    afterClosedSpy.subscribe.and.callFake((callback: any) =>
      callback(afterClosedResult)
    );

    const dialogSpy = jasmine.createSpyObj('dialog', ['open']);
    dialogSpy.open.and.returnValue({ afterClosed: () => afterClosedSpy });

    component.dialog = dialogSpy;

    spyOn(component, 'getAllClientList');

    // act
    component.createClients();

    // assert
    expect(dialogSpy.open).toHaveBeenCalledWith(
      CreateClientsComponent,
      dialogConfig
    );
    expect(afterClosedSpy.subscribe).toHaveBeenCalled();
    expect(component.getAllClientList).toHaveBeenCalled();
  });

  it('should fetch all clients and update the data source', fakeAsync(() => {
    // arrange
    const mockClients = [
      {
        id: 1,
        shortName: 'Client 1',
        legalName: 'CLient Legal name',
        status: 'Active',
      },
    ];
    spyOn(component.client, 'getAllClients').and.returnValue(
      of({ status: 200, body: mockClients }) as any
    );

    // act
    component.getAllClientList();
    tick(); // Simulate passage of time

    // assert
    expect(component.isLoading).toBeFalse();
    expect(component.client.getAllClients).toHaveBeenCalled();
    expect(component.dataSource).toEqual(mockClients as any);
  }));

  //Edit client test case
  it('should open dialog and call get Client by id when editClient is called', () => {
    // arrange
    const id = '1';
    const mockResponse = {
      status: 200,
      body: {
        id: 1,
        shortName: 'Client 1',
        legalName: 'Client Legal name',
        status: 'Active',
      },
    };

    const afterClosedResult = 'yes';
    const afterClosedSpy = jasmine.createSpyObj('afterClosed', ['subscribe']);
    afterClosedSpy.subscribe.and.callFake((callback: any) =>
      callback(afterClosedResult)
    );

    const dialogSpy = jasmine.createSpyObj('dialog', ['open']);
    dialogSpy.open.and.returnValue({ afterClosed: () => afterClosedSpy });

    component.dialog = dialogSpy;
    spyOn(component.client, 'getClientById').and.returnValue(
      of(mockResponse) as any
    );

    spyOn(component, 'getAllClientList');

    // act
    component.editClient(id);

    // assert
    expect(component.client.getClientById).toHaveBeenCalledWith(id);
    expect(component.dialog.open).toHaveBeenCalledWith(CreateClientsComponent, {
      panelClass: 'create-modal',
      width: '500px',
      height: '500px',
      disableClose: true,
      data: mockResponse.body,
    });
    expect(afterClosedSpy.subscribe).toHaveBeenCalled();
    expect(component.getAllClientList).toHaveBeenCalled();
  });

});
