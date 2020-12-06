import dayjs from 'dayjs';
import Timezone from 'dayjs/plugin/timezone';
dayjs.extend(Timezone);

import fetch from 'node-fetch';
import { StatusCodes } from 'http-status-codes';

// TODO: put these types & interfaces in a separate file

export interface IApiResponseBase {
  success: boolean;
  message: string;
  statusCode: StatusCodes;
}

export interface ISuccessResponse<T> extends IApiResponseBase {
  success: true;
  data: T;
  statusCode: StatusCodes.OK;
}

export interface IFailResponse extends IApiResponseBase {
  success: false;
  statusCode: StatusCodes.BAD_REQUEST | StatusCodes.INTERNAL_SERVER_ERROR;
}

export type IApiResponse<T> = ISuccessResponse<T> | IFailResponse

const regions = ['england-and-wales', 'scotland', 'northern-ireland'] as const;
export type IRegion = typeof regions[number];
const isRegion = (x: string): x is IRegion => regions.includes(x as IRegion);

export type IHolidayResponse = {
  [key in IRegion]: IHoliday;
}

export interface IHoliday {
  division: IRegion;
  events: IHolidayEvent[];
}

export interface IHolidayEvent {
  title: string;
  date: string;
  notes: string;
  bunting: boolean;
}

export class DatesCalculator {

  private readonly bankHolidayApiUrl = 'https://www.gov.uk/bank-holidays.json';
  private readonly dateFormat = 'YYYY-MM-DD';

  /**
   * Takes a date and returns an array of dates for the following working week
   * * Assumes the next working week commences on the following Monday
   * * So given a Monday, will return the week commencing 7 days later
   * @param dateString a date for which to get the following working week
   */
  public calculateDates = async (
    dateString: string,
    region: IRegion = 'england-and-wales',
  ): Promise<IApiResponse<Date[]>> => {

    if (isNaN(Date.parse(dateString))) {
      return this.failReturn(
        `Invalid date. Please supply a date string in a valid format such as YYYY-MM-DD.`,
        true
      );
    }

    if (!isRegion(region)){
      return this.failReturn(
        `Invalid region. Valid regions are 'england-and-wales', 'scotland' and 'northern-ireland'.`,
        true
      );
    }

    dayjs.tz.setDefault('Europe/London');
    const givenDate = dayjs(dateString);
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
      message: `There are ${results.length} working days in the working week commencing `
       + `Monday ${nextMonday.format(this.dateFormat)}. ${bankHolidaysRes.message}`,
      data: results,
      statusCode: StatusCodes.OK,
    };
  }

  /**
   * helper fn for returning an error
   * @param message description of what went wrong
   */
  private readonly failReturn = (message: string, invalidInput = false): IFailResponse =>
    ({
        success: false,
        message,
        statusCode: invalidInput ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR
    })

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
   * @param region region of the UK to check for holidays
   */
  private readonly getBankHolidays = async (
    date: string,
    region: IRegion,
  ): Promise<IApiResponse<IHolidayEvent[]>> => {
    const givenDate = dayjs(date);

    const bankHolidaysRes = await fetch(this.bankHolidayApiUrl, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (bankHolidaysRes.status !== StatusCodes.OK) {
      return this.failReturn(`Unable to retrieve bank holidays from external source.`);
    }

    const bankHolidays: IHolidayResponse = await bankHolidaysRes.json();

    const holidays = bankHolidays[region].events
      .filter(event => dayjs(event.date).isAfter(givenDate.subtract(1, 'day')))
      .filter(event => dayjs(event.date).isBefore(givenDate.add(5, 'day')));

    const plural = holidays.length !== 1;
    const dates = holidays.length > 0 
      ? `: ` + holidays.map(day => `${day.date} (${day.title})`).join(', ')
      : '';

    return {
      success: true,
      message: `There ${plural ? 'are' : 'is'} ${holidays.length > 0 ? 'also ' : ''}`
        + `${holidays.length} holiday${plural ? 's' : ''} in ${region}${dates}.`,
      data: holidays,
      statusCode: StatusCodes.OK,
    }
  }
}
