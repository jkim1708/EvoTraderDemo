import {Button} from "@/components/ui/button"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {X} from "lucide-react"
import CandleStickChartDialog from "@/components/ui/candleStickChartDialog";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TradingRule} from "@/store/TradingRuleStore";
import React from "react";
import {TradingStrategy} from "@/store/RootStore";
import {Switch} from "@/components/ui/switch";
import {observer} from "mobx-react-lite";


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
function addTradesToRecentTrades(recentTrades: TradingRule[], randomTrades: TradingRule[]) {
    randomTrades.slice(0, 1);
    randomTrades.forEach((trade: TradingRule) => {
        recentTrades.push({
            kind: trade.kind,
            startTime: trade.startTime,
            endTime: trade.endTime,
            asset: trade.asset,
            profitNLoss: trade.profitNLoss,
        } as TradingRule)
    })
}

export type StrategyDialogProps = {
    strategy: TradingStrategy,
    onClose: () => void,
}

const StrategyDialog = observer((props: StrategyDialogProps) => {

    const {strategy, onClose} = props;

    const recentTrades: TradingRule[] = [];

    const backtestingOffSampleTrades: TradingRule[] = strategy.backtestingOffSample.trades;

        addTradesToRecentTrades(recentTrades, backtestingOffSampleTrades);


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
});

export default StrategyDialog;