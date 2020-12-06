"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatesCalculator = void 0;
const tslib_1 = require("tslib");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const timezone_1 = tslib_1.__importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(timezone_1.default);
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const http_status_codes_1 = require("http-status-codes");
const types_1 = require("../common/types");
class DatesCalculator {
    constructor() {
        this.bankHolidayApiUrl = 'https://www.gov.uk/bank-holidays.json';
        this.dateFormat = 'YYYY-MM-DD';
        this.calculateDates = (dateString, region = 'england-and-wales') => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (isNaN(Date.parse(dateString))) {
                return this.failReturn(`Invalid date. Please supply a date string in a valid format such as YYYY-MM-DD.`, true);
            }
            if (!types_1.isRegion(region)) {
                return this.failReturn(`Invalid region. Valid regions are `
                    + types_1.regions.map(region => `'${region}'`).join(', ') + `.`, true);
            }
            dayjs_1.default.tz.setDefault('Europe/London');
            const givenDate = dayjs_1.default(dateString);
            const dayNumber = parseInt(givenDate.format('d'), 10);
            const daysTilNextMonday = dayNumber !== 0
                ? (8 - dayNumber)
                : 1;
            const nextMonday = givenDate.add(daysTilNextMonday, 'day');
            const bankHolidaysRes = yield this.getBankHolidays(nextMonday.format(this.dateFormat), region);
            const holidays = bankHolidaysRes.success ? bankHolidaysRes.data : [];
            const results = [...Array(5).keys()]
                .map(index => nextMonday.add(index, 'day'))
                .filter(day => !this.isHoliday(day, holidays))
                .map(day => new Date(day.hour(8).minute(30).format()));
            return {
                success: true,
                message: `There are ${results.length} working days in the working week commencing `
                    + `Monday ${nextMonday.format(this.dateFormat)}. ${bankHolidaysRes.message}`,
                data: results,
                statusCode: http_status_codes_1.StatusCodes.OK,
            };
        });
        this.failReturn = (message, invalidInput = false) => ({
            success: false,
            message,
            statusCode: invalidInput ? http_status_codes_1.StatusCodes.BAD_REQUEST : http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
        this.isHoliday = (date, holidays) => {
            return holidays.some(day => day.date === date.format(this.dateFormat));
        };
        this.getBankHolidays = (date, region) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const givenDate = dayjs_1.default(date);
            const bankHolidaysRes = yield node_fetch_1.default(this.bankHolidayApiUrl, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (bankHolidaysRes.status !== http_status_codes_1.StatusCodes.OK) {
                return this.failReturn(`Unable to retrieve bank holidays from external source.`);
            }
            const bankHolidays = yield bankHolidaysRes.json();
            const holidays = bankHolidays[region].events
                .filter(event => dayjs_1.default(event.date).isAfter(givenDate.subtract(1, 'day')))
                .filter(event => dayjs_1.default(event.date).isBefore(givenDate.add(5, 'day')));
            const plural = holidays.length !== 1;
            const dates = holidays.length > 0
                ? `: ` + holidays.map(day => `${day.date} (${day.title})`).join(', ')
                : '';
            return {
                success: true,
                message: `There ${plural ? 'are' : 'is'} ${holidays.length > 0 ? 'also ' : ''}`
                    + `${holidays.length} holiday${plural ? 's' : ''} in ${region}${dates}.`,
                data: holidays,
                statusCode: http_status_codes_1.StatusCodes.OK,
            };
        });
    }
}
exports.DatesCalculator = DatesCalculator;
