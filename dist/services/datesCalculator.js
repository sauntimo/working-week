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
exports.DatesCalculator = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(timezone_1.default);
const node_fetch_1 = __importDefault(require("node-fetch"));
const http_status_codes_1 = require("http-status-codes");
const regions = ['england-and-wales', 'scotland', 'northern-ireland'];
const isRegion = (x) => regions.includes(x);
class DatesCalculator {
    constructor() {
        this.bankHolidayApiUrl = 'https://www.gov.uk/bank-holidays.json';
        this.dateFormat = 'YYYY-MM-DD';
        /**
         * Takes a date and returns an array of dates for the following working week
         * * Assumes the next working week commences on the following Monday
         * * So given a Monday, will return the week commencing 7 days later
         * @param dateString a date for which to get the following working week
         */
        this.calculateDates = (dateString, region = 'england-and-wales') => __awaiter(this, void 0, void 0, function* () {
            if (isNaN(Date.parse(dateString))) {
                return this.failReturn(`Invalid date. Please supply a date string in a valid format such as YYYY-MM-DD.`, true);
            }
            if (!isRegion(region)) {
                return this.failReturn(`Invalid region. Valid regions are 'england-and-wales', 'scotland' and 'northern-ireland'.`, true);
            }
            dayjs_1.default.tz.setDefault('Europe/London');
            const givenDate = dayjs_1.default(dateString);
            // 0 is Sunday
            const dayNumber = parseInt(givenDate.format('d'), 10);
            const daysTilNextMonday = dayNumber !== 0
                ? (8 - dayNumber)
                : 1;
            const nextMonday = givenDate.add(daysTilNextMonday, 'day');
            const bankHolidaysRes = yield this.getBankHolidays(nextMonday.format(this.dateFormat), region);
            // If unable to retrieve bank holidays, doesn't need to return failed
            // but should include warning in message  
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
        /**
         * helper fn for returning an error
         * @param message description of what went wrong
         */
        this.failReturn = (message, invalidInput = false) => ({
            success: false,
            message,
            statusCode: invalidInput ? http_status_codes_1.StatusCodes.BAD_REQUEST : http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
        /**
         * Check if a date is in a known list of holidays
         * @param date date to check
         * @param holidays holidays retrieved from external source
         */
        this.isHoliday = (date, holidays) => {
            return holidays.some(day => day.date === date.format(this.dateFormat));
        };
        /**
         * Check a week for bank holidays
         * uses gov.uk data
         * @param date start of week to check for holidays
         * @param region region of the UK to check for holidays
         */
        this.getBankHolidays = (date, region) => __awaiter(this, void 0, void 0, function* () {
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
