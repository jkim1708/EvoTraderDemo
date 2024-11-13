"use client"

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid, Tooltip, } from 'recharts';
import {
    SampleAssetData,
    transformToCandleStickSeries
} from "@/utils";
import {observer} from "mobx-react-lite";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const Candlestick = props => {
    // let {
    //     x,
    // } = props;

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

    // const offset = -(width/1);

    // x = x + offset;

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
    return data.map(({open, close, low, high, ts}) => {
        return {
            ts,
            low,
            high,
            open: parseFloat(open),
            close: parseFloat(close),
            lowHigh: [low, high],
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
    generatedData: SampleAssetData,
    asset: string,
}

type CustomizedTickProps = {
    x: number,
    y: number,
    payload: {
        value: string
    }
}

function CustomizedTick(props: CustomizedTickProps) {
    const {x, y, payload} = props;

    const date = payload.value.split(",")[0];
    const hour = payload.value.split(",")[1];

    return (
        <g transform={`translate(${x - 20},${y})`}>

            <text>
                <tspan x="0" dy="16">{date}</tspan>
                <tspan x="0" dy="20">{hour}</tspan>
            </text>
        </g>
    )
        ;
}

const CandleStickChartDialog =
    observer((props: CandleStickChartProps) => {

        const generateData = props.generatedData;
        const asset = props.asset;
        // const handleChartClick = props.handleChartClick;

        // const genData = generateData(new Date('2024-01-01'), new Date('2024-01-02'), 'EURUSD');
        const tickSeries: SampleAssetData = generateData;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const candleStickSeries: CandleStickChart[] = transformToCandleStickSeries(tickSeries);

        const data = prepareData(candleStickSeries);

        const CustomTooltipCursor = ({x, y, height}: { x: string, y: string, height: string }) => (
            <path
                d={`M${x},${y} L${x},${y + height}`}
                stroke="rgba(0, 0, 0, 0.2)"
                strokeWidth="1"
            />
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const customTooltipContent = ({payload}) => {
            const open = payload[0] ? parseFloat(payload[0].payload.open).toFixed(4) : "";
            const close = payload[0] ? parseFloat(payload[0].payload.close).toFixed(4) : "";
            const high = payload[0] ? parseFloat(payload[0].payload.high).toFixed(4) : "";
            const low = payload[0] ? parseFloat(payload[0].payload.low).toFixed(4) : "";

            return (

                <p> o {open} h {high} l {low} c {close} </p>
            )
        }

        return (
            <div>
                <p> {asset} </p>
                <BarChart
                    width={800}
                    height={250}
                    data={data}
                    margin={{top: 20, right: 30, left: 20, bottom: 20}}
                >
                    <XAxis dataKey="ts" tickCount={data.length} tick={CustomizedTick} padding={{'left': 5}}/>
                    <YAxis yAxisId="1" dataKey="lowHigh" domain={['auto', 'auto']} allowDecimals={true}/>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <Bar
                        yAxisId="1"
                        dataKey="openClose"
                        fill="#8884d8"
                        shape={<Candlestick/>}
                    >
                    </Bar>

                    {/*// eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
                    {/*// @ts-expect-error take care later*/}
                    <Tooltip cursor={<CustomTooltipCursor/>} content={customTooltipContent}
                             position={{x: 100, y: -25}} offset={20}/>
                </BarChart>
            </div>
        );
    });

export default CandleStickChartDialog;