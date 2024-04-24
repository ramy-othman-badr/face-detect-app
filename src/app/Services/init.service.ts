import { Injectable, NgZone } from '@angular/core';
import {
  NavController,
  PopoverController,
  LoadingController,
  ToastController,
  ActionSheetController,
  AlertController,
  ModalController,
  Platform,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from './storage.service';


@Injectable({
  providedIn: 'root',
})
export class InitService {

  loading: any;
  labeledFaceDescriptors = [];


  constructor(
    public route: ActivatedRoute,
    public popoverController: PopoverController,
    public router: Router,
    public actionSheetController: ActionSheetController,
    public navCtrl: NavController,
    public ngZone: NgZone,
    public modalController: ModalController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController,
    public platform: Platform,
    public storageService: StorageService,
  ) { }

  async presentToast(msg, color?) {
    const toast = await this.toastController.create({
      cssClass: 'toast-msg',
      position: 'bottom',
      message: msg,
      color: color ? color : 'dark',
      duration: 3000,
    });
    toast.present();
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      cssClass: 'loading-msg',
      message: 'من فضلك انتظر قليلا',
    });
    await this.loading.present();
  }





}
