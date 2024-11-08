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
    isInExistingInReferenceArea,
    SampleAssetData,
    transformToCandleStickSeries
} from "@/utils";
import {observer} from "mobx-react-lite";
import {useStores} from "@/store/Provider";

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
    return data.map(({open, close, ...other}) => {
        return {
            ...other,
            open: parseFloat(open),
            close: parseFloat(close),
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

export type ReferencedArea = {
    referencedAreaLeft: string,
    referencedAreaRight: string,
}

const CandleStickChart =
    observer((props: CandleStickChartProps) => {

        const {
            tradingRuleStore: { tradingRules, setTradingRule, currentSelectedAsset, definedRefArea, currentSelectedTradeKind },
        } = useStores();

        const generateData = props.generatedData;
        const asset = props.asset;
        // const handleChartClick = props.handleChartClick;

        const [refAreaLeft, setRefAreaLeft] = useState('');
        const [refAreaRight, setRefAreaRight] = useState('');

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

        const CustomTooltipCursor = ({x, y, height}: { x: string, y: string, height: string }) => (
            <path
                d={`M${x},${y} L${x},${y + height}`}
                stroke="rgba(0, 0, 0, 0.2)"
                strokeWidth="1"
            />
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const customTooltipContent = ({ payload }) => {

            return (

                <p> o {payload[0] ? payload[0].value[0] : ""} c {payload[0] ? payload[0].value[1] : ""} </p>
            )
        }

        function resetRefAreaSelection(){
            setRefAreaLeft('');
            setRefAreaRight('');
        }

        function isRefAreaSelectionDefined(){
            return refAreaLeft && refAreaRight;
        }

        function saveReferenceAreaSelection(){
            definedRefArea.push({referencedAreaLeft: refAreaLeft, referencedAreaRight: refAreaRight});
        }

        function createTrade(profitNLoss: number) {
            const newTradingRules = tradingRules
            newTradingRules.push({kind: currentSelectedTradeKind, startTime: refAreaLeft, endTime: refAreaRight, asset: currentSelectedAsset, profitNLoss: profitNLoss});
            setTradingRule(newTradingRules);
        }

        function calculateProfitNLoss(refAreaLeft: string, refAreaRight: string, kind: "short" | "long") {

            const refAreaLeftOpenValue = data.find((tickData) => tickData.ts === refAreaLeft)?.open;
            const refAreaRightCloseValue = data.find((tickData) => tickData.ts === refAreaRight)?.close;

            if(refAreaLeftOpenValue === undefined || refAreaRightCloseValue === undefined) {
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

        const defineReferenceArea = () => {

            if(isRefAreaSelectionDefined()) {
                saveReferenceAreaSelection();
                const profitNLoss = calculateProfitNLoss(refAreaLeft, refAreaRight, 'long');
                createTrade(profitNLoss ?? 0);
            };
            resetRefAreaSelection();

        }

        return (
            <div>
                <p> {asset} </p>
                {/*// eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
                {/*// @ts-expect-error take care later*/}
                <CustomTooltipCursor/>

                <BarChart
                    width={1000}
                    height={500}
                    data={data}
                    margin={{top: 20, right: 30, left: 20, bottom: 5}}
                    // onClick={handleChartClick}
                    onMouseDown={(e) => {
                        if(e.activeLabel && isInExistingInReferenceArea(definedRefArea, '', e.activeLabel))  setRefAreaLeft(e.activeLabel);
                    }}
                    onMouseMove={(e) => {
                        if(e.activeLabel && refAreaLeft && isInExistingInReferenceArea(definedRefArea, refAreaLeft, e.activeLabel))  setRefAreaRight(e.activeLabel)
                    }}
                    // eslint-disable-next-line react/jsx-no-bind
                    onMouseUp={defineReferenceArea.bind(this)}
                >
                    <XAxis dataKey="ts" tickCount={data.length}/>
                    <YAxis yAxisId="1" domain={['auto', 'auto']} allowDecimals={true} />
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
                    <Tooltip cursor={<CustomTooltipCursor/>} content={customTooltipContent} position={{x: 100, y: -25}}/>
                    {definedRefArea.map((area, index) => (
                        <ReferenceArea key={index} yAxisId="1" x1={area.referencedAreaLeft} x2={area.referencedAreaRight} strokeOpacity={0.3} />
                    ))}
                    {(refAreaLeft && refAreaRight) || (definedRefArea.length > 0) ? (
                        // <AllReferencedAreas referencedAreas={definedRefArea}/>
                        <ReferenceArea yAxisId="1" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} />
                    ) : null}
                </BarChart>
            </div>
        );
    });

export default CandleStickChart;