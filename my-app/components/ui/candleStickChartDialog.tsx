"use client"

import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, BarChart, ReferenceArea, Brush,
} from 'recharts';
import {
    convertToCustomDate,
    convertToDate, findTsInDifferentFrequency, X_AXIS_RESOLUTION,
} from "@/utils";
import {observer} from "mobx-react-lite";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
// import {ChartContainer} from "@/components/ui/chart";
import CandleStickChart from "@/components/ui/candleStickChart";
import {TradingStrategy} from "@/store/RootStore";
import {TradingRule} from "@/store/TradingRuleStore";
import {ArrowDownCircle, ArrowUpCircle} from "lucide-react";
import {useResizeObserver} from "@/components/hooks/useResizeObserver";
import {useZoomAndPan} from "@/components/hooks/useZoomAndPan";


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
    return data.map(({open, close, low, high, ts}, index) => {
        return {
            index,
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

const CHART_CLASSES = {
    xAxis: "xAxis",
    grid: "recharts-cartesian-grid",
    line: "chart-bar"
};

// eslint-disable-next-line react/display-name
const RechartsClipPaths = forwardRef((_, ref) => {
    const grid = useRef<SVGRectElement>(null);
    const axis = useRef<SVGRectElement>(null);
    useImperativeHandle(ref, () => ({
        grid,
        axis
    }));

    return (
        <>
            <clipPath id="chart-xaxis-clip">
                <rect fill="rgba(0,0,0,0)" height="100%" ref={axis} />
            </clipPath>
            <clipPath id="chart-grid-clip">
                <rect fill="rgba(0,0,0,0)" height="100%" ref={grid} />
            </clipPath>
        </>
    );
});

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

    // const date = payload.value + "";
    // const hour = '1';

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

function getIndexStartDate(preparedData: {
    ts: string;
    low: string;
    high: string;
    open: number;
    close: number;
    lowHigh: [number, number];
    openClose: [number, number];
    trade: Trade | null
}[], props: CandleStickChartProps) {

    return preparedData.findIndex((data) => {
        return (data.ts.split(',')[0].trim() === props.strategy.backtestingOffSample.startDate.split(',')[0].trim())
    });
}

function getIndexEndDate(preparedData: {
    ts: string;
    low: string;
    high: string;
    open: number;
    close: number;
    lowHigh: [number, number];
    openClose: [number, number];
    trade: Trade | null
}[], props: CandleStickChartProps) {
    return preparedData.findIndex((data) => {
        return (data.ts.split(',')[0].trim() === props.strategy.backtestingOffSample.endDate.split(',')[0].trim())
    });
}

function isTimeRangeGreaterThanThreeMonths(offSampleBacktestTimeRangedData: {
    ts: string;
    low: string;
    high: string;
    open: number;
    close: number;
    lowHigh: [number, number];
    openClose: [number, number];
    trade: Trade | null
}[]) {
    const startDate = convertToDate(offSampleBacktestTimeRangedData[0].ts);
    const endDate = convertToDate(offSampleBacktestTimeRangedData[offSampleBacktestTimeRangedData.length - 1].ts);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 90;
}

const CandleStickChartDialog =
    observer((props: CandleStickChartProps) => {

        const preparedData = prepareData(props.generatedData);

        const indexFoundStartDate = getIndexStartDate(preparedData, props);
        const indexFoundEndDate = getIndexEndDate(preparedData, props);
        const offSampleBacktestTimeRangedData = preparedData.slice(indexFoundStartDate, indexFoundEndDate);

        const fullTimeRangeData = offSampleBacktestTimeRangedData;
        const sevenDayData = transformToSevenDayData(fullTimeRangeData);
        const fullTimeRangeSevenDayData = transformToSevenDayData(sevenDayData);

        let initialXAxisResolution = X_AXIS_RESOLUTION.ONE_DAY;
        let initialVisibleData = offSampleBacktestTimeRangedData;
        let offSampleBacktestLongThanThreeMonths = false;
        if (isTimeRangeGreaterThanThreeMonths(offSampleBacktestTimeRangedData)) {
            offSampleBacktestLongThanThreeMonths = true;
            initialXAxisResolution = X_AXIS_RESOLUTION.SIX_MONTH;
            initialVisibleData = initialVisibleData.filter((_, i) => {
                return i % 3 === 0
            });
        }

        const [xAxisResolution, setXAxisResolution] = useState<X_AXIS_RESOLUTION>(initialXAxisResolution); // Bereich der X-Achse
        const [isDragging, setIsDragging] = useState(false); // Bereich der X-Achse
        const [lastMouseX, setLastMouseX] = useState(0); // Bereich der X-Achse
        // const [tickCount, setTickCount] = useState(0); // Bereich der X-Achse
        const [startIndex, setStartIndex] = useState(0); // Bereich der X-Achse

        // const [
        //     // dataStartIndex,
        //     setDataStartIndex] = useState(34500);
        // const [
        //     // dataEndIndex,
        //     setDataEndIndex] = useState(initialVisibleData.length + 34500);

        const [loaded, setLoaded] = useState(false);
        const {
            clipPathRefs,
            // xPadding,
            onChartMouseDown,
            onChartMouseUp,
            setWrapperRef,
            onChartMouseMove
        } = useZoomAndPan({
            chartLoaded: loaded
        });

        const clipPathRefsz = useRef<{
            grid: React.MutableRefObject<SVGRectElement | null>;
            axis: React.MutableRefObject<SVGRectElement | null>;
        } | null>(null);

        useEffect(() => {
            setTimeout(() => {
                setLoaded(true);
            }, 100);
        }, []);

        const wrapperRef = useRef<null | HTMLDivElement>(null);
        const gridRef = useRef<SVGSVGElement | null>(null);

        const setClipPaths = useCallback(
            (xAxis: SVGSVGElement) => {
                if (
                    wrapperRef.current &&
                    gridRef.current &&
                    clipPathRefsz?.current?.axis?.current &&
                    clipPathRefsz?.current?.grid?.current
                ) {
                    const wrapperRect = wrapperRef.current.getBoundingClientRect();
                    const gridRect = gridRef.current.getBoundingClientRect();
                    clipPathRefsz.current.axis.current.setAttribute(
                        "width",
                        `${gridRect.width + 50}px`
                    );
                    clipPathRefsz.current.axis.current.style.transform = `translateX(${
                        gridRect.x - wrapperRect.x - 50 / 2
                    }px)`;

                    clipPathRefsz.current.grid.current.setAttribute(
                        "width",
                        `${gridRect.width}px`
                    );
                    clipPathRefsz.current.grid.current.style.transform = `translateX(${
                        gridRect.x - wrapperRect.x
                    }px)`;

                    gridRef.current?.setAttribute("clip-path", "url(#chart-grid-clip)");
                    xAxis.setAttribute("clip-path", "url(#chart-xaxis-clip)");
                }
            },
            []
        );

        const resizeObserverCallback = useCallback(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (e) => {
                if (wrapperRef.current) {
                    const xAxis = wrapperRef.current.querySelector(
                        `.${CHART_CLASSES.xAxis}`
                    ) as SVGSVGElement | null;
                    if (xAxis) {
                        setClipPaths(xAxis);
                    }
                }
            },
            [setClipPaths]
        );

        const unobserve = useResizeObserver({
            element: wrapperRef,
            callback: resizeObserverCallback,
            delay: 100
        });

        useEffect(() => () => unobserve());


        const [visibleData] = useState<{
            ts: string,
            low: string,
            high: string,
            open: number,
            close: number,
            lowHigh: [number, number],
            openClose: [number, number],
            trade: Trade | null,
        } []>(initialVisibleData); // Bereich der X-Achse

        const [xPaddingz, setxPaddingz] = useState<[number, number]>([0, 0]);

        // const startDate = '2024-02-01, 0:00';
        // const endDate = '2024-05-01, 0:00';


        const [lastIndex, setLastIndex] = useState(initialVisibleData.length - 1); // Bereich der X-Achse

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

            const runAsync = () => {
                switch (numberOfLastDaysToShow) {
                    case X_AXIS_RESOLUTION.ONE_DAY:
                    case X_AXIS_RESOLUTION.FIVE_DAYS:
                    case X_AXIS_RESOLUTION.ONE_MONTH:
                    case X_AXIS_RESOLUTION.THREE_MONTH:
                        startIndex = fullTimeRangeData.length - numberOfLastDaysToShow;
                        // // setVisibleData(fullTimeRangeData.slice(startIndex));
                        setLastIndex(fullTimeRangeData.slice(startIndex).length - 1);
                        break;
                    case X_AXIS_RESOLUTION.SIX_MONTH:
                        startIndex = fullTimeRangeData.length - numberOfLastDaysToShow;
                        //set visible range and take out every 3rd element
                        const thirdRangeData = fullTimeRangeData.slice(startIndex).filter((_, i) => {
                            return i % 3 === 0
                        });
                        // // setVisibleData(thirdRangeData);
                        setLastIndex(thirdRangeData.length - 1);
                        break;

                    case X_AXIS_RESOLUTION.ONE_YEAR:
                    case X_AXIS_RESOLUTION.FIVE_YEARS:
                        startIndex = fullTimeRangeSevenDayData.length - numberOfLastDaysToShow;
                        // // setVisibleData(fullTimeRangeSevenDayData.slice(startIndex));
                        setLastIndex(fullTimeRangeSevenDayData.slice(startIndex).length - 1);
                        break;
                    default:
                        console.error('invalid x axis resolution');
                }
            }


            runAsync();

            setXAxisResolution(numberOfLastDaysToShow);
            // setTickCount(numberOfLastDaysToShow);
            if (startIndex) setStartIndex(startIndex);

        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (event.button === 2) { // Right mouse button
                event.preventDefault();
                setIsDragging(true);
                setLastMouseX(event.clientX);

            }
        }, []);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const handleMouseMove = useCallback(async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (isDragging) {
                const deltaX = event.clientX - lastMouseX;
                const scrollAmount = Math.round(deltaX); // Adjust sensitivity here
                let newStartIndex = 0;
                if (startIndex != null || startIndex != undefined) {
                    newStartIndex = Math.max(0, startIndex - scrollAmount);
                }
                let lastIndex;
                // setLastMouseX(event.clientX);
                switch (xAxisResolution) {
                    case X_AXIS_RESOLUTION.ONE_DAY:
                    case X_AXIS_RESOLUTION.FIVE_DAYS:
                    case X_AXIS_RESOLUTION.ONE_MONTH:
                    case X_AXIS_RESOLUTION.THREE_MONTH:
                        //prevent going out of off sample backtesting range
                        lastIndex = Math.min(fullTimeRangeData.length - 1, newStartIndex + visibleData.length - 1);
                        //prevent start index bigger than last index
                        lastIndex = Math.max(10, lastIndex)
                        newStartIndex = Math.min(lastIndex - 10, newStartIndex);

                        // const slice = fullTimeRangeData.slice(newStartIndex, lastIndex);
                        // // // setVisibleData(slice);
                        break;

                    case X_AXIS_RESOLUTION.SIX_MONTH:
                        //prevent going out of off sample backtesting range
                        lastIndex = Math.min(initialVisibleData.length - 1, newStartIndex + initialVisibleData.length - 1);
                        //prevent start index bigger than last index
                        lastIndex = Math.max(10, lastIndex)
                        newStartIndex = Math.min(lastIndex - 10, newStartIndex);

                        setxPaddingz([xPaddingz[0] + scrollAmount,xPaddingz[1] - scrollAmount]);

                        const target = event.target as HTMLElement | null;
                        if (target && clipPathRefsz?.current?.axis?.current) {
                            const {
                                width,
                                left
                            } = clipPathRefsz.current.axis.current.getBoundingClientRect();
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const x = Math.min(Math.max(event.clientX - left, 0), width);
                            // setMousePositionToGrid((state) => {
                            //     if (!state?.width) return { x, width };
                            //     return {
                            //         ...state,
                            //         x
                            //     };
                            // });
                        }
                        // setDataStartIndex(newStartIndex + 34500);
                        // setDataEndIndex(lastIndex + 34500);

                        break;

                    case X_AXIS_RESOLUTION.ONE_YEAR:
                    case X_AXIS_RESOLUTION.FIVE_YEARS:
                        //prevent going out of off sample backtesting range
                        lastIndex = Math.min(fullTimeRangeSevenDayData.length - 1, newStartIndex + visibleData.length - 1)
                        //prevent start index bigger than last index
                        lastIndex = Math.max(10, lastIndex)
                        newStartIndex = Math.min(lastIndex - 10, newStartIndex);

                        // const slice1 = fullTimeRangeSevenDayData.slice(newStartIndex, lastIndex);
                        // // // setVisibleData(slice1);
                        break;
                    default:
                }

                // setStartIndex(newStartIndex ?? 0);
                // setLastIndex(lastIndex ?? 0);

            }
        }, [isDragging, lastMouseX]);

        // const   handleMouseUp = useCallback(() => {
        //     setIsDragging(false);
        // }, []);

        // const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        //     event.preventDefault();
        // }, []);

        useEffect(() => {
            const chartContainer = wrapperRef.current;
            if (chartContainer) {
                const handleWheel = (e: WheelEvent) => {
                    e.preventDefault();
                    // const scrollAmount = Math.round((e.deltaY * (visibleData.length / 100))); // Adjust sensitivity here
                    const scrollAmount = Math.round((e.deltaY * (initialVisibleData.length / 1000))); // Adjust sensitivity here
                    let newStartIndex = 0;
                    let newLastIndex = 0;
                    if (startIndex != null || startIndex != undefined || lastIndex != null || lastIndex != undefined) {
                        newStartIndex = Math.max(0, startIndex + scrollAmount);
                        newLastIndex = Math.max(0, lastIndex - scrollAmount);
                    }

                    switch (xAxisResolution) {
                        case X_AXIS_RESOLUTION.ONE_DAY:
                        case X_AXIS_RESOLUTION.FIVE_DAYS:
                        case X_AXIS_RESOLUTION.ONE_MONTH:
                        case X_AXIS_RESOLUTION.THREE_MONTH:
                            newStartIndex = Math.min(fullTimeRangeData.length - 10, newStartIndex);
                            //prevent last index out of range
                            // newLastIndex = Math.min(fullTimeRangeData.length - 1, lastIndex + scrollAmount);
                            newLastIndex = Math.min(fullTimeRangeData.length - 1, newLastIndex);

                            //prevent index crossing each other
                            newLastIndex = Math.max(newStartIndex + 10, newLastIndex);

                            // const slice = fullTimeRangeData.slice(newStartIndex, newLastIndex);
                            // // setVisibleData(slice);

                            break;

                        case X_AXIS_RESOLUTION.SIX_MONTH:
                            if (offSampleBacktestLongThanThreeMonths) {
                                newStartIndex = Math.min(initialVisibleData.length - 10, newStartIndex);
                                //prevent last index out of range
                                // newLastIndex = Math.min(fullTimeRangeData.length - 1, lastIndex + scrollAmount);
                                newLastIndex = Math.min(initialVisibleData.length - 1, newLastIndex);

                                //prevent index crossing each other
                                newLastIndex = Math.max(newStartIndex + 10, newLastIndex);

                                // const slice = initialVisibleData.slice(newStartIndex, newLastIndex);

                                // setDataStartIndex(newStartIndex + 34500);
                                // setDataEndIndex(newLastIndex + 34500);


                                // // setVisibleData(slice);
                            }
                            break;

                        case X_AXIS_RESOLUTION.ONE_YEAR:
                        case X_AXIS_RESOLUTION.FIVE_YEARS:
                            newStartIndex = Math.min(fullTimeRangeSevenDayData.length - 10, newStartIndex);

                            //prevent last index out of range
                            newLastIndex = Math.min(fullTimeRangeSevenDayData.length - 1, lastIndex + scrollAmount);

                            //prevent index crossing each other
                            newLastIndex = Math.max(newStartIndex + 10, newLastIndex);
                            // const slice1 = fullTimeRangeSevenDayData.slice(newStartIndex);
                            // // setVisibleData(slice1);
                            break;
                        default:
                    }
                    // setTickCount(visibleData.length);
                    setStartIndex(newStartIndex ?? 0);
                    setLastIndex(newLastIndex ?? 0);

                };

                chartContainer.addEventListener('wheel', handleWheel, {passive: false});

                return () => {
                    chartContainer.removeEventListener('wheel', handleWheel);
                };
            }
        }, [startIndex]);

        return (
            <div className={"border rounded p-3"}>
                <div className={"flex space-x-8"}>
                    <div className="flex space-x-2 mb-4 tradeKindButton">
                        <Button
                            // variant={currentSelectedTradeKind === 'long' ? 'default' : 'outline'}
                            className={"bg-blue-700 opacity-30"}
                            disabled={true}
                        >
                            <ArrowUpCircle className="mr-2 h-4 w-4"/> Long
                        </Button>
                        <Button
                            // variant={currentSelectedTradeKind === 'short' ? 'default' : 'outline'}
                            className={"bg-orange-700 opacity-30"}
                            disabled={true}
                        >
                            <ArrowDownCircle className="mr-2 h-4 w-4"/> Short
                        </Button>
                    </div>

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
                        {/*< Button*/}
                        {/*    onClick={() => handleDButton(X_AXIS_RESOLUTION.SIX_MONTH)}*/}
                        {/*    {...xAxisResolution == X_AXIS_RESOLUTION.SIX_MONTH ? {} : {variant: "outline"}}*/}
                        {/*>*/}
                        {/*    6M*/}
                        {/*</Button>*/}
                        {/*< Button*/}
                        {/*    onClick={() => handleDButton(X_AXIS_RESOLUTION.ONE_YEAR)}*/}
                        {/*    {...xAxisResolution == X_AXIS_RESOLUTION.ONE_YEAR ? {} : {variant: "outline"}}*/}
                        {/*>*/}
                        {/*    1Y*/}
                        {/*</Button>*/}
                        {/*< Button*/}
                        {/*    onClick={() => handleDButton(X_AXIS_RESOLUTION.FIVE_YEARS)}*/}
                        {/*    {...xAxisResolution == X_AXIS_RESOLUTION.FIVE_YEARS ? {} : {variant: "outline"}}*/}
                        {/*>*/}
                        {/*    5Y*/}
                        {/*</Button>*/}
                    </div>
                </div>

                <p> {asset} </p>
                {/*<ChartContainer config={{*/}
                {/*    value: {*/}
                {/*        label: "Value",*/}
                {/*        color: "hsl(var(--chart-1))",*/}
                {/*    },*/}
                {/*}}*/}
                {/*                ref={setWrapperRef}*/}
                {/*                className="h-[400px]"*/}
                {/*                // onMouseDown={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleMouseDown(e)}*/}
                {/*                // onMouseMove={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleMouseMove(e)}*/}
                {/*                // onMouseUp={handleMouseUp}*/}

                {/*                onMouseLeave={handleMouseUp}*/}
                {/*                onContextMenu={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleContextMenu(e)}*/}
                {/*>*/}
                    <ResponsiveContainer
                        width="100%"
                        height={500}
                        ref={setWrapperRef}
                    >
                        <BarChart
                            width={800}
                            height={250}
                            data={visibleData}
                            margin={{top: 20, right: 30, left: 20, bottom: 20}}
                            onMouseDown={onChartMouseDown}
                            onMouseMove={onChartMouseMove}
                            onMouseUp={onChartMouseUp}
                        >
                            <defs>
                                <RechartsClipPaths ref={clipPathRefs}/>
                            </defs>
                            {/*<XAxis dataKey="index"*/}
                            {/*    // tickCount={tickCount}*/}
                            {/*       tick={CustomizedTick}*/}
                            {/*       padding={{left: xPadding[0], right: xPadding[1]}}*/}
                            {/*       domain={[dataStartIndex, dataEndIndex]}*/}
                            {/*       type={'number'}*/}
                            {/*       allowDataOverflow*/}
                            {/*/>*/}
                            <XAxis dataKey="ts"
                                // tickCount={tickCount}
                                   tick={CustomizedTick}
                            />
                            <YAxis yAxisId="1" dataKey="lowHigh" domain={['auto', 'auto']} allowDecimals={true}/>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <Bar
                                yAxisId="1"
                                dataKey="openClose"
                                fill="#8884d8"
                                shape={<Candlestick/>}
                                isAnimationActive={false}
                            />
                            <Brush dataKey="ts" height={30} stroke="#8884d8" />
                            {/*// eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
                            {/*// @ts-expect-error take care later*/}
                            <Tooltip content={customTooltipContent} cursor={<CustomTooltipCursor/>}
                                     position={{x: 100, y: -25}} offset={20}/>

                            {props.randomTrades.map((trade, index) => (<ReferenceArea yAxisId="1" key={index}
                                                                                      x1={findTsInDifferentFrequency(trade.startTime.split(',')[0], visibleData, xAxisResolution, 'x1')}
                                                                                      x2={findTsInDifferentFrequency(trade.endTime.split(',')[0], visibleData, xAxisResolution, 'x2')}
                                                                                      fill={trade.kind == 'long' ? "blue" : "red"}
                                                                                      fillOpacity={0.3}/>))}
                        </BarChart>
                    </ResponsiveContainer>
                {/*</ChartContainer>*/}
                <Label> Range </Label>

            </div>
        );
    });

export default CandleStickChartDialog;