"use client"

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import {SampleAssetData, transformToCandleStickSeries} from "@/utils";
import {observer} from "mobx-react-lite";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const Candlestick = props => {
    const {
        x,
        y,
        width,
        height,
        low,
        high,
        openClose: [open, close],
    } = props;
    const isGrowing = open < close;
    const color = isGrowing ? 'green' : 'red';
    const ratio = Math.abs(height / (open - close));
    return (
        <g stroke={color} fill={color} strokeWidth="2">
            <path
                d={`
          M ${x},${y}
          L ${x},${y + height}
          L ${x + width},${y + height}
          L ${x + width},${y}
          L ${x},${y}
        `}
            />
            {/* bottom line */}
            {isGrowing ? (
                <path
                    d={`
            M ${x + width / 2}, ${y + height}
            v ${(open - low) * ratio}
          `}
                />
            ) : (
                <path
                    d={`
            M ${x + width / 2}, ${y}
            v ${(close - low) * ratio}
          `}
                />
            )}
            {/* top line */}
            {isGrowing ? (
                <path
                    d={`
            M ${x + width / 2}, ${y}
            v ${(close - high) * ratio}
          `}
                />
            ) : (
                <path
                    d={`
            M ${x + width / 2}, ${y + height}
            v ${(open - high) * ratio}
          `}
                />
            )}
        </g>
    );
};

const prepareData = (data: CandleStickChart[]) => {
    return data.map(({ open, close, ...other }) => {
        return {
            ...other,
            openClose: [open, close],
        };
    });
};

type CandleStickChart = {
    high: string,
    low: string,
    open: string,
    close: string,
    ts: string,
};

export type CandleStickChartProps = {
    generatedData: SampleAssetData
}

const CandleStickChart =
    observer((props: CandleStickChartProps) => {

    const generateData = props.generatedData;

    // const genData = generateData(new Date('2024-01-01'), new Date('2024-01-02'), 'EURUSD');
    const tickSeries: SampleAssetData = generateData;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const candleStickSeries: CandleStickChart[] = transformToCandleStickSeries(tickSeries);

    // const minValue = data.reduce(
    //     (minValue: string, {low}) => {
    //         // const currentMin = Math.min(low, minValue);
    //         return parseFloat(low) < parseFloat(minValue) ? low : minValue;
    //     },
    //     data[0].low,
    // );
    // const maxValue = data.reduce(
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-expect-error
    //     (maxValue, { high }) => {
    //         const currentMax = Math.max(high, maxValue);
    //         return currentMax > maxValue ? currentMax : maxValue;
    //     },
    //     minValue,
    // );

    const data = prepareData(candleStickSeries);

    return (
        <BarChart
            width={1000}
            height={500}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
            <XAxis dataKey="ts" />
            <YAxis domain={['auto', 'auto']} allowDecimals={true} padding={{top:20, bottom:20}}/>
            <CartesianGrid strokeDasharray="3 3" />
            <Bar
                dataKey="openClose"
                fill="#8884d8"
                shape={<Candlestick />}
            >
            </Bar>
        </BarChart>
    );
});

export default CandleStickChart;
