import {convertToCustomDate, isInExistingInReferenceArea, transformToCandleStickData} from "@/utils";
import {ReferencedArea} from "@/components/ui/candleStickChart";


describe('CandleStickChart', () => {
    it('should render', () => {
        expect(true).toBeTruthy();
    });

    it('should transform tick series to one single candleStickData', () => {
        // const tickData = generateData(new Date('2024-01-01'), new Date('2024-01-03'), 'EURUSD');

        const tickSeries = [
            {"date": "2024-01-01T00:00:00.000Z", "value": "100.00015372651269"},
            {"date": "2024-01-01T00:05:00.000Z", "value": "100.00005718162355"},
            {"date": "2024-01-01T00:10:00.000Z", "value": "99.99997363324654"},
            {"date": "2024-01-01T00:15:00.000Z", "value": "99.9998637737419"},
            {"date": "2024-01-01T00:20:00.000Z", "value": "99.99980969316402"},
            {"date": "2024-01-01T00:25:00.000Z", "value": "100.00001644080263"},
            {"date": "2024-01-01T00:30:00.000Z", "value": "99.99980038824737"},
            {"date": "2024-01-01T00:35:00.000Z", "value": "99.99990899108762"},
            {"date": "2024-01-01T00:40:00.000Z", "value": "100.00009860104919"},
            {"date": "2024-01-01T00:45:00.000Z", "value": "100.0002814840462"},
            {"date": "2024-01-01T00:50:00.000Z", "value": "100.00006031553988"},
            {"date": "2024-01-01T00:55:00.000Z", "value": "100.00004959294226"},
        ];

        const sampleCandleStickData = transformToCandleStickData(tickSeries);

        expect(sampleCandleStickData).toEqual({
            "high": "100.000281484046",
            "low": "99.999800388247",
            "open": "100.00015372651269",
            "close": "100.00020475824091",
            "ts": "2024-01-01T00:00:00.000Z",
        });
    });

    describe('Reference Area', () => {

        it('should return true if first reference line has been set and if current cursor is not in an existing area', () => {
            const refAreaLeft1 = convertToCustomDate(new Date('2024-01-01T01:00:00.000Z'));
            const refAreaRight1 = convertToCustomDate(new Date('2024-01-01T02:00:00.000Z'));

            const refAreaLeft2 = convertToCustomDate(new Date('2024-01-01T05:00:00.000Z'));
            const refAreaRight2 = convertToCustomDate(new Date('2024-01-01T06:00:00.000Z'));

            const refAreaLeft3 = convertToCustomDate(new Date('2024-01-01T08:00:00.000Z'));

            const currentCursorToSetRefAreaRight3 = convertToCustomDate(new Date('2024-01-01T09:00:00.000Z'));

            const referencedAreas: ReferencedArea[] = [{referencedAreaLeft: refAreaLeft1, referencedAreaRight: refAreaRight1},{referencedAreaLeft: refAreaLeft2, referencedAreaRight: refAreaRight2}];
            expect(isInExistingInReferenceArea(referencedAreas,refAreaLeft3, currentCursorToSetRefAreaRight3)).toBeTruthy();
        });
    });

    // it('should transform tick series to candleStickSeries', () => {
    //     // const tickData = generateData(new Date('2024-01-01'), new Date('2024-01-03'), 'EURUSD');
    //
    //     const tickSeries = [
    //         {"date": "2024-01-01T00:00:00.000Z", "value": "100.00015372651269"},
    //         {"date": "2024-01-01T00:05:00.000Z", "value": "100.00005718162355"},
    //         {"date": "2024-01-01T00:10:00.000Z", "value": "99.99997363324654"},
    //         {"date": "2024-01-01T00:15:00.000Z", "value": "99.9998637737419"},
    //         {"date": "2024-01-01T00:20:00.000Z", "value": "99.99980969316402"},
    //         {"date": "2024-01-01T00:25:00.000Z", "value": "100.00001644080263"},
    //         {"date": "2024-01-01T00:30:00.000Z", "value": "99.99980038824737"},
    //         {"date": "2024-01-01T00:35:00.000Z", "value": "99.99990899108762"},
    //         {"date": "2024-01-01T00:40:00.000Z", "value": "100.00009860104919"},
    //         {"date": "2024-01-01T00:45:00.000Z", "value": "100.0002814840462"},
    //         {"date": "2024-01-01T00:50:00.000Z", "value": "100.00006031553988"},
    //         {"date": "2024-01-01T00:55:00.000Z", "value": "100.00004959294226"},
    //
    //         { "date": "2024-01-01T01:00:00.000Z", "value": "99.99988074211633" },
    //         { "date": "2024-01-01T01:05:00.000Z", "value": "99.99974967975065" },
    //         { "date": "2024-01-01T01:10:00.000Z", "value": "99.99991402351134" },
    //         { "date": "2024-01-01T01:15:00.000Z", "value": "99.99988709363247" },
    //         { "date": "2024-01-01T01:20:00.000Z", "value": "99.99987441750511" },
    //         { "date": "2024-01-01T01:25:00.000Z", "value": "99.99979514793874" },
    //         { "date": "2024-01-01T01:30:00.000Z", "value": "99.99984524997689" },
    //         { "date": "2024-01-01T01:35:00.000Z", "value": "99.99994585531508" },
    //         { "date": "2024-01-01T01:40:00.000Z", "value": "99.99980622512093" },
    //         { "date": "2024-01-01T01:45:00.000Z", "value": "99.99962683800952" },
    //         { "date": "2024-01-01T01:50:00.000Z", "value": "99.99946111136076" },
    //         { "date": "2024-01-01T01:55:00.000Z", "value": "99.99955447831915" }];
    //
    //     const sampleCandleStickSeries = transformToCandleStickSeries(tickSeries);
    //
    //     expect(sampleCandleStickSeries).toEqual([{
    //         "high": "100.000281484046",
    //         "low": "99.999800388247",
    //         "open": "100.00015372651269",
    //         "close": "100.00004959294226",
    //         "ts": "2024-01-01T00:00:00.000Z",
    //     },{
    //         "close": "99.99955447831915",
    //          "high": "99.999945855315",
    //          "low": "99.999461111361",
    //          "open": "99.99988074211633",
    //          "ts": "2024-01-01T01:00:00.000Z",
    //     }]);
    // });
});