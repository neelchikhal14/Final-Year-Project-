import React, { useRef, useState, useEffect } from 'react';
import '@tensorflow/tfjs-core';
import Webcam from 'react-webcam';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import {
  drawCanvas,
  getExerciseStats,
  calculateStatistics,
} from './utlities/utilities';
// import '@mediapipe/pose';
import './Exercise.css';

let timer;
let det;
let stats = [];
let beginTime = 0;
const Exercise = ({ exercise, setReady, duration }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [predictionArray, setPredictionArray] = useState([]);
  const [displayMedialements, setDisplayMedialements] = useState(true);
  const model = poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: 'tfjs',
    modelType: 'lite',
  };

  async function initPoseDetection() {
    const poseDetector = await poseDetection.createDetector(
      model,
      detectorConfig
    );
    return poseDetector;
  }

  async function start() {
    // await initCamera();
    console.log('2. start');
    det = await initPoseDetection();
    setReady(true);
    timer = setInterval(() => {
      render(det);
    }, 100);
  }

  function poseColor(poses) {
    if (poses[0].score > 0.7) {
      return 'pink';
    } else if (poses.score <= 0.7 && poses.score > 0.4) {
      return 'yellow';
    } else {
      return 'red';
    }
  }
  async function render(det) {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // console.log('3.render if');
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      // Make Detections
      const estimationConfig = { flipHorizontal: false };

      const poses = await det.estimatePoses(video, estimationConfig);
      let theColor = poseColor(poses);
      console.log(duration);
      console.log(beginTime);
      if (poses[0].score > 0.5 && canvasRef.current !== null) {
        console.log('main operations');
        drawCanvas(poses, videoWidth, videoHeight, canvasRef, theColor);
        let temp = getExerciseStats(poses, exercise);
        stats = [...stats, ...temp];
      }
    } else {
      console.log('3. render else');
      return;
    }
  }

  const begin = () => {
    console.log('1. begin');
    beginTime = duration - 5;
    start();
  };

  const stopSession = () => {
    console.log('4.stop');
    console.log(stats.length);
    const finalStats = calculateStatistics(stats);
    setPredictionArray([...predictionArray, finalStats]);
    setDisplayMedialements(false);
  };
  useEffect(() => {
    if (duration === 0) {
      setDisplayMedialements(false);
      clearInterval(timer);
    }
  }, [duration]);
  return (
    <div>
      {displayMedialements && (
        <div>
          <Webcam
            width='640px'
            height='480px'
            id='webcam'
            ref={webcamRef}
            style={{
              position: 'absolute',
              left: 120,
              top: 100,
              padding: '0px',
            }}
          />
          <canvas
            ref={canvasRef}
            id='my-canvas'
            width='640px'
            height='480px'
            style={{
              position: 'absolute',
              left: 120,
              top: 100,
              zIndex: 1,
            }}
          />
        </div>
      )}

      <div>
        <h1>{duration}</h1>
        <h1>{predictionArray.length}</h1>
        <button onClick={() => begin()}>Start</button>
        <button onClick={() => stopSession()}>Stop</button>
      </div>
    </div>
  );
};

export default Exercise;
