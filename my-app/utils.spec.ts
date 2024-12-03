import {describe} from "@jest/globals";
import {isStartDateExistentAlready} from "@/utils";

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
});