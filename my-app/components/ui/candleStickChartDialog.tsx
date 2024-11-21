"use client"

import React, {useCallback, useState} from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    convertToCustomDate,
    convertToDate,
    SampleAssetData,
} from "@/utils";
import {observer} from "mobx-react-lite";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {ChartContainer} from "@/components/ui/chart";

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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
function transformToFourDayData(candleStickSeries) {

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

        // If we haven't started a group or this timestamp is within the same 4-day interval, add it
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

            // Create an aggregated candle for this 4-day interval
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

const CandleStickChartDialog =
    observer((props: CandleStickChartProps) => {

        const [xAxisResolution, setXAxisResolution] = useState(180); // Bereich der X-Achse
        const [isDragging, setIsDragging] = useState(false); // Bereich der X-Achse
        const [lastMouseX, setLastMouseX] = useState(0); // Bereich der X-Achse
        const [startIndex, setStartIndex] = useState(0); // Bereich der X-Achse

        const candleStickSeries = props.generatedData;
        const asset = props.asset;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        const data = transformToFourDayData(candleStickSeries);


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


        function handleDButton(numberOfLastDaysToShow: number): void {
            setStartIndex(data.length - numberOfLastDaysToShow * 24);
            setXAxisResolution(numberOfLastDaysToShow * 24);
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
            }
        }, [isDragging, lastMouseX, xAxisResolution, data.length]);

        const handleMouseUp = useCallback(() => {
            setIsDragging(false);
        }, []);

        const visibleData = data.slice(startIndex, startIndex + xAxisResolution)

        const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.preventDefault();
        }, []);

        return (
            <div>
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
                            <XAxis dataKey="ts" tickCount={data.length} tick={CustomizedTick} padding={{'left': 5}}/>
                            <YAxis yAxisId="1" dataKey="lowHigh" domain={['auto', 'auto']} allowDecimals={true}/>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <Bar
                                yAxisId="1"
                                dataKey="openClose"
                                fill="#8884d8"
                                shape={<Candlestick/>}
                                isAnimationActive={false}
                            >
                            </Bar>

                            {/*// eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
                            {/*// @ts-expect-error take care later*/}
                            <Tooltip cursor={<CustomTooltipCursor/>} content={customTooltipContent}
                                     position={{x: 100, y: -25}} offset={20}/>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <Label> Range </Label>
                <div className="flex space-x-4 mb-4 tradeKindButton">
                    < Button
                        onClick={() => handleDButton(1)}
                    >
                        1D
                    </Button>
                    < Button
                        onClick={() => handleDButton(5)}
                    >
                        5D
                    </Button>
                    < Button
                        onClick={() => handleDButton(30)}
                    >
                        1M
                    </Button>
                    < Button
                        onClick={() => handleDButton(90)}
                    >
                        3M
                    </Button>
                    < Button
                        onClick={() => handleDButton(180)}
                    >
                        6M
                    </Button>
                </div>
            </div>
        );
    });

export default CandleStickChartDialog;