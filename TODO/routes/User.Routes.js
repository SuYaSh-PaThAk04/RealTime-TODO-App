import express from 'express';
const router = express.Router();

import { registerUser, loginUser } from '../controllers/Users.Controllers.js';

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
