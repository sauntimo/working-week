"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const datesCalculator_1 = require("../services/datesCalculator");
const router = express_1.Router();
const datesCalculator = new datesCalculator_1.DatesCalculator();
router.get('/:date', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const response = yield datesCalculator.calculateDates(req.params.date, req.query.region);
    res.status(response.statusCode).json(response);
}));
exports.default = router;
