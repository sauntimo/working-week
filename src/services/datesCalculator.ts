import dayjs from 'dayjs';
import fetch from 'node-fetch';
import { StatusCodes } from 'http-status-codes';

// TODO: put these types & interfaces in a separate file

interface IApiResponseBase {
  success: boolean;
  message: string;
}

interface ISuccessResponse<T> extends IApiResponseBase {
  success: true;
  data: T
}

interface IFailResponse extends IApiResponseBase {
  success: false;
}

type IApiResponse<T> = ISuccessResponse<T> | IFailResponse

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

  /**
   * Takes a date and returns an array of dates for the following working week
   * * Assumes the next working week commences on the following Monday
   * * So given a Monday, will return the week commencing 7 days later
   * @param {Date} date a date for which to get the following working week
   */
  public calculateDates = async (
    date: string,
    region: IDivision = 'england-and-wales',
  ): Promise<IApiResponse<Date[]>> => {

    if (isNaN(Date.parse(date))) {
      return {
        success: false,
        message: `Invalid date. Please supply a date string in a valid format such as YYYY-MM-DD`,
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
    // If unable to retrieve bank holidays, doesn't need to return failed
    // but should include warning in message  
    const holidays = bankHolidaysRes.success ? bankHolidaysRes.data : []; 

    const results: Date[] = [...Array(5).keys()]
      .map(index => nextMonday.add(index, 'day'))
      .filter(day => !this.isHoliday(day, holidays))
      .map(day => new Date(day.hour(8).minute(30).format()));

    return {
      success: true,
      message: `There are ${results.length} working days in the working week commencing
        Monday ${nextMonday.format(this.dateFormat)}. ${bankHolidaysRes.message}`,
      data: results
    };
  }

/**
 * Check if a date is in a known list of holidays
 * @param date date to check
 * @param holidays holidays retrieved from external source
 */
  private readonly isHoliday = (
    date: dayjs.Dayjs,
    holidays: IHolidayEvent[]
  ): boolean => {
    return holidays.some(day => day.date === date.format(this.dateFormat));
  }

  /**
   * Check a week for bank holidays
   * uses gov.uk data
   * @param date start of week to check for holidays
   * @param division region of the UK to check for holidays
   */
  private readonly getBankHolidays = async (
    date: string,
    division: IDivision,
  ): Promise<IApiResponse<IHolidayEvent[]>> => {
    const givenDate = dayjs(date);

    const bankHolidaysRes = await fetch(this.bankHolidayApiUrl, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (bankHolidaysRes.status !== StatusCodes.OK) {
      return {
        success: false,
        message: `Unable to retrieve bank holidays from external source.`,
      }
    }

    const bankHolidays: IHolidayResponse = await bankHolidaysRes.json();

    const holidays = bankHolidays[division].events
      .filter(event => dayjs(event.date).isAfter(givenDate.subtract(1, 'day')))
      .filter(event => dayjs(event.date).isBefore(givenDate.add(5, 'day')));

    const plural = holidays.length !== 1;
    const dates = holidays.length > 0 
      ? `: ` + holidays.map(day => `${day.date} (${day.title})`).join(', ')
      : '';

    return {
      success: true,
      message: `There ${plural ? 'are' : 'is'} ${holidays.length > 0 ? 'also' : ''}
        ${holidays.length} holiday${plural ? 's' : ''}${dates}.`,
      data: holidays
    }
  }
}
