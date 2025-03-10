import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import '@tensorflow/tfjs-core';
import Webcam from 'react-webcam';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import {
  drawCanvas,
  getExerciseStats,
  calculateStatistics,
  calculateAngle,
} from '../utlities/utilities';

import { updateExerciseStats } from '../actions/patientActions';
import './css/ExerciseScreenTypeTwo.css';
let timer;
let det;
let stage = null;
let stats = [];
let requiredReps;
const ExerciseScreenTypeTwo = ({ history }) => {
  const dispatch = useDispatch();

  const { selectedExercise } = useSelector(
    (state) => state.patientSelectExercises
  );

  const assignedExercise = useSelector(
    (state) => state.patientAssignedExercises
  );
  const {
    assignedExercisesDetailed: { pendingExercises },
  } = assignedExercise;

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [displayMedialements, setDisplayMedialements] = useState(true);
  const [reps, setReps] = useState(0);

  const [detailedExercise, setDetailedExercise] = useState(null);

  // const [angle, setAngle] = useState(0);

  useEffect(() => {
    const exercise = pendingExercises.filter(
      (ex) => ex.exerciseId === selectedExercise[0]._id
    );
    setDetailedExercise(...exercise);
    if (detailedExercise) requiredReps = detailedExercise.reps;
  }, [detailedExercise, pendingExercises, selectedExercise]);

  useEffect(() => {
    if (reps > requiredReps) {
      setDisplayMedialements(false);
      clearInterval(timer);
    }
  }, [reps]);
  const model = poseDetection.SupportedModels.BlazePose;
  const detectorConfig = {
    runtime: 'tfjs',
    modelType: 'heavy',
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
    // console.log('2. start');
    det = await initPoseDetection();
    // setReady(true);
    timer = setInterval(() => {
      render(det);
    }, 400);
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

      if (poses[0].score > 0.5 && canvasRef.current !== null) {
        // console.log('main operations');
        drawCanvas(poses, videoWidth, videoHeight, canvasRef, theColor);
        // reps counter
        // let exerciseInformation = setExerciseInformation(exercise);
        selectedExercise[0].bodyParams.forEach((singleAngle) => {
          let pointOne = poses[0].keypoints[singleAngle.pointOne];
          let pointTwo = poses[0].keypoints[singleAngle.pointTwo];
          let pointThree = poses[0].keypoints[singleAngle.pointThree];
          if (singleAngle.bodyPartName === 'left_hand_shoulder') {
            // console.log(singleAngle.bodyPartName);
            let angle = calculateAngle(pointOne, pointTwo, pointThree);
            // console.log(angle);
            //left hand stretch
            if (angle > 168 && angle <= 180) {
              stage = 'stretch';
            }
            if (stage === 'stretch' && angle <= 168) {
              stage = 'bend';
              setReps((prevProps) => prevProps + 1);
            }
          }

          // console.log(singleAngle.bodyPartName);
          // setAngle(angle);
          // 159 to 163
          // 156 - 160 bend
          // 161 - 165 str
          // if (angle > 160) {
          //   stage = 'stretch';
          // }
          // if (stage === 'stretch' && angle <= 160) {
          //   stage = 'bend';
          //   setReps((prevProps) => prevProps + 1);
          // }
          // squats
          // if (angle > 180 && angle <= 200) {
          //   stage = 'stretch';
          // }
          // if (stage === 'stretch' && angle <= 310 && angle > 271) {
          //   stage = 'bend';
          //   setReps((prevProps) => prevProps + 1);
          // }

          let temp = getExerciseStats(poses, selectedExercise[0].bodyParams);
          stats = [...stats, ...temp];
        });
      }
    } else {
      return;
    }
  }
  const begin = () => {
    // console.log('1. begin');
    start();
  };
  const genStats = () => {
    // normaliseExerciseStats(stats);
    const finalStats = calculateStatistics(stats);
    console.log(finalStats);
    setDisplayMedialements(false);
    dispatch(updateExerciseStats(detailedExercise.assignedDate, finalStats));
    history.push('/patient-dashboard');
  };
  //useEffect to clear timer that calls model evry 100 ms
  useEffect(() => {
    if (!displayMedialements) clearInterval(timer);
  }, [displayMedialements]);

  return (
    <>
      <section className='exercise-section'>
        {displayMedialements && (
          <>
            <div className='media'>
              <Webcam id='webcam' ref={webcamRef} />
              <canvas ref={canvasRef} id='my-canvas' />
            </div>

            <div className='exercise-info'>
              <h3>Instructions</h3>
              <ul>
                <li>
                  You are about to start a session of {selectedExercise[0].name}
                </li>
                {detailedExercise !== null &&
                  detailedExercise.instructions.map((ins, idx) => (
                    <li key={idx}>{ins}</li>
                  ))}
              </ul>
              {detailedExercise !== null && (
                <>
                  <h4>Video Demonstration of the Exercise</h4>
                  <a
                    href={detailedExercise.videoLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='exercise-link'
                  >
                    Click here to See the Video
                  </a>
                </>
              )}
              <div className='reps-data'>
                <span className='rep-count'>Rep Count: {reps}</span>
                {detailedExercise && (
                  <span className='required-reps'>
                    Required: {detailedExercise.reps}
                  </span>
                )}
              </div>
              <button onClick={() => begin()} className='start-exercise-button'>
                Start
              </button>
            </div>
          </>
        )}
        {!displayMedialements && (
          <>
            <div className='exercise-complete-banner'>
              <img
                src='../images/exercise-complete-banner.jpg'
                alt='exercise-complete-banner'
              />
            </div>
            <div className='exercise-complete-info'>
              <h2>Wohoo!!</h2>
              <h3>You have successfully completed the session</h3>
              <h4>Please click the below button to generate Statistics</h4>
              <button onClick={genStats} className='genrate-stats-button'>
                Generate Statistics
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default ExerciseScreenTypeTwo;
