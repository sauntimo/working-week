export interface IDayObject {
    theDate: Date;
    isHoliday: boolean;
    weekday: Weekday;
}

export type Weekday = 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday'


export interface IApiResponse<T> {
    success: boolean;
    message: string;
    data: T
}

export type IDivision = 'england-and-wales' | 'scotland' | 'northern-ireland'

export interface IHolidayResponse {
    [key: string]: IHoliday;
}

export interface IHoliday {
    division: IDivision;
    events: IHolidayEvent[];
}

export interface IHolidayEvent {
    title: string;
    date: string;
    notes: string;
    bunting: boolean;
}
