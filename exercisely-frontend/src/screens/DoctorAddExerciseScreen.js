import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Loader from '../components/Loader';
import Error from '../components/Error';

import {
  fetchPatient,
  getExercises,
  setExercise,
  checkMedicalRecord,
  createMedicalRecord,
  getMultiplePatients,
} from '../actions/doctorActions';

import { bodyPartsRef } from '../utlities/utilities';
import './css/DoctorAddExerciseScreen.css';

const DoctorAddExerciseScreen = ({ history }) => {
  const [getPatient, setGetPatient] = useState({
    firstname: '',
    lastname: '',
  });
  const onChangeHandlerName = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setGetPatient({ ...getPatient, [name]: value });
  };
  const [exerciseDetails, setExerciseDetails] = useState({
    bodyPart: '',
    angle: 0,
    std: 0,
  });

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setExerciseDetails({ ...exerciseDetails, [name]: value });
  };

  const [selectedExerciseId, setSelectedExerciseId] = useState('');

  const [completeExerciseDetails, setCompleteExerciseDetails] = useState({});
  const [standardDeviation, setStandardDeviation] = useState({});

  const setExerciseParams = (e) => {
    e.preventDefault();
    // console.log('exercise details', exerciseDetails);
    const entries = Object.entries(exerciseDetails);
    // console.log('entries', entries);
    const key = entries[0][1];
    const value = entries[1][1];
    setCompleteExerciseDetails({
      ...completeExerciseDetails,
      [key]: Number(value),
    });
    const stdValue = entries[2][1];
    setStandardDeviation({
      ...standardDeviation,
      [key]: Number(stdValue),
    });
    // console.log('std Deviation', standardDeviation);
  };

  const [reps, setReps] = useState(0);
  const [assignedCompletion, setAssignedCompletion] = useState(new Date());
  const [instructions, setInstructions] = useState([]);
  const [duration, setDuration] = useState(0);
  const [videoLink, setVideoLink] = useState('');
  const [recordExists, setRecordExists] = useState('');
  const [recordCreated, setRecordCreated] = useState(false);

  const [referenceNumber, setReferenceNumber] = useState('');

  const handleCheckMedicalRecord = () => {
    dispatch(checkMedicalRecord(patient.bioData._id));
  };

  const createRecord = () => {
    dispatch(createMedicalRecord());
  };

  const dispatch = useDispatch();

  const { patient } = useSelector((state) => state.doctorFetchPatient);
  const { status, error } = useSelector(
    (state) => state.doctorCheckMedicalRecord
  );
  const { exercises } = useSelector((state) => state.doctorGetExercises);
  const { recordStatus } = useSelector(
    (state) => state.doctorCreateMedicalRecord
  );
  const {
    patientDetails,
    loading: loadingGetMultiplePatients,
    error: errorGetMultiplePatients,
  } = useSelector((state) => state.doctorGetMultiplePatients);

  const getPatientDetails = (e) => {
    e.preventDefault();
    dispatch(getMultiplePatients(getPatient.firstname, getPatient.lastname));
    // dispatch(fetchPatient(getPatient));
    // dispatch(getExercises());
  };

  const finalizePatient = (e) => {
    dispatch(fetchPatient(referenceNumber));
    dispatch(getExercises());
    e.preventDefault();
  };

  const setPatientExercises = () => {
    let assignedDate = new Date();
    assignedDate = assignedDate.toISOString();
    // console.log('std deviation final', standardDeviation);
    const details = {
      pid: patient.bioData._id,
      doctorId: patient.bioData._id,
      exerciseId: selectedExerciseId,
      desiredValue: completeExerciseDetails,
      std: standardDeviation,
      reps,
      videoLink,
      assignedDate,
      duration,
      assignedCompletion: new Date(assignedCompletion).toISOString(),
      status: 'pending',
      instructions: instructions.split(';'),
      sessionStats: [],
    };
    // console.log(details);
    dispatch(setExercise(details));
    history.push('/doctor-dashboard');
  };
  useEffect(() => {
    if (status) {
      setRecordExists('Exists');
    }
    if (error) {
      setRecordExists('Not Exists');
    }
  }, [status, error]);
  useEffect(() => {
    if (recordStatus) {
      setRecordCreated(true);
    }
  }, [recordStatus]);

  return (
    <div className='add-exercises-container'>
      <h2>Add Exercises For the Patient</h2>
      {loadingGetMultiplePatients && <Loader />}
      {errorGetMultiplePatients && (
        <Error>
          <h3>{errorGetMultiplePatients}</h3>
        </Error>
      )}
      <section className='get-patient-details-section'>
        <h3>Search for patient based on firstname and Lastname</h3>
        <form onSubmit={getPatientDetails} className='get-patient-form'>
          <label htmlFor='firstname'>Enter Patient's Firstname</label>
          <input
            type='text'
            name='firstname'
            value={getPatient.firstname}
            onChange={onChangeHandlerName}
          />
          <label htmlFor='lastname'>Enter Patient's Lastname</label>
          <input
            type='text'
            name='lastname'
            value={getPatient.lastname}
            onChange={onChangeHandlerName}
          />
          <button type='submit' className='get-patient-button'>
            Get Patient List
          </button>
        </form>
      </section>
      {patientDetails && patientDetails.length > 0 && (
        <section className='patient-reference-section'>
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Patient Reference Number</th>
              </tr>
            </thead>
            <tbody>
              {patientDetails.map((singlePatient, index) => {
                return (
                  <tr key={index}>
                    <td>
                      {singlePatient.firstname.toUpperCase()}
                      {} {singlePatient.lastname.toUpperCase()}
                    </td>
                    <td>{singlePatient.email}</td>
                    <td>{singlePatient._id}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      <section className='finalize-patient-section'>
        <form onSubmit={finalizePatient}>
          <label htmlFor='finalizedpatient'>Enter Reference Number</label>
          <input
            type='text'
            name='finalizedpatient'
            className='get-ref-num-input'
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
          <button type='submit' className='set-patient-button'>
            Set Patient
          </button>
        </form>
      </section>

      <section className='check-patient-medical-record'>
        <h3>Check if Patient's Medical Record Exists ?</h3>
        <button
          onClick={handleCheckMedicalRecord}
          className='check-medical-record-button'
        >
          Check Medical Record
        </button>
        {recordExists === 'Exists' && <h4>Record Exists Process Further</h4>}
        {recordExists === 'Not Exists' && (
          <>
            <h4>
              Record does not exists for this Patient.First Create A record
            </h4>
            <button
              onClick={createRecord}
              className='create-medical-record-button'
            >
              Create Record
            </button>
            {recordCreated && <h4>Record Created</h4>}
          </>
        )}
      </section>

      {patient && exercises && (
        <>
          <section className='exercise-section'>
            <h3>Select Exercise:</h3>
            <select
              defaultValue={'DEFAULT'}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
            >
              <option value='DEFAULT' disabled hidden>
                Choose here
              </option>
              {exercises.map((option) => (
                <option key={option.name} value={option._id}>
                  {option.name}
                </option>
              ))}
            </select>
          </section>
          <section className='assign-exercise-data-section'>
            <div className='assign-exercise-data-img'>
              <img src='./images/pose-landmarks.png' alt='pose-landmarks' />
            </div>
            <div className='assign-exercise-data'>
              <h2>Body Part Angle Settings</h2>
              <label htmlFor='reps'>Repetitions</label>
              <input
                type='number'
                name='reps'
                min={0}
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
              <label htmlFor='duration'>Duration (in seconds)</label>
              <input
                type='number'
                name='duration'
                min={0}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <label htmlFor='completionDate'>Completetion Date</label>
              <input
                type='date'
                name='completionDate'
                value={assignedCompletion}
                onChange={(e) => setAssignedCompletion(e.target.value)}
              />
              <label htmlFor='videoLink'>Video Link</label>
              <input
                type='text'
                name='videoLink'
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
              />
              <label htmlFor='instructions'>Instructions</label>
              <textarea
                name='instructions'
                cols='30'
                rows='10'
                placeholder='Please enter semicolon sepearated instructions'
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
              <form onSubmit={setExerciseParams} className='set-angle-form'>
                <h4>Set Angles for Different Body Part Combinations</h4>
                <select
                  defaultValue={'DEFAULT'}
                  onChange={handleChange}
                  name='bodyPart'
                >
                  <option value='DEFAULT' disabled hidden>
                    Choose here
                  </option>
                  {bodyPartsRef.map((option, idx) => (
                    <option key={idx} value={option}>
                      {/* {console.log(option.split('_').join(' ').toUpperCase())} */}
                      {option.split('_').join(' ').toUpperCase()}
                    </option>
                  ))}
                </select>
                <label htmlFor='angle'>Angle</label>
                <input
                  type='number'
                  value={exerciseDetails.name}
                  onChange={handleChange}
                  name='angle'
                />
                <label htmlFor='std'>Allowed Deviation</label>
                <input
                  type='number'
                  value={exerciseDetails.std}
                  onChange={handleChange}
                  name='std'
                />
                <button type='submit' className='set-angle-button'>
                  Set Exercise Parameters
                </button>
              </form>
              <div className='set-angle-details'>
                {completeExerciseDetails &&
                  Object.entries(completeExerciseDetails).map((item, index) => {
                    return (
                      <div key={index}>
                        <span>
                          {item[0].split('_').join(' ').toUpperCase()} :{' '}
                          {item[1]}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {completeExerciseDetails && (
                <button
                  onClick={setPatientExercises}
                  className='set-exercise-button'
                >
                  Set Exercise
                </button>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default DoctorAddExerciseScreen;
