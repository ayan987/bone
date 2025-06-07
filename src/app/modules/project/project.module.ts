import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectRoutingModule } from './project-routing.module';
import { CreateProjectComponent } from './components/create-project/create-project.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { SharedModule } from '../shared/shared.module';
import { AssignClientToProjectComponent } from './components/assign-client-to-project/assign-client-to-project.component';
import { CreateAbrufComponent } from './components/create-abruf/create-abruf.component';
import { CreatePoDialogComponent } from './components/create-po-dialog/create-po-dialog.component';
import { CreateMilestoneComponent } from './components/create-milestone/create-milestone.component';


@NgModule({
  declarations: [
    CreateProjectComponent,
    ProjectListComponent,
    AssignClientToProjectComponent,
    CreateAbrufComponent,
    CreatePoDialogComponent,
    CreateMilestoneComponent,
  ],
  imports: [
    CommonModule,
    ProjectRoutingModule,
    SharedModule
  ]
})
export class ProjectModule { }
