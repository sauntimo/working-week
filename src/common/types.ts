import { StatusCodes } from 'http-status-codes';
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

  export const isRegion = (x: string): x is IRegion => regions.includes(x as IRegion);

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
