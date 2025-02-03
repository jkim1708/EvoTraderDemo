
export type ReferencedArea = {
    referencedAreaLeft: string,
    referencedAreaRight: string,
}


export enum X_AXIS_RESOLUTION {
    ONE_DAY = 24,
    FIVE_DAYS = 5 * 24,
    ONE_MONTH = 30 * 24,
    THREE_MONTH = 3 * 30 * 24,
    SIX_MONTH = 6 * 30 * 24,
    ONE_YEAR = 52, //weeks
    FIVE_YEARS = 5 * 52 //weeks
}

export type SampleAssetData = {
    date: Date
    value: number,
}[]

// Generate sample data
//granularity: number): SampleAssetData => {
export const generateData = (startDate: Date, endDate: Date, asset: string, granularity: number): SampleAssetData => {
    const data = []
    let currentDate = new Date(startDate)
    let value = 1
    const volatility = {
        'EURUSD': 0.0005,
        'GBPUSD': 0.0006,
        'EURCHF': 0.0003,
        'EURNOK': 0.0007
    }[asset] || 0.0005

    while (currentDate <= endDate) {
        value = value + (Math.random() - 0.5) * volatility
        data.push({
            date: currentDate,
            value: Math.max(0, value)
        })
        currentDate = addMinutesToDate(currentDate, granularity) // Increment by 1 hour for granularity
    }

    return data
}

export function addMinutesToDate(objDate: Date, intMinutes: number) {
    const addMlSeconds = intMinutes * 60 * 1000;
    return new Date(objDate.getTime() + addMlSeconds);
}

export function transformToCandleStickData(tickData: { date: string, value: string }[]) {
    const high = Math.max(...tickData.map(tick => parseFloat(tick.value))).toFixed(12);
    const low = Math.min(...tickData.map(tick => parseFloat(tick.value))).toFixed(12);
    const open = tickData[0].value;
    const close = tickData[tickData.length - 1].value;
    const ts = tickData[0].date;

    return {
        high,
        low,
        open,
        close,
        ts
    };
}

export enum CANDLESTICK_FREQUENCY {
    HOURLY,
    FOUR_HOURLY,
}

function extractDateTime(date: Date): string {

    const day = date.getDate();
    const dayStr = day < 10 ? "0" + day : day;
    const month = date.getMonth() + 1;
    const monthStr = month < 10 ? "0" + month : month;
    const year = date.getFullYear();
    const hour = date.getHours();
    return `${year}-${monthStr}-${dayStr}, ${hour}:00`;

}

export function transformToCandleStickSeries(tickData: {
    date: Date,
    value: number
}[]) {

    if (tickData === undefined || tickData === null) return;

    const groupedData = tickData.reduce((acc, tick) => {
        const dateTime = extractDateTime(tick.date);
        if (!acc[dateTime]) {
            acc[dateTime] = [];
        }
        acc[dateTime].push(tick);
        return acc;
    }, {} as { [key: string]: { date: Date, value: number }[] });

    return Object.values(groupedData).map(group => {
        const high = Math.max(...group.map(tick => tick.value)).toFixed(12);
        const low = Math.min(...group.map(tick => tick.value)).toFixed(12);
        const open = group[0].value.toString();
        const close = group[group.length - 1].value.toString();
        const ts = convertToCustomDate(group[0].date);
        const lowHigh = [low, high];
        const openClose = [open, close];
        const movingAverage = '';
        const rsi = '';

        return {
            high,
            low,
            open,
            close,
            ts,
            lowHigh,
            openClose,
            movingAverage,
            rsi
        };
    });
}

export function convertToCustomDate(date: Date): string {
    const day = date.getDate();
    const dayStr = day < 10 ? "0" + day : day;
    const month = date.getMonth() + 1;
    const monthStr = month < 10 ? "0" + month : month;
    const year = date.getFullYear();
    const hour = date.getHours();
    return `${year}-${monthStr}-${dayStr}, ${hour}:00`;
}

export function convertToDate(date: string): Date {

    const dateParts = date.split(",")[0].split("-");
    const hour = date.split(",")[1].split(":")[0].trim();

    const month = dateParts[1];
    const day = dateParts[2];
    const hourStr = Number(hour) < 10 ? "0" + hour : hour;
    return new Date(`${dateParts[0]}-${month}-${day}T${hourStr}:00:00`);
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function findTsInDifferentFrequency(dateTs: string, tsSeries, xAxisResolution: X_AXIS_RESOLUTION, xKind: 'x1' | 'x2') {
    //x1 outside of the view
    const date = new Date(dateTs);
    const firstDateInView = new Date(tsSeries[0].ts);
    const lastDateInView = new Date(tsSeries[tsSeries.length - 1].ts);
    if (xKind === 'x1') {
        if (date < firstDateInView) return firstDateInView;
        if  (date > lastDateInView) return lastDateInView;
    }

    //x2 outside of the view
    if (xKind === 'x2') {
        if (date > lastDateInView) return lastDateInView;
        if (date < firstDateInView) return firstDateInView;
    }

    //x1 or x2 inside the view
    switch (xAxisResolution) {
        case X_AXIS_RESOLUTION.ONE_DAY:
        case X_AXIS_RESOLUTION.FIVE_DAYS:
        case X_AXIS_RESOLUTION.ONE_MONTH:
        case X_AXIS_RESOLUTION.THREE_MONTH:
        case X_AXIS_RESOLUTION.SIX_MONTH:

            for(let i = 0; i < tsSeries.length; i++) {
                //x1 and x2 inside the view
                const isDateSame = tsSeries[i].ts.split(',')[0] === dateTs;
                if (isDateSame) {
                    return tsSeries[i].ts;
                }
            }

            return dateTs;

        case X_AXIS_RESOLUTION.ONE_YEAR:
        case X_AXIS_RESOLUTION.FIVE_YEARS:
            for (let i = 0; i < tsSeries.length-1; i++) {

                const isDateBetweenTwoDates = date >= convertToDate(tsSeries[i].ts) && date <= convertToDate(tsSeries[i + 1].ts);
                if (isDateBetweenTwoDates) {
                    return tsSeries[i].ts;
                }

            }
            console.error("Could not find the ts in the series");
            break;

        default:
            console.error("No valid resolution found");

    }


}

export function isStartDateExistentAlready(randomDateRange: { startDate: Date; endDate: Date }[], startDate: Date) {
    const foundDate = randomDateRange.find(date => {
        return (date.startDate.toISOString().split('T')[0] === startDate.toISOString().split('T')[0]);
    })

    return !!foundDate;

}


//generate 10 random trades which have 1 day duration
export function generateRandomDateRange(offSampleTestStartDate: Date, offSampleTestEndDate: Date): {
    startDate: Date,
    endDate: Date
}[] {
    const randomDateRange: { startDate: Date, endDate: Date }[] = [] as { startDate: Date, endDate: Date }[];
    for (let i = 0; i < 10; i++) {
        const startDate = new Date(offSampleTestStartDate.getTime() + Math.random() * (offSampleTestEndDate.getTime() - offSampleTestStartDate.getTime()));
        if(isStartDateExistentAlready(randomDateRange, startDate)) {
            break;
        }
        const endDate = new Date(addMinutesToDate(startDate, 60 * 12));

        randomDateRange.push({startDate, endDate});
    }
    return randomDateRange;
}

export const isInExistingInReferenceArea = (referencedArea: ReferencedArea[], currentCursor: string) => {
    if (referencedArea.length === 0) {
        return false;
    }

    for (let i = 0; i < referencedArea.length; i++) {
        if (convertToDate(currentCursor) >= convertToDate(referencedArea[i].referencedAreaLeft) && convertToDate(currentCursor) <= convertToDate(referencedArea[i].referencedAreaRight)) {
            return true;
        }
    }

    return false;
}