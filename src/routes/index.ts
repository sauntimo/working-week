
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import DatesCalculator from '../services/datesCalculator';

// Init router and path
const router = Router();
const datesCalculator = new DatesCalculator();

/**
 * Get dates of the next working week for a given date
 * "GET /api/working-week/:date"
 * @param {string} date a string that can be converted in to a date object 
 */
router.get('/:date', async (req: Request, res: Response) => {
    const response = await datesCalculator.calculateDates(req.params.date);
    res.status(StatusCodes.OK).json(response);
});

export default router;
