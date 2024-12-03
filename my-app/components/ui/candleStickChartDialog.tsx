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
    convertToDate, findTsInDifferentFrequency, X_AXIS_RESOLUTION,
} from "@/utils";
import {observer} from "mobx-react-lite";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {ChartContainer} from "@/components/ui/chart";
import CandleStickChart from "@/components/ui/candleStickChart";
import {Input} from "@/components/ui/input";
import {TradingStrategy} from "@/store/RootStore";
import {TradingRule} from "@/store/TradingRuleStore";


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

            <path d={`
          M ${x},${y}
          L ${x},${y + height}
          L ${x + width},${y + height}
          L ${x + width},${y}
          L ${x},${y}
        `}/>
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
}

export type CandleStickChartProps = {
    generatedData: CandleStickChartAnalyze[],
    randomTrades: TradingRule[],
    strategy: TradingStrategy,
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
    observer((props: CandleStickChartProps) => {

        const [xAxisResolution, setXAxisResolution] = useState(X_AXIS_RESOLUTION.FIVE_YEARS); // Bereich der X-Achse
        const [isDragging, setIsDragging] = useState(false); // Bereich der X-Achse
        const [lastMouseX, setLastMouseX] = useState(0); // Bereich der X-Achse
        const [tickCount, setTickCount] = useState(0); // Bereich der X-Achse
        const [startIndex, setStartIndex] = useState(0); // Bereich der X-Achse
        const [startDate, setStartDate] = useState(""); // Bereich der X-Achse

        const preparedData = prepareData(props.generatedData);

        const fullTimeRangeData = randomlyAssignTradeToAnyData(preparedData, []);

        const sevenDayData = transformToSevenDayData(fullTimeRangeData);
        const fullTimeRangeSevenDayData = transformToSevenDayData(sevenDayData);

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

        const asset = props.strategy.tradingRules[0].asset;

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


        function handleDButton(numberOfLastDaysToShow: X_AXIS_RESOLUTION) {
            let startIndex;

            const runAsync =     () => {
                switch (numberOfLastDaysToShow) {
                    case X_AXIS_RESOLUTION.ONE_DAY:
                    case X_AXIS_RESOLUTION.FIVE_DAYS:
                    case X_AXIS_RESOLUTION.ONE_MONTH:
                    case X_AXIS_RESOLUTION.THREE_MONTH:
                        startIndex = fullTimeRangeData.length - numberOfLastDaysToShow;
                        setVisibleData(fullTimeRangeData.slice(startIndex));
                        break;
                    case X_AXIS_RESOLUTION.SIX_MONTH:
                        startIndex = fullTimeRangeData.length - numberOfLastDaysToShow;
                        //set visible range and take out every 3rd element
                        const thirdRangeData = fullTimeRangeData.slice(startIndex).filter((_, i) => {return i % 3 === 0});
                        setVisibleData(thirdRangeData);
                        break;

                    case X_AXIS_RESOLUTION.ONE_YEAR:
                    case X_AXIS_RESOLUTION.FIVE_YEARS:
                        startIndex = fullTimeRangeSevenDayData.length - numberOfLastDaysToShow;
                        setVisibleData(fullTimeRangeSevenDayData.slice(startIndex));
                        break;
                    default:
                        console.error('invalid x axis resolution');
                }
            }

            runAsync();
            setXAxisResolution(numberOfLastDaysToShow);
            setTickCount(numberOfLastDaysToShow);
            if(startIndex) setStartIndex(startIndex);

        }

        const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (event.button === 2) { // Right mouse button
                event.preventDefault();
                setIsDragging(true);
                setLastMouseX(event.clientX);
            }
        }, []);

        const handleMouseMove = useCallback(async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (isDragging) {
                const deltaX = event.clientX - lastMouseX;
                const scrollAmount = Math.round(deltaX / 5); // Adjust sensitivity here
                let newStartIndex = 0;
                if (startIndex) {
                    newStartIndex = Math.max(0, startIndex - scrollAmount);
                }

                setLastMouseX(event.clientX);
                switch (xAxisResolution) {
                    case X_AXIS_RESOLUTION.ONE_DAY:
                    case X_AXIS_RESOLUTION.FIVE_DAYS:
                    case X_AXIS_RESOLUTION.ONE_MONTH:
                    case X_AXIS_RESOLUTION.THREE_MONTH:
                    case X_AXIS_RESOLUTION.SIX_MONTH:
                        const slice = fullTimeRangeData.slice(newStartIndex, newStartIndex + xAxisResolution);
                        setVisibleData(slice);
                        break;

                    case X_AXIS_RESOLUTION.ONE_YEAR:
                    case X_AXIS_RESOLUTION.FIVE_YEARS:
                        const slice1 = fullTimeRangeSevenDayData.slice(newStartIndex, newStartIndex + xAxisResolution);
                        setVisibleData(slice1);
                        break;
                    default:
                }

                setStartIndex(newStartIndex ?? 0);

            }
        }, [isDragging, lastMouseX]);

        const handleMouseUp = useCallback(() => {
            setIsDragging(false);
        }, []);

        const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.preventDefault();
        }, []);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        function isOutsideOfRange(fullTimeRangeData, startIndex, xAxisResolution: X_AXIS_RESOLUTION.ONE_DAY | X_AXIS_RESOLUTION.FIVE_DAYS | X_AXIS_RESOLUTION.ONE_MONTH | X_AXIS_RESOLUTION.THREE_MONTH | X_AXIS_RESOLUTION.SIX_MONTH | X_AXIS_RESOLUTION.ONE_YEAR | X_AXIS_RESOLUTION.FIVE_YEARS) {
            return ((startIndex + xAxisResolution) > fullTimeRangeData.length)
        }



        function findClosestDateIndex(fullTimeRangeSevenDayData: {
            ts: string;
            low: string;
            high: string;
            open: number;
            close: number;
            lowHigh: [number, number];
            openClose: [number, number];
            trade: Trade | null
        }[], value: Date) {
            let resultIndex;
            fullTimeRangeSevenDayData.forEach((data, index) => {
                if ((new Date(data.ts.split(',')[0]).getTime() < value.getTime()) && (value.getTime() < new Date(fullTimeRangeSevenDayData[index+1].ts.split(',')[0]).getTime())) {
                    resultIndex =  index;
                }
            });

            return resultIndex ?? -1;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const handleStartDateChange = (e) => {
            setStartDate(e.target.value)
            let end;
            let startIndex;
            switch (xAxisResolution) {
                case X_AXIS_RESOLUTION.ONE_DAY:
                case X_AXIS_RESOLUTION.FIVE_DAYS:
                case X_AXIS_RESOLUTION.ONE_MONTH:
                case X_AXIS_RESOLUTION.THREE_MONTH:
                case X_AXIS_RESOLUTION.SIX_MONTH:
                    startIndex = fullTimeRangeData.findIndex((d) => d.ts.split(',')[0].trim() === e.target.value);
                    end = isOutsideOfRange(fullTimeRangeData, startIndex, xAxisResolution) ? (fullTimeRangeData.length - 1) : (startIndex + xAxisResolution);
                    setVisibleData(fullTimeRangeData.slice(startIndex, end));
                    break;

                case X_AXIS_RESOLUTION.ONE_YEAR:
                case X_AXIS_RESOLUTION.FIVE_YEARS:
                    //needed because dates from calendar might not be in the chart since in years range view we have a ffrequency of 7 days
                    startIndex = findClosestDateIndex(fullTimeRangeSevenDayData, new Date(e.target.value));
                    end = isOutsideOfRange(fullTimeRangeSevenDayData, startIndex, xAxisResolution) ? (fullTimeRangeSevenDayData.length - 1) : (startIndex + xAxisResolution);
                    setVisibleData(fullTimeRangeSevenDayData.slice(startIndex, end));
                    break;
                default:
                    console.error('invalid x axis resolution');
            }

            setTickCount(visibleData.length);
            setStartIndex(startIndex ?? 0);

        };
        return (
            <div>
                <div className="flex-1">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
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
                            <XAxis dataKey="ts" tickCount={tickCount}
                                   tick={CustomizedTick}
                                   padding={{'left': 5}}/>
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
                            <Tooltip content={customTooltipContent} cursor={<CustomTooltipCursor/>}
                                     position={{x: 100, y: -25}} offset={20}/>

                            {/*off sample backtesting area*/}
                            <ReferenceArea yAxisId="1"
                                           x1={findTsInDifferentFrequency(props.strategy.backtestingOffSample.startDate, visibleData, xAxisResolution, 'x1')}
                                           x2={findTsInDifferentFrequency(props.strategy.backtestingOffSample.endDate, visibleData, xAxisResolution, 'x2')}
                                           fill={"grey"}
                                           fillOpacity={0.2}/>

                            {/*on sample backtesting area*/}
                            <ReferenceArea yAxisId="1"
                                           x1={findTsInDifferentFrequency(props.strategy.backtestingOnSample.startDate, visibleData, xAxisResolution, 'x1')}
                                           x2={findTsInDifferentFrequency(props.strategy.backtestingOnSample.endDate, visibleData, xAxisResolution, 'x2')}
                                           fill={"grey"}
                                           fillOpacity={0.4}/>


                            {props.randomTrades.map((trade, index) => (<ReferenceArea yAxisId="1" key={index}
                                                                                      x1={findTsInDifferentFrequency(trade.startTime.split(',')[0], visibleData, xAxisResolution, 'x1')}
                                                                                      x2={findTsInDifferentFrequency(trade.endTime.split(',')[0], visibleData, xAxisResolution, 'x2')}
                                                                                      fill={trade.kind == 'long' ? "blue" : "red"}
                                                                                      fillOpacity={0.3}/>))}
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <Label> Range </Label>
                <div className="flex space-x-4 mb-4 tradeKindButton">
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.ONE_DAY)}
                        {...xAxisResolution == X_AXIS_RESOLUTION.ONE_DAY ? {} : {variant: "outline"}}
                    >
                        1D
                    </Button>
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.FIVE_DAYS)}
                        {...xAxisResolution == X_AXIS_RESOLUTION.FIVE_DAYS ? {} : {variant: "outline"}}
                    >
                        5D
                    </Button>
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.ONE_MONTH)}
                        {...xAxisResolution == X_AXIS_RESOLUTION.ONE_MONTH ? {} : {variant: "outline"}}
                    >
                        1M
                    </Button>
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.THREE_MONTH)}
                        {...xAxisResolution == X_AXIS_RESOLUTION.THREE_MONTH ? {} : {variant: "outline"}}
                    >
                        3M
                    </Button>
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.SIX_MONTH)}
                        {...xAxisResolution == X_AXIS_RESOLUTION.SIX_MONTH ? {} : {variant: "outline"}}
                    >
                        6M
                    </Button>
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.ONE_YEAR)}
                        {...xAxisResolution == X_AXIS_RESOLUTION.ONE_YEAR ? {} : {variant: "outline"}}
                    >
                        1Y
                    </Button>
                    < Button
                        onClick={() => handleDButton(X_AXIS_RESOLUTION.FIVE_YEARS)}
                        {...xAxisResolution == X_AXIS_RESOLUTION.FIVE_YEARS ? {} : {variant: "outline"}}
                    >
                        5Y
                    </Button>
                </div>
            </div>
        );
    });

export default CandleStickChartDialog;