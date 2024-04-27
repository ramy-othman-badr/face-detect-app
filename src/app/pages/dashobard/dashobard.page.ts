import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';

import * as faceapi from 'face-api.js';

import { PermissionStatus, SpeechRecognition } from '@capacitor-community/speech-recognition'
import { InitService } from 'src/app/Services';

@Component({
  selector: 'app-dashobard',
  templateUrl: './dashobard.page.html',
  styleUrls: ['./dashobard.page.scss'],
})
export class DashobardPage implements OnInit {

  WIDTH = 440;
  HEIGHT = 280;
  @ViewChild('video', { static: true })
  public video: ElementRef;
  videoInput: any;
  faceDetectionInterval
  @ViewChild('canvas', { static: true })
  canvas: any

  modals_loaded = false
  stream_started = false

  videoElement


  constructor(private elRef: ElementRef, public initService: InitService) { }

  async ngOnInit() {
    await this.loadFaceDetectionModels();
  }


  registerFace() {
    this.initService.navCtrl.navigateRoot(['intro'])
  }

  async loadFaceDetectionModels() {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('assets/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('assets/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('assets/models'),
    ]).then(() => {
      this.modals_loaded = true;
    }).catch((error) => {
      console.error('Error loading models:', error);
    });
  }







  async detectFace() {
    SpeechRecognition.requestPermissions().then(async (permission: PermissionStatus) => {
      if (permission.speechRecognition) {
        this.videoInput = this.video.nativeElement;
        const videoOptions = {
          video: {},
          audio: false,
        };
        var stream: any = await navigator.mediaDevices.getUserMedia(videoOptions).then((stream: MediaStream) => {
          this.videoInput.srcObject = stream
          this.stream_started = true
        })

        this.videoElement = this.elRef.nativeElement.querySelector('video');
        this.videoElement.addEventListener('play', async () => {
          if (!this.canvas) {
            this.canvas = await faceapi.createCanvas(this.videoInput);
          }
          if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
          }

          document.getElementById('canvas').appendChild(this.canvas);
          this.canvas.setAttribute('id', 'canvass');
          this.canvas.setAttribute('style', `top: 0;left: 0;`);
          var displaySize = {
            width: this.videoInput.width,
            height: this.videoInput.height,
          };
          faceapi.matchDimensions(this.canvas, displaySize);

          this.faceDetectionInterval = setInterval(async () => {
            try {
              var detection: any = await faceapi.detectSingleFace(this.videoInput, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor().withFaceExpressions()

              var resizedDetections = faceapi.resizeResults(detection, displaySize);


              if (detection) {
                this.matchFace(detection.descriptor)
                this.stopFaceRecognition()
              } else {
                // No face detected, you can add logic here if needed
              }

              this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
              faceapi.draw.drawDetections(this.canvas, resizedDetections);
              faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);
              faceapi.draw.drawFaceExpressions(this.canvas, resizedDetections);


            } catch (error) {
              console.error('Face detection error:', error);
            }
          }, 500);
        });
      }
    })
  }


  matchFace(faceDescriptor) {
    var faceMatcher = new faceapi.FaceMatcher(this.initService.labeledFaceDescriptors);
    var bestMatch: any = faceMatcher.findBestMatch(faceDescriptor);
    if (bestMatch._label === 'unknown') {
      this.initService.presentToast('Face not recognized');
    } else {
      this.startAudio()
    }
  }


  startAudio() {
    SpeechRecognition.start({
      language: "en-US",
      maxResults: 2,
      prompt: "Say hello",
      partialResults: true,
      popup: true,
    }).then((response) => {
      if (response.matches && response.matches.length > 0) {
        if (response.matches[0] == 'hello') {
          SpeechRecognition.stop();
          alert('success authentication')
        } else {
          SpeechRecognition.stop();
          alert('faild to authenticate')
        }
      } else {
        SpeechRecognition.stop();
        alert('faild to authenticate')
      }
    }).catch(async (err) => {
      SpeechRecognition.stop();
      alert('faild to authenticate')
    })
  }





  async stopFaceRecognition() {
    if (this.faceDetectionInterval) {
      clearInterval(this.faceDetectionInterval);
      this.faceDetectionInterval = null;
    }

    if (document.getElementById('canvass')) {
      document.querySelectorAll('#canvass').forEach(elm => {
        elm.remove()
      });
    }

    this.stream_started = false
    const stream = this.video.nativeElement.srcObject as MediaStream;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      this.video.nativeElement.srcObject = null;
    }
    this.videoElement.removeEventListener('play', this.handlePlay); // Remove 'play' event listener

  }

  handlePlay = async () => {

  };



}
