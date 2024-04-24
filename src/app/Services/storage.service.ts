import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  storage: Storage | null = null;

  constructor(public _storage: Storage) {
    this.init()
  }

  async init() {
    const storage = await this._storage.create();
    this.storage = storage;
  }


  // store data in sorage
  storeUserData(data) {
    var promise = new Promise((resolve, reject) => {
      this.storage.set('user', data).then(() => {
        resolve(true)
      }).catch((err) => {
        reject(err)
      })
    })
    return promise
  }


  // get data from sorage
  getUserData() {
    var promise = new Promise((resolve, reject) => {
      this.storage.get('user').then((response) => {
        resolve(response)
      }).catch((err) => {
        reject(err)
      })
    })
    return promise
  }


  // remove data from sorage
  removeUserData() {
    var promise = new Promise((resolve, reject) => {
      this.storage.remove('user').then(() => {
        resolve(true)
      }).catch((err) => {
        reject(err)
      })
    })
    return promise
  }



}