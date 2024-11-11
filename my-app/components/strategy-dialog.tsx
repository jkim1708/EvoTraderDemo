import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { X } from "lucide-react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export default function StrategyDialog({ strategy, onClose }) {
    const chartData = [
        { date: '2023-01', return: 1.8 },
        { date: '2023-02', return: -0.9 },
        { date: '2023-03', return: 2.4 },
        { date: '2023-04', return: 1.6 },
        { date: '2023-05', return: -1.1 },
        { date: '2023-06', return: 2.0 },
    ]

    const recentTrades = [
        {
            type: 'SHORT',
            entryDate: '2023-01-03',
            entryPrice: '1.2050',
            exitDate: '2023-01-08',
            exitPrice: '1.2000',
            profit: '0.0050'
        }
    ]

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl">
                            {strategy.name} Analysis
                        </DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {strategy.asset} - {strategy.indicators.join(', ')}
                    </p>
                </DialogHeader>
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

                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Line type="monotone" dataKey="return" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Performance Analysis</h3>
                        <p className="text-muted-foreground">
                            This algorithm has shown moderate performance with a win rate of {strategy.winRate}.
                            The profit factor of {strategy.profitFactor} indicates good profitability.
                            With a Sharpe ratio of {strategy.sharpeRatio}, the algorithm demonstrates reasonable risk-adjusted returns.
                        </p>
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
                                        {recentTrades.map((trade, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{trade.type}</TableCell>
                                                <TableCell>{trade.entryDate}</TableCell>
                                                <TableCell>{trade.entryPrice}</TableCell>
                                                <TableCell>{trade.exitDate}</TableCell>
                                                <TableCell>{trade.exitPrice}</TableCell>
                                                <TableCell className="text-green-500">{trade.profit}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}