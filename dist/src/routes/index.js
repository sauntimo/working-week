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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const datesCalculator_1 = __importDefault(require("../services/datesCalculator"));
// Init router and path
const router = express_1.Router();
const datesCalculator = new datesCalculator_1.default();
/**
 * Get dates of the next working week for a given date
 * "GET /api/working-week/:date"
 * @param {string} date a string that can be converted in to a date object
 */
router.get('/:date', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield datesCalculator.calculateDates(req.params.date);
    res.status(http_status_codes_1.StatusCodes.OK).json(response);
}));
exports.default = router;
