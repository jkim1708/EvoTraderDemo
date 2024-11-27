import {Button} from "@/components/ui/button"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {X} from "lucide-react"
import CandleStickChartDialog, {Trade} from "@/components/ui/candleStickChartDialog";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TradingRule} from "@/store/TradingRuleStore";
import {addMinutesToDate, convertToCustomDate} from "@/utils";
import React from "react";
import {TradingStrategy} from "@/store/RootStore";

//generate 10 random trades which have 1 day duration
function generateRandomDateRange(offSampleTestStartDate: Date, offSampleTestEndDate: Date): {
    startDate: Date,
    endDate: Date
}[] {
    const randomDateRange: { startDate: Date, endDate: Date }[] = [] as { startDate: Date, endDate: Date }[];
    for (let i = 0; i < 10; i++) {
        const startDate = new Date(offSampleTestStartDate.getTime() + Math.random() * (offSampleTestEndDate.getTime() - offSampleTestStartDate.getTime()));
        const endDate = new Date(addMinutesToDate(startDate, 60 * 24));

        randomDateRange.push({startDate, endDate});
    }
    return randomDateRange;
}

function generateRandomTrades(strategy: TradingStrategy): Trade[] {
    const randomTrades: Trade[] = [] as Trade[];
    // const date = generateRandomDateFromLast5Years();
    const offSampleTestStartDate = new Date(strategy.backtestingOffSample.startDate);
    const offSampleTestEndDate = new Date(strategy.backtestingOffSample.endDate);
    const randomDateRange = generateRandomDateRange(offSampleTestStartDate, offSampleTestEndDate);
    randomDateRange.forEach(dateRange => randomTrades.push({
            kind: 'short',
            ts: convertToCustomDate(dateRange.startDate),
            tsEnd: convertToCustomDate(dateRange.endDate),
            entryPrice: 1,
        })
    )
    return randomTrades;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
function addTradesToRecentTrades(recentTrades: TradingRule[], randomTrades: Trade[]) {
    randomTrades.slice(0, 1);
    randomTrades.forEach((trade: Trade) => {
        recentTrades.push({
            kind: trade.kind,
            startTime: trade.ts,
            endTime: trade.tsEnd,
            asset: 'EURUSD',
            profitNLoss: parseFloat((Math.random() * (0.009 - 0.001) + 0.001).toFixed(8)),
        } as TradingRule)
    })

}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export default function StrategyDialog({strategy, onClose}) {

    const recentTrades = [...strategy.tradingRules];

    let backtestingOffSampleTrades: Trade[] = strategy.backtestingOffSample.trades ?? [];

    if (backtestingOffSampleTrades.length == 0) {
        backtestingOffSampleTrades = generateRandomTrades(strategy);
        addTradesToRecentTrades(recentTrades, backtestingOffSampleTrades);
    }


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
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4"/>
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    {strategy.asset} - {strategy.indicators.join(', ')}
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

                    <div>
                        <CandleStickChartDialog
                            generatedData={strategy.underline}
                            randomTrades={recentTrades}
                            strategy={strategy}
                            asset="EURUSD"/>
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
                                    <TableHead>Profit</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTrades.map((trade: TradingRule, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{trade.kind}</TableCell>
                                        <TableCell>{trade.startTime}</TableCell>
                                        <TableCell>{""}</TableCell>
                                        <TableCell>{trade.endTime}</TableCell>
                                        <TableCell>{""}</TableCell>
                                        <TableCell className="text-green-500">{trade.profitNLoss}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
};