import {Button} from "@/components/ui/button"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs"
import {X} from "lucide-react"
import CandleStickChartDialog from "@/components/ui/candleStickChartDialog";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TradingRule} from "@/store/TradingRuleStore";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export default function StrategyDialog({strategy, onClose}) {

    const recentTrades = strategy.tradingRules;

    return (
        <Card className="w-11/12 mx-auto" >
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                    {strategy.name} Analysis ({strategy.status})
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
                    asset="EURUSD"/>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Trades</h3>
                <Tabs defaultValue="all">
                    <TabsList>
                        <TabsTrigger value="all">All Trades</TabsTrigger>
                        <TabsTrigger value="long">Long Trades</TabsTrigger>
                        <TabsTrigger value="short">Short Trades</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Entry Date</TableHead>
                                    <TableHead>Entry Price</TableHead>
                                    <TableHead>Exit Date</TableHead>
                                    <TableHead>Exit Price</TableHead>
                                    <TableHead>Profit</TableHead>
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
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    </CardContent>
        </Card>
)
}