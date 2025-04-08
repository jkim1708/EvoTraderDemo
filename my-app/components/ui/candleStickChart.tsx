"use client"

import React, {Suspense, useCallback, useState} from 'react';
import {
    Bar,
    CartesianGrid,
    ComposedChart, Line, LineChart,
    ReferenceArea, ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {convertToDate, isInExistingInReferenceArea, X_AXIS_RESOLUTION,} from "@/utils";
import {observer} from "mobx-react-lite";
import {useStores} from "@/store/Provider";
import {Button} from "@/components/ui/button";
import {ChartContainer} from "@/components/ui/chart";
import {CategoricalChartState} from "recharts/types/chart/types";
import {ArrowDownCircle, ArrowUpCircle} from "lucide-react";

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
        <Suspense>
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
        </Suspense>
    );
};

type CandleStickChart = {
    high: string,
    low: string,
    open: string,
    close: string,
    ts: string,
    movingAverage: string,
    rsi: string,
};

export type CandleStickChartProps = {
    data: CandleStickChart[],
    asset: string,
}


export type ReferencedArea = {
    referencedAreaLeft: string,
    referencedAreaRight: string,
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

function attachMovingAverageData(data: CandleStickChart[]): CandleStickChart[] {
    data.map((tickData, index) => {
        const movingAverage = data.slice(Math.max(0, index - (14*24)), index)
                .reduce((acc, tickData) => {
                    return acc + parseFloat(tickData.close);
                }, 0)

            / (14*24);
        if (index < (14*24)) {
            tickData['movingAverage'] = tickData.close;
        } else {
            tickData['movingAverage'] = movingAverage.toString();
        }
    });

    return data;
}

function calculateRSI(data: CandleStickChart[], period: number = 24*14): CandleStickChart[] {
    let gains = 0;
    let losses = 0;

    // Initialize the first period
    for (let i = 0; i <= period; i++) {
        const change = parseFloat(data[i].close) - parseFloat(data[i +1].close);
        if (change > 0) {
            gains += change;
        } else {
            losses -= change;
        }
        data[i]['rsi'] = '40';
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate RSI for the rest of the data
    for (let i = period; i < data.length; i++) {
        const change = parseFloat(data[i].close) - parseFloat(data[i - 24].close);
        if (change > 0) {
            gains = change;
            losses = 0;
        } else {
            gains = 0;
            losses = -change;
        }

        avgGain = (avgGain * (period - 1) + gains) / period;
        avgLoss = (avgLoss * (period - 1) + losses) / period;

        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        data[i]['rsi'] = rsi.toString();
    }

    return data;
}

const CandleStickChart =
    observer((props: CandleStickChartProps) => {

        const {
            tradingRuleStore: {
                tradingRules,
                setTradingRule,
                currentSelectedAsset,
                definedRefArea,
                currentSelectedTradeKind,
                setCurrentSelectedTradeKind,
            },
        } = useStores();


        const [xAxisResolution, setXAxisResolution] = useState(X_AXIS_RESOLUTION.THREE_MONTH); // Bereich der X-Achse
        // const [ setIsDragging] = useState(false); // Bereich der X-Achse
        // const [ setLastMouseX] = useState(0); // Bereich der X-Achse
        const [startIndex, setStartIndex] = useState(0); // Bereich der X-Achse

        const asset = props.asset;
        const dataWithMovingAverage = attachMovingAverageData(props.data);
        const data = ((dataWithMovingAverage.length > 0) ? calculateRSI(dataWithMovingAverage) : dataWithMovingAverage);
        // const data = props.data;

        const [refAreaLeft, setRefAreaLeft] = useState('');
        const [refAreaRight, setRefAreaRight] = useState('');

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

        function resetRefAreaSelection() {
            setRefAreaLeft('');
            setRefAreaRight('');
        }

        function isRefAreaSelectionDefined() {
            return refAreaLeft && refAreaRight;
        }

        function saveReferenceAreaSelection() {
            definedRefArea.push({
                referencedAreaLeft: refAreaLeft,
                referencedAreaRight: refAreaRight,
                tradeKind: currentSelectedTradeKind
            });
        }

        function createTrade(profitNLoss: number) {
            const newTradingRules = tradingRules
            newTradingRules.push({
                kind: currentSelectedTradeKind,
                startTime: refAreaLeft,
                endTime: refAreaRight,
                asset: currentSelectedAsset,
                profitNLoss: profitNLoss
            });
            setTradingRule(newTradingRules);
        }

        function calculateProfitNLoss(refAreaLeft: string, refAreaRight: string, kind: "short" | "long") {

            const refAreaLeftOpenValue = parseFloat(data.find((tickData) => tickData.ts === refAreaLeft)?.open ?? "");
            const refAreaRightCloseValue = parseFloat(data.find((tickData) => tickData.ts === refAreaRight)?.close ?? "");

            if (refAreaLeftOpenValue === undefined || refAreaRightCloseValue === undefined) {
                console.error("invalid refAreaLeftOpenValue or refAreaRightCloseValue");
                return;
            }

            switch (kind) {
                case "short":
                    return (refAreaLeftOpenValue - refAreaRightCloseValue);
                    break;
                case "long":
                    return (refAreaRightCloseValue - refAreaLeftOpenValue);
                    break;

                default:
                    console.error("invalid kind");
            }
        }

        function isRefAreaSelectionOverlapping(definedRefArea: {
            referencedAreaLeft: string;
            referencedAreaRight: string
        }[], refAreaLeft: string, refAreaRight: string) {
            for (let i = 0; i < definedRefArea.length; i++) {
                //intersect condition x1 < y2 && y1 < x2
                if (convertToDate(definedRefArea[i].referencedAreaLeft) < convertToDate(refAreaRight) && convertToDate(refAreaLeft) < convertToDate(definedRefArea[i].referencedAreaRight)) {
                    return true;
                }
            }
            return false;
        }

        const defineReferenceArea = () => {

            if (isRefAreaSelectionDefined() && !isRefAreaSelectionOverlapping(definedRefArea, refAreaLeft, refAreaRight)) {
                saveReferenceAreaSelection();
                const profitNLoss = calculateProfitNLoss(refAreaLeft, refAreaRight, currentSelectedTradeKind);

                createTrade(profitNLoss ?? 0);
            }
            resetRefAreaSelection();
        }

        async function handleDButton(numberOfLastDaysToShow: X_AXIS_RESOLUTION) {

            switch (numberOfLastDaysToShow) {
                case X_AXIS_RESOLUTION.ONE_DAY:
                case X_AXIS_RESOLUTION.FIVE_DAYS:
                case X_AXIS_RESOLUTION.ONE_MONTH:
                case X_AXIS_RESOLUTION.THREE_MONTH:
                case X_AXIS_RESOLUTION.SIX_MONTH:
                    setStartIndex(0);
                    setXAxisResolution(numberOfLastDaysToShow);

            }
        }

        //
        const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (event.button === 2) { // Right mouse button
                event.preventDefault();
                // setIsDragging(true);
                // setLastMouseX(event.clientX);
            }
        }, []);

        // const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        //     if (isDragging) {
        //         const deltaX = event.clientX - lastMouseX;
        //         const scrollAmount = Math.round(deltaX / 5); // Adjust sensitivity here
        //         setStartIndex(prevIndex => {
        //             const newIndex = Math.max(0, Math.min(data.length - xAxisResolution, prevIndex - scrollAmount));
        //             return newIndex;
        //         });
        //         setLastMouseX(event.clientX);
        //         setCurrentTradingStrategyOnSampleRange(xAxisResolution);
        //     }
        // }, [isDragging, lastMouseX, xAxisResolution, data.length]);

        const handleMouseUp = useCallback(() => {
            // setIsDragging(false);
        }, []);

        const visibleData = data.slice(startIndex, startIndex + xAxisResolution)

        const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.preventDefault();
        }, []);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const debounce = (fn, delay)=> {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            let timeoutId;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            return (...args) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => fn(...args), delay);
            };
        }

        const handleOnMouseMove = (nextState: CategoricalChartState, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (event.button === 0) {
                if (nextState.activeLabel) {
                    //     // && refAreaLeft && !isInExistingInReferenceArea(definedRefArea, nextState.activeLabel))
                    if (nextState.activeLabel != refAreaRight) {
                        setRefAreaRight(nextState.activeLabel)
                    }
                }
            }
        }

        const debouncedHandleOnMouseMove = useCallback(debounce(handleOnMouseMove, 0), [handleOnMouseMove]);


        return (
            <div className={"border rounded-xl p-6"}>
                <div className={"flex space-x-8 "}>
                    <div className="flex space-x-2 mb-8 tradeKindButton">
                        <Button
                            // variant={currentSelectedTradeKind === 'long' ? 'default' : 'outline'}
                            variant={currentSelectedTradeKind === 'long' ? 'default' : 'outline'}
                            onClick={() => setCurrentSelectedTradeKind('long')}
                            className={currentSelectedTradeKind === 'long' ? "bg-green-700 opacity-30" : 'outline outline-green-700/30'}
                        >
                            <ArrowUpCircle className="mr-2 h-4 w-4 green-700/30"
                                           color={currentSelectedTradeKind === 'long' ? "white" : '#BED2BE'}/>
                            <div
                                className={currentSelectedTradeKind === 'long' ? "white" : "text-green-700 opacity-30"}>Long
                            </div>
                        </Button>
                        <Button
                            // variant={currentSelectedTradeKind === 'short' ? 'default' : 'outline'}
                            variant={currentSelectedTradeKind === 'short' ? 'default' : 'outline'}
                            onClick={() => setCurrentSelectedTradeKind('short')}
                            className={currentSelectedTradeKind === 'short' ? "bg-red-700 opacity-30" : 'outline outline-red-700/30'}
                        >
                            <ArrowDownCircle className="mr-2 h-4 w-4 outline-red-700/30"
                                             color={currentSelectedTradeKind === 'short' ? "white" : '#E6BEBE'}/>
                            <div
                                className={currentSelectedTradeKind === 'short' ? "white" : "text-red-700 opacity-30"}>Short
                            </div>
                        </Button>
                    </div>

                    {/*<Label> Range </Label>*/}
                    <div className="flex space-x-2 mb-4 tradeKindButton">
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
                        {/*    onClick={async () => handleDButton(X_AXIS_RESOLUTION.SIX_MONTH)}*/}
                        {/*    {...xAxisResolution == X_AXIS_RESOLUTION.SIX_MONTH ? {} : {variant: "outline"}}*/}
                        {/*>*/}
                        {/*    6M*/}
                        {/*</Button>*/}
                    </div>
                </div>

                <p className={"assetName"}> {asset} </p>
                <Suspense>
                    <ChartContainer config={{
                        value: {
                            label: "Value",
                            color: "hsl(var(--chart-1))",
                        },
                    }}
                                    className="h-[400px]"
                                    onMouseDown={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleMouseDown(e)}
                                    // onMouseMove={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleMouseMove(e)}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    onContextMenu={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => handleContextMenu(e)}
                    >


                        <ResponsiveContainer
                            width="100%"
                            height={500}
                        >
                            <ComposedChart
                                width={800}
                                height={250}
                                data={visibleData}
                                margin={{top: 20, right: 30, left: 20, bottom: 20}}
                                onMouseDown={(nextState: CategoricalChartState, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                    if (event.button === 0) {
                                        if (nextState.activeLabel && !isInExistingInReferenceArea(definedRefArea, nextState.activeLabel)) {
                                            setRefAreaLeft(nextState.activeLabel)
                                        }
                                        ;
                                    }
                                }}
                                onMouseMove={debouncedHandleOnMouseMove}
                                // eslint-disable-next-line react/jsx-no-bind
                                onMouseUp={defineReferenceArea.bind(this)}
                                onMouseLeave={() => {
                                    resetRefAreaSelection();
                                }}
                            >
                                <XAxis dataKey="ts" tickCount={visibleData.length} tick={CustomizedTick}
                                       padding={{'left': 5}}/>
                                <YAxis yAxisId="1" dataKey="lowHigh" domain={['auto', 'auto']} allowDecimals={true}/>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <Line type="monotone" dataKey="movingAverage" yAxisId="1" stroke="#ff7300" dot={false}/>
                                <Bar
                                    yAxisId="1"
                                    dataKey="openClose"
                                    fill="#8884d8"
                                    shape={<Candlestick/>}
                                    isAnimationActive={false}
                                >
                                </Bar>

                                <Tooltip
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-expect-error take care later
                                    content={customTooltipContent}
                                    position={{x: 100, y: -25}} offset={20}/>
                                {definedRefArea.map((area, index) => (
                                    <ReferenceArea key={index} yAxisId="1" x1={area.referencedAreaLeft}
                                                   x2={area.referencedAreaRight} strokeOpacity={0.3}
                                                   fill={area.tradeKind === 'long' ? '#34eb6e' : '#eb3434'}
                                                   opacity={0.3}/>
                                ))}
                                {(refAreaLeft && refAreaRight) || (definedRefArea.length > 0) ? (
                                    // <AllReferencedAreas referencedAreas={definedRefArea}/>
                                    <ReferenceArea yAxisId="1" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3}
                                                   fill={currentSelectedTradeKind === 'long' ? '#34eb6e' : '#eb3434'}
                                                   opacity={0.3}/>
                                ) : null}

                            </ComposedChart>

                        </ResponsiveContainer>

                    </ChartContainer>
                    <ChartContainer config={{
                        value: {
                            label: "Value",
                            color: "hsl(var(--chart-1))",
                        },
                    }}

                                    className="h-[200px] mb-10 pb-6">
                            <LineChart data={visibleData} margin={{top: 20, right: 30, left: 20, bottom: 20}}>
                                <XAxis dataKey="ts" tickCount={visibleData.length} tick={CustomizedTick}
                                       padding={{'left': 5}}/>
                                <YAxis yAxisId="1" dataKey="rsi" domain={['auto', 'auto']} allowDecimals={true}/>
                                <ReferenceLine y={80} yAxisId="1" label={80} stroke="purple"/>
                                <ReferenceLine y={20} yAxisId="1" label={20} stroke="purple"/>
                                <ReferenceLine y={30} yAxisId="1" label={30} strokeDasharray={"3 3"} stroke="purple"/>
                                <ReferenceLine y={70} yAxisId="1" label={70} strokeDasharray={"3 3"} stroke="purple"/>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <Line type="monotone" dataKey="rsi" yAxisId="1" stroke="#5078BE" dot={false}/>
                            </LineChart>
                    </ChartContainer>
                </Suspense>

            </div>

        );
    });

export default CandleStickChart;