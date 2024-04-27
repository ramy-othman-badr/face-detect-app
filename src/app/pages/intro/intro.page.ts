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


  authenticateFace() {
    this.initService.navCtrl.navigateRoot(['dashobard'])
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




  previousLandmarks;
  movementThreshold = 0.1


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
            let expressions = detection.expressions
            let landmarkPositions = detection._positions
            let faceDescriptor = detection.descriptor;
            let faceLandmarks = detection.landmarks;
            // console.log(faceLandmarks)
            // this.registerNewFace(faceDescriptor)
            // this.stopFaceRecognition()

            const leftEye = faceLandmarks.getLeftEye();
  const rightEye = faceLandmarks.getRightEye();



            console.log(leftEye)
            /* if (this.previousLandmarks) {
              const movementDetected = this.hasMovement(this.previousLandmarks, faceLandmarks, this.movementThreshold);
              // Adjust movementThreshold dynamically based on recent movement history
                console.log(this.movementThreshold);
                if (movementDetected) {
                // Decrease threshold for more sensitivity
                // this.movementThreshold = Math.max(this.movementThreshold - 1, 1);
                console.log("Movement detected:", movementDetected);
              } else {
                // Increase threshold for less sensitivity
                this.movementThreshold = Math.min(this.movementThreshold + 0.1, 300); // Adjust upper limit as needed
              }
            }
            this.previousLandmarks = faceLandmarks; */

          } else {
            // No face detected, you can add logic here if needed
          }

          this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
          faceapi.draw.drawDetections(this.canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(this.canvas, resizedDetections);
        } catch (error) {
        }
      }, 100);
    });
  }



  hasMovement(prevLandmarks, currLandmarks, threshold) {
    let totalMovement = 0;
    for (let i = 0; i < prevLandmarks.length; i++) {
      const dx = currLandmarks[i].x - prevLandmarks[i].x;
      const dy = currLandmarks[i].y - prevLandmarks[i].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      totalMovement += distance;
    }
    const averageMovement = totalMovement / prevLandmarks.length;
    return averageMovement > threshold;
  }




  registerNewFace(faceDescriptor) {
    if (this.initService.labeledFaceDescriptors.length != 0) {
      var faceMatcher = new faceapi.FaceMatcher(this.initService.labeledFaceDescriptors);
      var bestMatch: any = faceMatcher.findBestMatch(faceDescriptor);
      if (bestMatch._label === 'unknown') {
        this.initService.labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors('Ramy Othman', [faceDescriptor]));
      }
    } else {
      this.initService.labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors('Ramy Othman', [faceDescriptor]));
    }
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
