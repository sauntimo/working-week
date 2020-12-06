"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const datesCalculator_1 = require("../services/datesCalculator");
// Init router and path
const router = express_1.Router();
const datesCalculator = new datesCalculator_1.DatesCalculator();
/**
 * Get dates of the next working week for a given date
 * "GET /api/working-week/:date?region=:region"
 * @param {string} date a string that can be converted in to a date object
 * @param {IRegion} region a region of the UK to check for holidays
 */
router.get('/:date', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield datesCalculator.calculateDates(req.params.date, req.query.region);
    res.status(response.statusCode).json(response);
}));
exports.default = router;
