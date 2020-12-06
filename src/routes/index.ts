
import { Request, Response, Router } from 'express';

import { DatesCalculator } from '../services/datesCalculator';
import { IRegion } from '../common/types';

// Init router and path
const router = Router();
const datesCalculator = new DatesCalculator();

/**
 * Get dates of the next working week for a given date
 * "GET /api/working-week/:date?region=:region"
 * @param {string} date a string that can be converted in to a date object 
 * @param {IRegion} region a region of the UK to check for holidays 
 */
router.get('/:date', async (req: Request, res: Response) => {
    const response = await datesCalculator.calculateDates(
        req.params.date,
        req.query.region as IRegion
    );
    res.status(response.statusCode).json(response);
});

export default router;
