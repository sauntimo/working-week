import { StatusCodes } from 'http-status-codes';

import { DatesCalculator } from '../services/datesCalculator';
import {
    IApiResponse,
    ISuccessResponse,
    IRegion
  } from '../common/types';

const datesCalculator = new DatesCalculator;

let received: IApiResponse<Date[]> | undefined;
let error: Error | undefined;

// eslint-disable-next-line max-len
const successMessageRE = /^There are \d working days in the working week commencing \w+day \d{4}-\d{2}-\d{2}\./;
const badDateMessageRE = /^Invalid date./;
const badRegionMessageRE = /^Invalid region./;
describe('calculateDates', () => {

    beforeEach(() => {
        received = undefined;
        error = undefined;
    });

    describe('Bad input', () => {
        it('should return failed on bad date', async () => {
            try {
                received = await datesCalculator.calculateDates('cheesecake', 'england-and-wales'); 
            } catch(e) {
                error = e;
            }

            expect(error).toBe(undefined);
            expect(received).toHaveProperty('success', false);
            expect(received).toHaveProperty('message', expect.stringMatching(badDateMessageRE));
            expect(received).toHaveProperty('statusCode', StatusCodes.BAD_REQUEST);
            expect(received).not.toHaveProperty('data');
        });
    
        it('should return failed on bad region', async () => {
            try {
                received = await datesCalculator.calculateDates(
                    '2020-12-06',
                    'cheesecake' as IRegion
                ); 
            } catch(e) {
                error = e;
            }

            expect(error).toBe(undefined);
            expect(received).toHaveProperty('success', false);
            expect(received).toHaveProperty('message', expect.stringMatching(badRegionMessageRE));
            expect(received).toHaveProperty('statusCode', StatusCodes.BAD_REQUEST);
            expect(received).not.toHaveProperty('data');
        });
    });

    describe('Functionality', () => {
        it(`should assume region is 'england-and-wales' if not specified`, async () => {
            try {
                received = await datesCalculator.calculateDates('2020-12-06'); 
            } catch(e) {
                error = e;
            }

            expect(error).toBe(undefined);
            expect(received).toHaveProperty('success', true);
            expect(received).toHaveProperty(
                'message',
                expect.stringMatching(new RegExp('england-and-wales'))
            );
        });

        it('should return dates set to 08:30', async () => {
            try {
                received = await datesCalculator.calculateDates('2020-12-06'); 
            } catch(e) {
                error = e;
            }

            expect(error).toBe(undefined);
            expect(received).toHaveProperty('success', true);
            expect(received).toHaveProperty('message', expect.stringMatching(successMessageRE));
            expect(
                (received as ISuccessResponse<Date[]>).data
                    .map(date => date.toLocaleTimeString('en-GB'))
                    .every(time => time === '08:30:00')
            ).toBe(true);
        });
    });

    describe('Date calculations', () => {
        test.each`
            date            | region                 | numWorkDays
            ${'2020-12-28'} | ${'england-and-wales'} | ${5}
            ${'2020-12-28'} | ${'northern-ireland'}  | ${5}
            ${'2020-12-28'} | ${'scotland'}          | ${4}
            ${'2020-12-26'} | ${'england-and-wales'} | ${3}
            ${'2020-12-26'} | ${'northern-ireland'}  | ${3}
            ${'2020-12-26'} | ${'scotland'}          | ${3}
            ${'2021-03-29'} | ${'england-and-wales'} | ${4}
            ${'2020-03-29'} | ${'scotland'}          | ${5}
            ${'2020-03-29'} | ${'northern-ireland'}  | ${5}
        `(
            'should return $numWorkDays work days for $date in $region',
            async ({date, region, numWorkDays}) => {
                try {
                    received = await datesCalculator.calculateDates(date, region); 
                } catch(e) {
                    error = e;
                }

                expect(error).toBe(undefined);
                expect(received).toHaveProperty('success', true);
                expect(received).toHaveProperty(
                    'message',
                    expect.stringMatching(successMessageRE)
                );
                expect((received as ISuccessResponse<Date[]>).data.length).toEqual(numWorkDays);
                expect(received).toHaveProperty('statusCode', StatusCodes.OK);
            }
        );
    });

});
