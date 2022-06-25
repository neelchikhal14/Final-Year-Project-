import express from 'express';

const router = express.Router();

import {
  sendMessage,
  getPendingExercises,
  updateExerciseStats,
  getExerciseStats,
  getPatientId,
} from '../controllers/patientController.js';

import {
  doctorProtected,
  loginProtected,
  adminProtected,
} from '../middlewares/authMiddleware.js';

//BASE- /api/v1/patient

router.post('/sendmessage', loginProtected, sendMessage);
router.get('/getPendingExercises/:id', loginProtected, getPendingExercises);
router.get('/getId/:id', loginProtected, getPatientId);
router.put('/:id/updateExerciseStats', loginProtected, updateExerciseStats);
router.get('/:id/getExerciseStats', loginProtected, getExerciseStats);

export default router;
