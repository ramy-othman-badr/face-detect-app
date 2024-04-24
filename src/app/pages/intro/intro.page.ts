import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';

import * as faceapi from 'face-api.js';
import { InitService } from 'src/app/Services';


@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage implements OnInit {

  WIDTH = 440;
  HEIGHT = 280;
  @ViewChild('video', { static: true })
  public video: ElementRef;
  @ViewChild('canvas', { static: true })
  canvas: any
  videoInput: any;
  faceDetectionInterval

  modals_loaded = false
  stream_started = false

  constructor(private elRef: ElementRef, public initService: InitService) { }

  async ngOnInit() {
    await this.loadFaceDetectionModels();
  }


  authenticateFace() {
    this.initService.navCtrl.navigateRoot(['dashobard'])
  }

  async loadFaceDetectionModels() {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri('assets/models'),
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
    this.videoInput = this.video.nativeElement;
    const videoOptions = {
      video: {},
      audio: false,
    };
    var stream: any = await navigator.mediaDevices.getUserMedia(videoOptions).then((stream: MediaStream) => {
      this.videoInput.srcObject = stream
      this.stream_started = true
    })

    var videoElement = this.elRef.nativeElement.querySelector('video');

    videoElement.addEventListener('play', async () => {
      if (!this.canvas) {
        this.canvas = await faceapi.createCanvas(this.videoInput);
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

          var detection: any = await faceapi
            .detectSingleFace(this.videoInput, new faceapi.TinyFaceDetectorOptions({
              inputSize: 256
            })).withFaceLandmarks().withFaceDescriptor().withFaceExpressions()


          var resizedDetections = faceapi.resizeResults(detection, displaySize);

          if (detection) {
            let expressions = detection.expressions
            let landmarkPositions = detection._positions
            let faceDescriptor = detection.descriptor;
            let faceLandmarks = detection.landmarks;

            this.registerNewFace(faceDescriptor)

          }

          this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
          faceapi.draw.drawDetections(this.canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(this.canvas, resizedDetections);

        } catch (error) {
        }

      }, 1000);
    });

    videoElement.addEventListener('ended', () => {
      this.stopFaceRecognition();
      stream.getTracks().forEach(track => track.stop());
      this.stream_started = false
    });
  }


  registerNewFace(faceDescriptor) {
    if (this.initService.labeledFaceDescriptors.length != 0) {
      var faceMatcher = new faceapi.FaceMatcher(this.initService.labeledFaceDescriptors);
      var bestMatch: any = faceMatcher.findBestMatch(faceDescriptor);
      if (bestMatch._label === 'unknown') {
        this.initService.labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors('Ramy Othman', [faceDescriptor]));
        this.stopFaceRecognition()
      } else {
        this.stopFaceRecognition()
      }
    } else {
      this.initService.labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors('Ramy Othman', [faceDescriptor]));
      this.stopFaceRecognition()
    }
  }




  async stopFaceRecognition() {
    if (this.faceDetectionInterval) {
      clearInterval(this.faceDetectionInterval);
      this.faceDetectionInterval = null;
    }

    // Remove canvas element from DOM
    if (document.getElementById('canvass')) {
      document.querySelectorAll('#canvass').forEach(elm => {
        elm.remove()
      });
    }


    // Dispose face-api.js models and other cleanup steps
    this.stream_started = false
    this.stopVideoStream()
  }


  async stopVideoStream() {
    const videoElement = this.video.nativeElement;
    const stream = videoElement.srcObject as MediaStream;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoElement.srcObject = null;
    }
  }


}
