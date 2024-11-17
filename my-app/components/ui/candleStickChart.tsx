"use client"

import React, {useState} from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid, Tooltip, ReferenceArea,
} from 'recharts';
import {
    convertToDate,
    isInExistingInReferenceArea,
} from "@/utils";
import {observer} from "mobx-react-lite";
import {useStores} from "@/store/Provider";

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

type CandleStickChart = {
    high: string,
    low: string,
    open: string,
    close: string,
    ts: string,
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

const CandleStickChart =
    observer((props: CandleStickChartProps) => {

        const {
            tradingRuleStore: {
                tradingRules,
                setTradingRule,
                currentSelectedAsset,
                definedRefArea,
                currentSelectedTradeKind
            },
        } = useStores();

        const asset = props.asset;
        const data = props.data;
        // const handleChartClick = props.handleChartClick;

        const [refAreaLeft, setRefAreaLeft] = useState('');
        const [refAreaRight, setRefAreaRight] = useState('');

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

        function resetRefAreaSelection() {
            setRefAreaLeft('');
            setRefAreaRight('');
        }

        function isRefAreaSelectionDefined() {
            return refAreaLeft && refAreaRight;
        }

        function saveReferenceAreaSelection() {
            definedRefArea.push({referencedAreaLeft: refAreaLeft, referencedAreaRight: refAreaRight, tradeKind: currentSelectedTradeKind});
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

                console.log("profitNLoss", profitNLoss);
                createTrade(profitNLoss ?? 0);
            }
            resetRefAreaSelection();

        }

        return (
            <div>
                <p> {asset} </p>
                <BarChart
                    width={1000}
                    height={500}
                    data={data}
                    margin={{top: 20, right: 30, left: 20, bottom: 20}}
                    // onClick={handleChartClick}
                    onMouseDown={(e) => {
                        if (e.activeLabel && !isInExistingInReferenceArea(definedRefArea, e.activeLabel)) {
                            console.log("e.activeLabel left", e.activeLabel);
                            setRefAreaLeft(e.activeLabel)
                        }
                        ;
                    }}
                    onMouseMove={(e) => {
                        if (e.activeLabel && refAreaLeft && !isInExistingInReferenceArea(definedRefArea, e.activeLabel)) setRefAreaRight(e.activeLabel)
                    }}
                    // eslint-disable-next-line react/jsx-no-bind
                    onMouseUp={defineReferenceArea.bind(this)}
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
                    {definedRefArea.map((area, index) => (
                        <ReferenceArea key={index} yAxisId="1" x1={area.referencedAreaLeft}
                                       x2={area.referencedAreaRight} strokeOpacity={0.3} fill={area.tradeKind ==='long' ?'#34eb6e': '#eb3434'} opacity={0.3}/>
                    ))}
                    {(refAreaLeft && refAreaRight) || (definedRefArea.length > 0) ? (
                        // <AllReferencedAreas referencedAreas={definedRefArea}/>
                        <ReferenceArea yAxisId="1" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill={currentSelectedTradeKind==='long' ?'#34eb6e': '#eb3434'} opacity={0.3}/>
                    ) : null}
                </BarChart>
            </div>
        );
    });

export default CandleStickChart;