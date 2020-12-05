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
const dayjs_1 = __importDefault(require("dayjs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const http_status_codes_1 = require("http-status-codes");
class DatesCalculator {
    constructor() {
        this.bankHolidayApiUrl = 'https://www.gov.uk/bank-holidays.json';
        /**
         * Takes a date and returns an array of dates for the following working week
         * @param {Date} date a date for which to get the following working week
         */
        this.calculateDates = (date, region = 'england-and-wales') => __awaiter(this, void 0, void 0, function* () {
            const response = {
                success: false,
                message: '',
                data: []
            };
            const givenDate = dayjs_1.default(date);
            // 0 is Sunday
            const dayNumber = parseInt(givenDate.format('d'), 10);
            const daysTilNextMonday = dayNumber !== 0
                ? (8 - dayNumber)
                : 1;
            const nextMonday = givenDate.add(daysTilNextMonday, 'day');
            const bankHolidaysRes = yield this.getBankHolidays(nextMonday.format('YYY-MM-DD'), region);
            // Getting bank holidays is not essential but if it fails we should add a warning
            if (!bankHolidaysRes.success) {
                response.message = bankHolidaysRes.message;
            }
            return bankHolidaysRes;
            // const thing: IDayObject = {
            //   theDate: date,
            //   isHoliday: false,
            //   weekday: 'Friday'
            // }
            // return Promise.resolve({
            //   success: true,
            //   message: 'stuff',
            //   data: [thing]
            // });
        });
        this.getBankHolidays = (date, division) => __awaiter(this, void 0, void 0, function* () {
            const givenDate = dayjs_1.default(date);
            const bankHolidaysRes = yield node_fetch_1.default(this.bankHolidayApiUrl, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (bankHolidaysRes.status !== http_status_codes_1.StatusCodes.OK) {
                return {
                    success: false,
                    message: `Unable to retrieve bank holidays from external source`,
                    data: []
                };
            }
            const bankHolidays = yield bankHolidaysRes.json();
            const holidays = bankHolidays[division].events
                .filter(event => dayjs_1.default(event.date).isAfter(givenDate))
                .filter(event => dayjs_1.default(event.date).isBefore(givenDate.add(5, 'day')));
            return {
                success: true,
                message: `Found ${holidays.length} holidays in the working week commencing ${date}`,
                data: holidays
            };
        });
    }
}
exports.default = DatesCalculator;
