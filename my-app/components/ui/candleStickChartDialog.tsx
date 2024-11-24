"use client"

import React, {useCallback, useState} from 'react';
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, BarChart, ReferenceArea,
} from 'recharts';
import {
    convertToCustomDate,
    convertToDate,
} from "@/utils";
import {observer} from "mobx-react-lite";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {ChartContainer} from "@/components/ui/chart";
import CandleStickChart from "@/components/ui/candleStickChart";
import {Input} from "@/components/ui/input";



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

export interface Trade {
    kind: 'long' | 'short',
    entryPrice: number,
    ts: string,
    tsEnd: string,
}

interface CandleStickChartAnalyze {
    high: string,
    low: string,
    open: string,
    close: string,
    ts: string,
    trade: Trade,
}

export type CandleStickChartAnalyzeProps = {
    generatedData: CandleStickChartAnalyze[],
    randomTrades: Trade[],
    asset: string,
}

type CustomizedTickProps = {
    x: number,
    y: number,
    payload: {
        value: string
    }
}

const prepareData = (data: CandleStickChart[]): {
    ts: string,
    low: string,
    high: string,
    open: number,
    close: number,
    lowHigh: [number, number],
    openClose: [number, number],
    trade: Trade | null,
} [] => {
    return data.map(({open, close, low, high, ts}) => {
        return {
            ts,
            low,
            high,
            open: parseFloat(open),
            close: parseFloat(close),
            lowHigh: [parseFloat(low), parseFloat(high)] as [number, number],
            openClose: [parseFloat(open), parseFloat(close)] as [number, number],
            trade: null,
        };
    });
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
function transformToSevenDayData(candleStickSeries): {
    ts: string,
    low: string,
    high: string,
    open: number,
    close: number,
    lowHigh: [number, number],
    openClose: [number, number],
    trade: Trade | null,
} [] {

    // Initialize result array
    const aggregatedData: {
        high: string,
        low: string,
        open: string,
        close: string,
        ts: string, // Start of the 4-hour period
        lowHigh: [number, number],
        openClose: [string, string]
    }[] = [];

    // Start the aggregation process
    let currentGroup: {
        high: string,
        low: string,
        open: string,
        close: string,
        ts: string, // Start of the 4-hour period
        lowHigh: [number, number],
        openClose: [number, number]
    }[] = [];
    let currentStartTime: Date | null = null;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    candleStickSeries.forEach((candle) => {
        const candleTime = convertToDate(candle.ts);

        // If we haven't started a group or this timestamp is within the same 7-day interval, add it
        if (!currentStartTime || candleTime < new Date(currentStartTime.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            currentGroup.push(candle);
            if (!currentStartTime) {
                currentStartTime = candleTime;
            }
        } else {
            // Aggregate the current group into a single CandleStickChart
            const open = currentGroup[0].open;
            const close = currentGroup[currentGroup.length - 1].close;
            const high = Math.max(...currentGroup.map(c => parseFloat(c.high)));
            const low = Math.min(...currentGroup.map(c => parseFloat(c.low)));

            // Create an aggregated candle for this 7-day interval
            aggregatedData.push({
                high: high.toString(),
                low: low.toString(),
                open,
                close,
                ts: convertToCustomDate(currentStartTime), // Start of the 4-hour period
                lowHigh: [low, high],
                openClose: [open, close]
            });
            // Start a new group with the current candle
            currentGroup = [candle];
            currentStartTime = candleTime;
        }
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return aggregatedData;
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

enum X_AXIS_RESOLUTION {
    ONE_DAY = 24,
    FIVE_DAYS = 5 * 24,
    ONE_MONTH = 30 * 24,
    THREE_MONTH = 3 * 30 * 24,
    SIX_MONTH = 26, //weeks
    ONE_YEAR = 52, //weeks
    FIVE_YEARS = 5 * 52 //weeks
}

function randomlyAssignTradeToAnyData(preparedData: {
    ts: string;
    low: string;
    high: string;
    open: number;
    close: number;
    lowHigh: [number, number];
    openClose: [number, number];
    trade: Trade | null
}[], randomTrades: Trade[]) {
    randomTrades.forEach((trade: Trade) => {
        const randomIndex = Math.floor(Math.random() * preparedData.length);
        preparedData[randomIndex].trade = trade;
    });

    return preparedData;
}

const CandleStickChartDialog =
    observer((props: CandleStickChartAnalyzeProps) => {

        const [xAxisResolution, setXAxisResolution] = useState(X_AXIS_RESOLUTION.FIVE_YEARS); // Bereich der X-Achse
        const [isDragging, setIsDragging] = useState(false); // Bereich der X-Achse
        const [lastMouseX, setLastMouseX] = useState(0); // Bereich der X-Achse
        const [startIndex, setStartIndex] = useState(0); // Bereich der X-Achse
        const [tickCount, setTickCount] = useState(0); // Bereich der X-Achse
        const [startDate, setStartDate] = useState(""); // Bereich der X-Achse

        const preparedData = prepareData(props.generatedData);

        const data = randomlyAssignTradeToAnyData(preparedData, props.randomTrades);

        const trades = props.randomTrades;

        const sevenDayData = transformToSevenDayData(data);
        const [visibleData, setVisibleData] = useState<{
            ts: string,
            low: string,
            high: string,
            open: number,
            close: number,
            lowHigh: [number, number],
            openClose: [number, number],
            trade: Trade | null,
        } []>(sevenDayData); // Bereich der X-Achse

        const asset = props.asset;



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


        function handleDButton(numberOfLastDaysToShow: X_AXIS_RESOLUTION): void {

            setXAxisResolution(numberOfLastDaysToShow);

            let startIndex;

            switch (xAxisResolution) {
                case X_AXIS_RESOLUTION.ONE_DAY:
                case X_AXIS_RESOLUTION.FIVE_DAYS:
                case X_AXIS_RESOLUTION.ONE_MONTH:
                case X_AXIS_RESOLUTION.THREE_MONTH:
                    startIndex = data.length - numberOfLastDaysToShow;
                    setStartIndex(startIndex);
                    setTickCount(data.length);
                    const slicedData = data.slice(startIndex, startIndex + numberOfLastDaysToShow);
                    setVisibleData(slicedData);
                    break;

                case X_AXIS_RESOLUTION.SIX_MONTH:
                case X_AXIS_RESOLUTION.ONE_YEAR:
                case X_AXIS_RESOLUTION.FIVE_YEARS:
                    startIndex = sevenDayData.length - numberOfLastDaysToShow;
                    setStartIndex(startIndex);
                    setTickCount(sevenDayData.length);
                    setVisibleData(sevenDayData.slice(startIndex, startIndex + numberOfLastDaysToShow));
                    console.log('visibleData', visibleData);
                    break;
                default:
                    console.error('invalid x axis resolution');
            }
        }

        const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (event.button === 2) { // Right mouse button
                event.preventDefault();
                setIsDragging(true);
                setLastMouseX(event.clientX);
            }
        }, []);

        const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (isDragging) {
                const deltaX = event.clientX - lastMouseX;
                const scrollAmount = Math.round(deltaX / 5); // Adjust sensitivity here
                setStartIndex(prevIndex => {
                    const newIndex = Math.max(0, Math.min(data.length - xAxisResolution, prevIndex - scrollAmount));
                    return newIndex;
                });
                setLastMouseX(event.clientX);
                if (xAxisResolution == X_AXIS_RESOLUTION.ONE_YEAR || xAxisResolution == X_AXIS_RESOLUTION.FIVE_YEARS || xAxisResolution == X_AXIS_RESOLUTION.SIX_MONTH) {
                    setVisibleData(sevenDayData.slice(startIndex, startIndex + xAxisResolution));
                } else {
                    setVisibleData(data.slice(startIndex, startIndex + xAxisResolution));
                }
            }
        }, [isDragging, lastMouseX, xAxisResolution, data.length]);

        const handleMouseUp = useCallback(() => {
            setIsDragging(false);
        }, []);

        const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.preventDefault();
        }, []);

        return (
            <div>
                <div className="flex-1">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                            setStartDate(e.target.value)
                                    let startIndex;
                            switch (xAxisResolution) {
                                case X_AXIS_RESOLUTION.ONE_DAY:
                                case X_AXIS_RESOLUTION.FIVE_DAYS:
                                case X_AXIS_RESOLUTION.ONE_MONTH:
                                case X_AXIS_RESOLUTION.THREE_MONTH:
                                    startIndex = data.findIndex((d) => d.ts.split(',')[0].trim() === e.target.value);
                                    console.log(e.target.value);
                                    setStartIndex(startIndex);
                                    setTickCount(data.length);
                                    setVisibleData(data.slice(startIndex, startIndex + xAxisResolution));
                                    console.log('data.slice(startIndex, startIndex + xAxisResolution)',data.slice(startIndex, startIndex + xAxisResolution));
                                    break;

                                case X_AXIS_RESOLUTION.SIX_MONTH:
                                case X_AXIS_RESOLUTION.ONE_YEAR:
                                case X_AXIS_RESOLUTION.FIVE_YEARS:
                                    startIndex = sevenDayData.findIndex((d) => d.ts.split(',')[0].trim() === e.target.value);
                                    console.log(e.target.value);
                                    setStartIndex(startIndex);
                                    setTickCount(sevenDayData.length);
                                    setVisibleData(sevenDayData.slice(startIndex, startIndex + xAxisResolution));
                                    break;
                                default:
                                    console.error('invalid x axis resolution');
                            }
                        }}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <p> {asset} </p>
                <ChartContainer config={{
                    value: {
                        label: "Value",
                        color: "hsl(var(--chart-1))",
                    },
                }}
                                className="h-[400px]"
                                onMouseDown={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleMouseDown(e)}
                                onMouseMove={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleMouseMove(e)}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onContextMenu={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleContextMenu(e)}
                >
                    <ResponsiveContainer
                        width="100%"
                        height={500}
                    >
                        <BarChart
                            width={800}
                            height={250}
                            data={visibleData}
                            margin={{top: 20, right: 30, left: 20, bottom: 20}}
                        >
                            <XAxis dataKey="ts" tickCount={tickCount} tick={CustomizedTick} padding={{'left': 5}}/>
                            <YAxis yAxisId="1" dataKey="lowHigh" domain={['auto', 'auto']} allowDecimals={true}/>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <Bar
                                yAxisId="1"
                                dataKey="openClose"
                                fill="#8884d8"
                                shape={<Candlestick/>}
                                isAnimationActive={false}
                            />

                            {/*// eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
                            {/*// @ts-expect-error take care later*/}
                            <Tooltip cursor={<CustomTooltipCursor/>} content={customTooltipContent}
                                     position={{x: 100, y: -25}} offset={20}/>

                            {trades.map((trade, index) => {
                                    return (
                                        <ReferenceArea key={index} yAxisId="1" x1={trade.ts} x2={trades[index].ts}
                                                       fill={trade.kind == 'long' ? "green" : "red"}
                                                       fillOpacity={0.1}/>
                                    )
                            })}
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <Label> Range </Label>
                <div className="flex space-x-4 mb-4 tradeKindButton">
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.ONE_DAY)}
                    >
                        1D
                    </Button>
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.FIVE_DAYS)}
                    >
                        5D
                    </Button>
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.ONE_MONTH)}
                    >
                        1M
                    </Button>
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.THREE_MONTH)}
                    >
                        3M
                    </Button>
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.SIX_MONTH)}
                    >
                        6M
                    </Button>
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.ONE_YEAR)}
                    >
                        1Y
                    </Button>
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.FIVE_YEARS)}
                    >
                        5Y
                    </Button>
                </div>
            </div>
        );
    });

export default CandleStickChartDialog;