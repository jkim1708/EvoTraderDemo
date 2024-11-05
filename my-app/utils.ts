export type SampleAssetData = {
    date: Date
    value: number
}[]

// Generate sample data
export const generateData = (startDate: Date, endDate: Date, asset: string): SampleAssetData => {
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
        currentDate = addMinutesToDate(currentDate, 5) // Increment by 1 hour for granularity
    }

    return data
}

function addMinutesToDate(objDate: Date, intMinutes: number) {
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

export function transformToCandleStickSeries(tickData: { date: Date, value: string }[]) {

    if (tickData === undefined || tickData === null ) return;
    const groupedData = tickData.reduce((acc, tick) => {
        const hour = new Date(tick.date).getUTCHours();
        if (!acc[hour]) {
            acc[hour] = [];
        }
        acc[hour].push(tick);
        return acc;
    }, {} as { [key: number]: { date: Date, value: string }[] });

    return Object.values(groupedData).map(group => {
        const high = Math.max(...group.map(tick => parseFloat(tick.value))).toFixed(12);
        const low = Math.min(...group.map(tick => parseFloat(tick.value))).toFixed(12);
        const open = group[0].value;
        const close = group[group.length - 1].value;
        const ts = convertDate(group[0].date);

        return {
            high,
            low,
            open,
            close,
            ts
        };
    });
}

export function convertDate(date: Date): string {
    const day = date.getDate();
    const dayStr = day < 10 ? "0" + day : day;
    const month = date.getMonth() + 1;
    const monthStr = month < 10 ? "0" + month : month;
    const year = date.getFullYear();
    const hour = date.getHours();
    return `${year}.${monthStr}.${dayStr} ${hour}`;
}