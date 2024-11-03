// Generate sample data
export const generateData = (startDate: Date, endDate: Date, asset: string) => {
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

    console.log(data);
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

export function transformToCandleStickSeries(tickData: { date: string, value: string }[]) {
    const groupedData = tickData.reduce((acc, tick) => {
        const hour = new Date(tick.date).getUTCHours();
        if (!acc[hour]) {
            acc[hour] = [];
        }
        acc[hour].push(tick);
        return acc;
    }, {} as { [key: number]: { date: string, value: string }[] });

    return Object.values(groupedData).map(group => {
        const high = Math.max(...group.map(tick => parseFloat(tick.value))).toFixed(12);
        const low = Math.min(...group.map(tick => parseFloat(tick.value))).toFixed(12);
        const open = group[0].value;
        const close = group[group.length - 1].value;
        const ts = group[0].date;

        return {
            high,
            low,
            open,
            close,
            ts
        };
    });
}