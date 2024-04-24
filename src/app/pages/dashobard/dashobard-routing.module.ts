import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashobardPage } from './dashobard.page';

const routes: Routes = [
  {
    path: '',
    component: DashobardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashobardPageRoutingModule {}
