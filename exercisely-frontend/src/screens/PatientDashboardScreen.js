import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllExercises } from '../actions/patientActions';

import { setSelectedExercise } from '../actions/patientActions';

import Loader from '../components/Loader';

import Information from '../components/Information';

import './css/PatientDashboardScreen.css';

const PatientDashboardScreen = ({ history }) => {
  const [exerciseName, setExerciseName] = useState('');
  const dispatch = useDispatch();
  const patientAssignedExercises = useSelector(
    (state) => state.patientAssignedExercises
  );
  const {
    loading: loadingPatientAssignedExercises,

    assignedExercises,
  } = patientAssignedExercises;

  const { messageDetails } = useSelector((state) => state.patientSendMessage);
  const { basicDetails } = useSelector(
    (state) => state.patientRegisterBasicDetail
  );

  const seeStatsHandler = () => {
    history.push('/patient/view-staticstics');
  };

  const sendMessageHandler = () => {
    history.push('/patient/send-message');
  };

  const startExerciseHandler = () => {
    const selectedExercise = assignedExercises.filter(
      (ex) => ex.name === exerciseName
    );

    dispatch(setSelectedExercise(selectedExercise));
    if (selectedExercise[0].repsRequired) {
      history.push('/patient/start-exercise-type-two');
    } else {
      history.push('/patient/start-exercise-type-one');
    }
  };

  const addPatientDetails = () => {
    history.push('/patient/add-details');
  };

  // useEffect(() => {
  //   let timer = setTimeout(() => {
  //     dispatch(getAllExercises());
  //   }, 5000);
  useEffect(() => {
    dispatch(getAllExercises());
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // useEffect(() => {
  //   console.log(history.location);
  //   if (history.location['state'] !== undefined) {
  //     clearState(history.location.state.from, dispatch);
  //   }
  // }, [dispatch, history]);
  const refreshExerciseList = () => {
    dispatch(getAllExercises());
  };

  return (
    <div className='patient-dashboard-container'>
      {/* {errorPatientAssignedExercises && (
        <Error>
          <h3>No exercises assigned</h3>
        </Error>
      )} */}
      {messageDetails && (
        <Information>
          <h3>Message sent to the doctor</h3>
        </Information>
      )}
      {basicDetails && (
        <Information>
          <h3>Your Details are now registered</h3>
        </Information>
      )}

      {loadingPatientAssignedExercises && <Loader />}
      <section className='banner-start-exercise banner'>
        <div className='banner-img'>
          <img
            src='./images/patient-dashboard-banner-1.jpg'
            alt='banner-1-img'
          />
        </div>
        <div className='banner-info'>
          <h2>Exercise Time ?</h2>
          {assignedExercises && assignedExercises.length > 0 ? (
            <select
              defaultValue={'DEFAULT'}
              onChange={(e) => setExerciseName(e.target.value)}
            >
              <option value='DEFAULT' disabled hidden>
                Choose here
              </option>
              {assignedExercises.map((option, idx) => (
                <option key={idx} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          ) : (
            <h4>No Pending Exercises</h4>
          )}
          <button
            onClick={startExerciseHandler}
            className='patient-functionality-button'
            disabled={
              !assignedExercises || assignedExercises === 'undefined'
                ? true
                : false
            }
          >
            Start Exercise
          </button>
          <button
            onClick={refreshExerciseList}
            className='patient-functionality-button'
          >
            Refresh List
          </button>
        </div>
      </section>
      <section className='banner banner-view-stats'>
        <div className='banner-info'>
          <h2>State Quest</h2>
          <h3>Check Your Accuracy</h3>
          <button
            onClick={seeStatsHandler}
            className='patient-functionality-button'
          >
            See Statistics
          </button>
        </div>
        <div className='banner-img'>
          <img
            src='./images/patient-dashboard-banner-2.jpg'
            alt='banner-2-img'
          />
        </div>
      </section>
      <section className='banner banner-message-doctor'>
        <div className='banner-img'>
          <img
            src='./images/patient-dashboard-banner-3.svg'
            alt='banner-3-img'
          />
        </div>
        <div className='banner-info'>
          <h2>Want to have a Word with your Doctor ?</h2>
          <button
            className='patient-functionality-button'
            onClick={sendMessageHandler}
          >
            Send Message
          </button>
        </div>
      </section>
      <section className='banner add-details-banner'>
        <div className='banner-info'>
          <h2>Add My Details</h2>
          <button
            className='patient-functionality-button'
            onClick={addPatientDetails}
          >
            Add My Details
          </button>
        </div>
        <div className='banner-img'>
          <img src='./images/patient-add-detailts.jpg' alt='banner-1-img' />
        </div>
      </section>
    </div>
  );
};

export default PatientDashboardScreen;
