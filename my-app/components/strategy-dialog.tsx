import {Button} from "@/components/ui/button"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {X} from "lucide-react"
import CandleStickChartDialog from "@/components/ui/candleStickChartDialog";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TradingRule} from "@/store/TradingRuleStore";
import React, {useEffect, useState} from "react";
import {TradingStrategy} from "@/store/RootStore";
import {Switch} from "@/components/ui/switch";
import {observer} from "mobx-react-lite";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {convertToCustomDate, generateRandomDateRange} from "@/utils";
import {useStores} from "@/store/Provider";


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
function transformToRecentTrades(randomTrades: TradingRule[]) {
    const slicedTrades: TradingRule[] = [];
    randomTrades.slice(0, 1);
    randomTrades.forEach((trade: TradingRule) => {
        slicedTrades.push({
            kind: trade.kind,
            startTime: trade.startTime,
            endTime: trade.endTime,
            asset: trade.asset,
            profitNLoss: trade.profitNLoss,
            entryPrice: trade.entryPrice,
            exitPrice: trade.exitPrice
        } as TradingRule)
    })

    return slicedTrades;
}

export type StrategyDialogProps = {
    strategy: TradingStrategy,
    onClose: () => void,
}

function generateRandomTrades(startBacktestingOffSample: string, endBacktestingOffSample: string, asset: "EURUSD" | "USDJPY" | "GBPUSD" | "EURCHF" | "EURNOK"): TradingRule[] {
    const randomTrades: TradingRule[] = [] as TradingRule[];
    // const date = generateRandomDateFromLast5Years();
    const offSampleTestStartDate = new Date(startBacktestingOffSample);
    const offSampleTestEndDate = new Date(endBacktestingOffSample);
    const randomDateRange = generateRandomDateRange(offSampleTestStartDate, offSampleTestEndDate);

    randomDateRange.forEach(dateRange => {
        const pnl = ((Math.random() < 0.3) ? -1 : 1) * parseFloat((Math.random() * (0.009 - 0.001) + 0.001).toFixed(8));
        const entryPrice = parseFloat((Math.random() * (1.2 - 0.8) + 0.8).toFixed(4));
        const exitPrice = pnl - entryPrice;

        randomTrades.push({
            kind: Math.floor(Math.random() * 2.0) === 0 ? 'long' : 'short',
            startTime: convertToCustomDate(dateRange.startDate),
            endTime: convertToCustomDate(dateRange.endDate),
            asset: asset,
            profitNLoss: pnl,
            entryPrice: entryPrice,
            exitPrice: exitPrice,
        })
    })

    if (randomTrades.length === 0) {
        console.error("Could not generate random trades");
    }
    return randomTrades;
}


const StrategyDialog = observer((props: StrategyDialogProps) => {

    const

        {tradingStrategyStore: {tradingStrategies}}
            = useStores();

    const [startBacktestingOffSample, setStartBacktestingOffSample] = useState('');
    const [endBacktestingOffSample, setEndBacktestingOffSample] = useState('');
    const [showChart, setShowChart] = useState(false);


    const {onClose} = props;

    const strategy = tradingStrategies.find(strategy => strategy.name === props.strategy.name) as TradingStrategy;

    const recentTrades = strategy.backtestingOffSample.trades;

    useEffect(() => {
        if (startBacktestingOffSample && endBacktestingOffSample) {
            strategy.backtestingOffSample.trades = generateRandomTrades(startBacktestingOffSample, endBacktestingOffSample, strategy.tradingRules[0].asset)
            recentTrades.push(...transformToRecentTrades(strategy.backtestingOffSample.trades));

            strategy.backtestingOffSample.startDate = startBacktestingOffSample;
            strategy.backtestingOffSample.endDate = endBacktestingOffSample;

            setShowChart(true);
        };

    }, [startBacktestingOffSample, endBacktestingOffSample]);

    return (
        <Card className="w-11/12 mx-auto">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                        {strategy.name} - Trading Strategy Analyzer (TSA) {strategy.status == 'active' ?
                        <div className="text-2xl font-bold text-orange-500"> {strategy.status}</div> : <div
                            className="text-2xl font-bold text-grey-500"> {strategy.status}
                        </div>}

                    </CardTitle>
                    <div className="space-x-6">
                        <p>
                            Live Trading
                        </p>
                        <Switch checked={(strategy.status === "active")}
                                onClick={() => {
                                    strategy.status = (strategy.status === "inactive") ? "active" : "inactive"
                                }}
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4"/>
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    {strategy.tradingRules[0].asset} - {strategy.indicators.join(', ')}
                </p>

            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <div className="text-sm text-muted-foreground">Win Rate</div>
                            <div className="text-2xl font-bold text-orange-500">{strategy.winRate}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Profit Factor</div>
                            <div className="text-2xl font-bold text-orange-500">{strategy.profitFactor}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                            <div className="text-2xl font-bold text-orange-500">{strategy.sharpeRatio}</div>
                        </div>
                    </div>

                    <p> Backtesting Offsample Time Range </p>
                    <div className="flex space-x-4 mb-4">
                        <div>
                            <Label htmlFor="start-date-backtesting-off-sample" className="text-right">
                                Start Date
                            </Label>
                            <Input
                                id="start-date-backtesting-off-sample"
                                type="date"
                                value={
                                    startBacktestingOffSample
                                }
                                onChange={(e) => {
                                    setStartBacktestingOffSample(
                                        e.target.value
                                    )

                                }}
                                className="flex-1"
                                max={new Date().toJSON().split('T')[0]}
                            />
                        </div>
                        <div>
                            <Label htmlFor="end-date-backtesting-off-sample" className="text-right">
                                End Date
                            </Label>
                            <Input
                                id="end-date-backtesting-off-sample"
                                type="date"
                                value={
                                    endBacktestingOffSample
                                }
                                onChange={(e) => {
                                    setEndBacktestingOffSample(
                                        e.target.value
                                    )

                                }}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/*<div className="flex item-center space-x-2">*/}
                    {/*    <div className="align-baseline">*/}
                    {/*        <div className="blue-circle-icon"></div>*/}
                    {/*    </div>*/}
                    {/*    <p>Long Trades</p></div>*/}
                    {/*<div className="flex item-center space-x-2">*/}
                    {/*    <div className="align-baseline">*/}
                    {/*        <div className="red-square-icon"></div>*/}
                    {/*    </div>*/}
                    {/*    <p>Short Trades</p>*/}
                    {/*</div>*/}

                    {showChart && (
                        <div>

                            <div>
                                <CandleStickChartDialog
                                    generatedData={strategy.underline}
                                    randomTrades={recentTrades}
                                    strategy={strategy}
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Recent Trades</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Entry Date</TableHead>
                                            <TableHead>Entry Price</TableHead>
                                            <TableHead>Exit Date</TableHead>
                                            <TableHead>Exit Price</TableHead>
                                            <TableHead>ProfitNLoss</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentTrades.map((trade: TradingRule, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell
                                                    className={trade.kind == "short" ? "text-red-500" : "text-green-500"}>{trade.kind}</TableCell>
                                                <TableCell>{trade.startTime}</TableCell>
                                                <TableCell>{trade.entryPrice ?? ""}</TableCell>
                                                <TableCell>{trade.endTime}</TableCell>
                                                <TableCell>{trade.exitPrice ?? ""}</TableCell>
                                                <TableCell
                                                    className={trade.profitNLoss < 0 ? "text-red-500" : "text-green-500"}>{trade.profitNLoss}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
});

export default StrategyDialog;