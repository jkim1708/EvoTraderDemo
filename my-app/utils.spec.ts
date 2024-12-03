import {describe} from "@jest/globals";
import {generateRandomDateRange, isStartDateExistentAlready} from "@/utils";

describe('utils', () => {
    describe('isStartDateExistentAlready', () => {

        it('should return true if start date is already existent', () => {
            expect(isStartDateExistentAlready([{
                startDate: new Date('2022-01-01'),
                endDate: new Date('2022-01-02')
            }, {
                startDate: new Date('2022-01-03'),
                endDate: new Date('2022-01-04')
            }], new Date('2022-01-01'))).toBe(true);
        })
        it('should return false if start date is not existent', () => {
            expect(isStartDateExistentAlready([{
                startDate: new Date('2022-01-02'),
                endDate: new Date('2022-01-03')
            },
                {
                    startDate: new Date('2022-01-04'),
                    endDate: new Date('2022-01-05')
                }], new Date('2022-01-01'))).toBe(false);
        })
    });

    describe('generateRandomTrade', () => {

        it('should return random trades with no duplicate start dates', () => {
            const randomDateRange = generateRandomDateRange(new Date('2022-01-01'), new Date('2022-1-03'));
            console.log(randomDateRange[0].startDate.toISOString().split('T')[0]);
            const startDates = randomDateRange.map(dateRange => dateRange.startDate.toISOString().split('T')[0]);
            const isDuplicate = startDates.some((startDate, index) => startDates.indexOf(startDate) !== index);
            expect(isDuplicate).toBe(false);
        });

    });
});