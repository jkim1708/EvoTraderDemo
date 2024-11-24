import {Button} from "@/components/ui/button"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {ForwardIcon, X} from "lucide-react"
import CandleStickChartDialog, {Trade} from "@/components/ui/candleStickChartDialog";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TradingRule} from "@/store/TradingRuleStore";
import {addMinutesToDate, convertToCustomDate} from "@/utils";

function generateRandomDateFromLast5Years() {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 5);
    return new Date(start.getTime() + Math.random() * (new Date().getTime() - start.getTime()));
}

function generateRandomTrades(): Trade[] {
    const randomTrades: Trade[] = [] as Trade[];
    for(let i=0; i < 10; i++){
        const date = generateRandomDateFromLast5Years();
        const nextDay = convertToCustomDate(addMinutesToDate(date,60*24)); //one day
        const ts = convertToCustomDate(date);
        randomTrades.push({
            kind: 'short',
            ts,
            tsEnd: nextDay,
            entryPrice: 1,
        })

    }
    return randomTrades;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
function addTradesToRecentTrades(recentTrades: any, randomTrades: Trade[]) {
    randomTrades.slice(0,1);
    randomTrades.forEach((trade: Trade) => {
        recentTrades.push({
            kind: trade.kind,
            startTime: trade.ts,
            endTime: trade.ts,
            profitNLoss: (Math.random() * (0.009 - 0.001) + 0.001).toFixed(8),
        })
    })

}

// @ts-expect-error
export default function StrategyDialog({strategy, onClose}) {

    const recentTrades = strategy.tradingRules;

    const randomTrades = generateRandomTrades();

    addTradesToRecentTrades(recentTrades,randomTrades);


    console.log('recentTrades' + recentTrades);

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
                    randomTrades = {recentTrades}
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
}