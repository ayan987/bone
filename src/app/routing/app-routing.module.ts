import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SECURE_ROUTES } from './secure.route';
import { AuthGuard } from '../guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: SECURE_ROUTES,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
