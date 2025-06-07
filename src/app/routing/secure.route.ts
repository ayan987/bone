import { Routes } from "@angular/router";

export const SECURE_ROUTES: Routes =[
  {
    path: '',
    data: {title: 'Dashboard'},
    pathMatch:'full',
    redirectTo: 'project-overview'

  },
  {
    path: 'project-overview',
    loadChildren: () => import('../modules/project/project.module').then((m) => m.ProjectModule),
  },
  {
    path: 'clients',
    loadChildren: () => import('../modules/client/clients.module').then((m) => m.ClientsModule),
  },
  {
    path: 'consultants',
    loadChildren: () => import('../modules/consultants/consultants.module').then((m) => m.ConsultantsModule),
  },
  {
    path: 'purchase-order',
    loadChildren: () => import('../modules/purchase-order/purchase-order.module').then((m) => m.PurchaseOrderModule),
  },
  {
    path: 'template-overview',
    loadChildren: () => import('../modules/timesheet-templates/timesheet-templates.module').then((m) => m.TimesheetTemplatesModule),
  },
  {
    path: 'timesheets',
    loadChildren: () => import('../modules/timesheet/timesheet.module').then((m) => m.TimesheetModule),
  },
  {
    path: 'holidays',
    loadChildren: () => import('../modules/holiday-overview/holiday-overview.module').then((m) => m.HolidayOverviewModule)
  }

]
