import React, { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';
import ExerciseScreenTypeOne from './ExerciseScreenTypeOne';

let interval;

const ExerciseHandlerScreenTypeOne = ({ history }) => {
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(null);
  const assignedExercise = useSelector(
    (state) => state.patientAssignedExercises
  );
  const {
    assignedExercisesDetailed: { pendingExercises },
  } = assignedExercise;

  const chosenExercise = useSelector((state) => state.patientSelectExercises);
  const { selectedExercise } = chosenExercise;

  useEffect(() => {
    const detailedExercise = pendingExercises.filter(
      (ex) => ex.exerciseId === selectedExercise[0]._id
    );
    // console.log(detailedExercise);
    setDuration(detailedExercise[0].duration);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready) {
      interval = setInterval(() => {
        if (duration !== 0) {
          setDuration((prevProps) => prevProps - 1);
        }
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [duration, ready]);

  return (
    <>
      <ExerciseScreenTypeOne
        setReady={setReady}
        duration={duration}
        history={history}
      />
    </>
  );
};

export default ExerciseHandlerScreenTypeOne;
