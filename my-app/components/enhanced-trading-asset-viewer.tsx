"use client"

// import dynamic from 'next/dynamic'
import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {ArrowUpCircle, ArrowDownCircle, Edit2, Trash2} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {generateData} from "@/utils";
import CandleStickChart from "@/components/ui/candleStickChart";
import {observer} from "mobx-react-lite";

// const calculatePnL = (trade: Trade, data: { date: string; value: number }[]) => {
//     const startValue = data.find(d => d.date === trade.startDate)?.value || 0
//     const endValue = data.find(d => d.date === trade.endDate)?.value || 0
//     const pnl = trade.type === 'long' ? endValue - startValue : startValue - endValue
//     return pnl.toFixed(4)
// }

type Trade = {
    id: number;
    type: 'long' | 'short';
    startDate: string;
    endDate: string;
    pnl: string;
}

const assets = ['EURUSD', 'GBPUSD', 'EURCHF', 'EURNOK']


const EnhancedTradingAssetViewer = observer(() => {
    const today = new Date()
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(today.getDate() - 2)

    const [startDate, setStartDate] = useState(twoDaysAgo.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [frequency, setFrequency] = useState("hourly")
    const [asset, setAsset] = useState("EURUSD")
    const [data, setData] = useState(generateData(twoDaysAgo, today, "EURUSD"))
    // const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null)
    const [trades, setTrades] = useState<Trade[]>([])
    const [tradeType, setTradeType] = useState<'long' | 'short'>('long')
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setData(generateData(new Date(startDate), new Date(endDate), asset))
        // setSelectedRange(null)
        setTrades([])
    }


    // const handleChartClick = (props: CategoricalChartState) => {
    //     if (props && props.activeLabel) {
    //         const clickedIndex = data.findIndex(item => item.date === props.activeLabel)
    //         if (selectedRange) {
    //             const startIndex = Math.min(selectedRange[0], clickedIndex)
    //             const endIndex = Math.max(selectedRange[0], clickedIndex)
    //             const newTrade: Trade = {
    //                 id: Date.now(),
    //                 type: tradeType,
    //                 startDate: data[startIndex].date,
    //                 endDate: data[endIndex].date,
    //                 pnl: calculatePnL({
    //                     id: Date.now(),
    //                     type: tradeType,
    //                     startDate: data[startIndex].date,
    //                     endDate: data[endIndex].date,
    //                     pnl: ''
    //                 }, data)
    //             }
    //             setTrades([...trades, newTrade])
    //             setSelectedRange(null)
    //         } else {
    //             setSelectedRange([clickedIndex, clickedIndex])
    //         }
    //     }
    // }

    const removeTrade = (id: number) => {
        setTrades(trades.filter(trade => trade.id !== id))
    }

    const startEditTrade = (trade: Trade) => {
        setEditingTrade(trade)
    }

    const saveEditedTrade = (editedTrade: Trade) => {
        const updatedTrade = {
            ...editedTrade,
            // pnl: calculatePnL(editedTrade, data)
        }
        setTrades(trades.map(trade => trade.id === updatedTrade.id ? updatedTrade : trade))
        setEditingTrade(null)
    }

    const cancelEditTrade = () => {
        setEditingTrade(null)
    }

    // const DynamicCandleStickChart = dynamic(() => import('../components/ui/candleStickChart'), {
    //     ssr: false,
    // })

    return (
        <Card className="w-full max-w-6xl">
            <CardHeader>
                <CardTitle>Enhanced Trading Asset Viewer</CardTitle>
                <CardDescription>Select asset, date range, and manage trades</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <Label htmlFor="asset">Asset</Label>
                            <Select value={asset} onValueChange={(asset) => {
                                setAsset(asset);

                                setData(generateData(new Date(startDate), new Date(endDate), asset))
                            }}>
                                <SelectTrigger id="asset">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {assets.map((a) => (
                                        <SelectItem key={a} value={a}>{a}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value)
                                    setData(generateData(new Date(e.target.value), new Date(endDate), asset))
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value)
                                    setData(generateData(new Date(startDate), new Date(e.target.value), asset))
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="frequency">Frequency</Label>
                            <Select value={frequency} onValueChange={ frequency => {
                                setFrequency(frequency);

                                setData(generateData(new Date(startDate), new Date(endDate), asset))
                            }}>
                                <SelectTrigger id="frequency">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hourly">Hourly</SelectItem>
                                    <SelectItem value="4 hourly">4 Hourly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button type="submit">Update Chart</Button>
                </form>

                <div className="flex space-x-4 mb-4">
                    <Button
                        variant={tradeType === 'long' ? 'default' : 'outline'}
                        onClick={() => setTradeType('long')}
                    >
                        <ArrowUpCircle className="mr-2 h-4 w-4"/> Long
                    </Button>
                    <Button
                        variant={tradeType === 'short' ? 'default' : 'outline'}
                        onClick={() => setTradeType('short')}
                    >
                        <ArrowDownCircle className="mr-2 h-4 w-4"/> Short
                    </Button>
                </div>
                <CandleStickChart generatedData={data}/>

                <div hidden={true}>{data.toString()}</div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Selected Trades</h3>
                    {trades.length === 0 ? (
                        <p>No trades selected yet. Click on the chart to select trade ranges.</p>
                    ) : (
                        <ul className="space-y-2">
                            {trades.map((trade) => (
                                <li key={trade.id} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span>
                    {trade.type === 'long' ? <ArrowUpCircle className="inline mr-2 h-4 w-4 text-green-500"/> :
                        <ArrowDownCircle className="inline mr-2 h-4 w-4 text-red-500"/>}
                      {trade.startDate} to {trade.endDate}
                  </span>
                                    <span
                                        className={`font-semibold ${parseFloat(trade.pnl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    P&L: {trade.pnl}
                  </span>
                                    <div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" onClick={() => startEditTrade(trade)}>
                                                    <Edit2 className="h-4 w-4"/>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit Trade</DialogTitle>
                                                    <DialogDescription>Modify the start and end dates of your
                                                        trade.</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="start-date" className="text-right">
                                                            Start Date
                                                        </Label>
                                                        <Input
                                                            id="start-date"
                                                            type="date"
                                                            value={editingTrade?.startDate || ''}
                                                            onChange={(e) => setEditingTrade(prev => prev ? {
                                                                ...prev,
                                                                startDate: e.target.value
                                                            } : null)}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="end-date" className="text-right">
                                                            End Date
                                                        </Label>
                                                        <Input
                                                            id="end-date"
                                                            type="date"
                                                            value={editingTrade?.endDate || ''}
                                                            onChange={(e) => setEditingTrade(prev => prev ? {
                                                                ...prev,
                                                                endDate: e.target.value
                                                            } : null)}
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={cancelEditTrade}>Cancel</Button>
                                                    <Button
                                                        onClick={() => editingTrade && saveEditedTrade(editingTrade)}>Save
                                                        Changes</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant="ghost" size="sm" onClick={() => removeTrade(trade.id)}>
                                            <Trash2 className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
);
export default EnhancedTradingAssetViewer;