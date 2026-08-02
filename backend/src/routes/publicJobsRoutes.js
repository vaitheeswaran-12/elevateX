import express from 'express';
import { listAllJobsAdvanced, getJobsFiltersMeta } from '../controllers/publicJobsController.js';

const router = express.Router();

// Public advanced job endpoints
router.get('/', listAllJobsAdvanced);
router.get('/filters-meta', getJobsFiltersMeta);

export default router;
