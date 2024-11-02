// Generate sample data
export const generateData = (startDate: Date, endDate: Date, asset: string) => {
    const data = []
    const currentDate = new Date(startDate)
    let value = 100
    const volatility = {
        'EURUSD': 0.0005,
        'GBPUSD': 0.0006,
        'EURCHF': 0.0003,
        'EURNOK': 0.0007
    }[asset] || 0.0005

    while (currentDate <= endDate) {
        value = value + (Math.random() - 0.5) * volatility
        data.push({
            date: currentDate.toISOString().split('T')[0],
            value: Math.max(0, value)
        })
        currentDate.setHours(currentDate.getHours() + 1) // Increment by 1 hour for granularity
    }

    console.log(data);
    return data
}