import { Component } from '@angular/core';
import { InitService } from './Services';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(public initService: InitService) {
    this.initService.platform.ready().then(async () => {
      if (
        this.initService.platform.is('cordova') ||
        this.initService.platform.is('capacitor')
      ) {
        StatusBar.setBackgroundColor({
          color: '#27A757',
        });
      }
      this.initService.navCtrl.navigateRoot(['intro']);
    });
  }
}
