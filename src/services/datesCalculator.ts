import dayjs from 'dayjs';
import fetch from 'node-fetch';
import { StatusCodes } from 'http-status-codes';

// import {
//   IDayObject,
//   Weekday,
//   IApiResponse,
//   IDivision,
//   IHolidayResponse,
//   IHoliday,
//   IHolidayEvent
// } from './src/common/types';


interface IDayObject {
  date: string;
  isHoliday: boolean;
  weekday: Weekday;
}

type Weekday = 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'

// type IWeekdays = Weekday[];

interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T
}

type IDivision = 'england-and-wales' | 'scotland' | 'northern-ireland'

interface IHolidayResponse {
  [key: string]: IHoliday;
}

interface IHoliday {
  division: IDivision;
  events: IHolidayEvent[];
}

interface IHolidayEvent {
  title: string;
  date: string;
  notes: string;
  bunting: boolean;
}

export default class DatesCalculator {

  private readonly bankHolidayApiUrl = 'https://www.gov.uk/bank-holidays.json';

  private readonly dateFormat = 'YYYY-MM-DD';

  private readonly weekdays: Weekday[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  /**
   * Takes a date and returns an array of dates for the following working week
   * @param {Date} date a date for which to get the following working week
   */
  public calculateDates = async (
    date: string,
    region: IDivision = 'england-and-wales',
  ): Promise<IApiResponse<IDayObject[]>> => {

    if (isNaN(Date.parse(date))) {
      return {
        success: false,
        message: `Invalid date. Please supply dates as YYYY-MM-DD`,
        data: [],
      }
    }

    const givenDate = dayjs(date);
    // 0 is Sunday
    const dayNumber = parseInt(givenDate.format('d'), 10);
    const daysTilNextMonday = dayNumber !== 0 
      ? (8 - dayNumber)
      : 1;
    const nextMonday = givenDate.add(daysTilNextMonday, 'day');
    const bankHolidaysRes = await this.getBankHolidays(nextMonday.format(this.dateFormat), region);
    const holidays = bankHolidaysRes.data;

    const results: IDayObject[] = [...Array(5).keys()].map(index => {
      const weekday = nextMonday.add(index, 'day');
      return {
        date: weekday.hour(8).minute(30).format(),
        isHoliday: this.isHoliday(weekday, holidays),
        weekday: this.getWeekday(weekday),
      }
    }).filter(day => !day.isHoliday);

    return Promise.resolve({
      success: true,
      message: `Found ${results.length} working days in the working week commencing 
        ${nextMonday.format(this.dateFormat)}. ${bankHolidaysRes.message}`,
      data: results
    });
  }

private readonly getWeekday = (day: dayjs.Dayjs): Weekday => {
  const weekdayIndex = parseInt(day.format('d'),10); 
  return this.weekdays[weekdayIndex];
}

  private readonly isHoliday = (
    date: dayjs.Dayjs,
    holidays: IHolidayEvent[]
  ): boolean => {
    return holidays.some(day =>  day.date === date.format(this.dateFormat));
  }

  private readonly getBankHolidays = async (
    date: string,
    division: IDivision,
  ): Promise<IApiResponse<IHolidayEvent[]>> => {
    const givenDate = dayjs(date);

    const bankHolidaysRes = await fetch(this.bankHolidayApiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (bankHolidaysRes.status !== StatusCodes.OK) {
      return {
        success: false,
        message: `Unable to retrieve bank holidays from external source`,
        data: []
      }
    }

    const bankHolidays: IHolidayResponse = await bankHolidaysRes.json();

    const holidays = bankHolidays[division].events
      .filter(event => dayjs(event.date).isAfter(givenDate))
      .filter(event => dayjs(event.date).isBefore(givenDate.add(5, 'day')));

    return {
      success: true,
      message: `Found ${holidays.length} holidays in the working week commencing ${date}`,
      data: holidays
    }
  }

}

