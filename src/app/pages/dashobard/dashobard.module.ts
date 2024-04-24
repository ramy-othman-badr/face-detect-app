import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashobardPageRoutingModule } from './dashobard-routing.module';

import { DashobardPage } from './dashobard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashobardPageRoutingModule
  ],
  declarations: [DashobardPage]
})
export class DashobardPageModule {}
