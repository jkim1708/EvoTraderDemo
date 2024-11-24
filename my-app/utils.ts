import {ReferencedArea} from "@/components/ui/candleStickChart";

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

function extractDateTime(date: Date, frequency: CANDLESTICK_FREQUENCY): string {

    const aggregateForEveryFourHour = frequency === CANDLESTICK_FREQUENCY.FOUR_HOURLY;

    const day = date.getDate();
    const dayStr = day < 10 ? "0" + day : day;
    const month = date.getMonth() + 1;
    const monthStr = month < 10 ? "0" + month : month;
    const year = date.getFullYear();
    const hour = date.getHours();
    return `${year}-${monthStr}-${dayStr}, ${hour}:00`;

}

export function transformToCandleStickSeries(tickData: { date: Date, value: number }[], frequency: CANDLESTICK_FREQUENCY) {

    if (tickData === undefined || tickData === null ) return;

    const groupedData = tickData.reduce((acc, tick) => {
        const dateTime = extractDateTime(tick.date, frequency);
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

        return {
            high,
            low,
            open,
            close,
            ts,
            lowHigh,
            openClose
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

export const isInExistingInReferenceArea = (referencedArea: ReferencedArea[], currentCursor: string ) => {
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