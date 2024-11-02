import {generateData} from "@/utils";

describe('CandleStickChart', () => {
    it('should render', () => {
        expect(true).toBeTruthy();
    });

    it('should transform randomly generated data to candleStickData', () => {
        const tickData = generateData(new Date('2024-01-01'), new Date('2024-01-02'), 'EURUSD');

        console.log(tickData);

        expect(true).toBeTruthy();
    });
});