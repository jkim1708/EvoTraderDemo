"use client"

// import dynamic from 'next/dynamic'
import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {ArrowUpCircle, ArrowDownCircle, Edit2, Trash2} from "lucide-react"
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {generateData, SampleAssetData} from "@/utils";
import CandleStickChart from "@/components/ui/candleStickChart";
import {observer} from "mobx-react-lite";
import {TradingRule} from "@/store/TradingRuleStore";
import {useStores} from "@/store/Provider";
import {v4 as uuidv4} from 'uuid';
import Link from "next/link";


// const calculatePnL = (trade: Trade, data: { date: string; value: number }[]) => {
//     const startValue = data.find(d => d.date === trade.startDate)?.value || 0
//     const endValue = data.find(d => d.date === trade.endDate)?.value || 0
//     const pnl = trade.type === 'long' ? endValue - startValue : startValue - endValue
//     return pnl.toFixed(4)
// }

const assets = ['EURUSD', 'GBPUSD', 'EURCHF', 'EURNOK']

const EnhancedTradingAssetViewer = observer(() => {
        const {
            tradingRuleStore: {
                tradingRules,
                setTradingRule,
                setDefinedRefArea,
                currentSelectedTradeKind,
                setCurrentSelectedTradeKind,
                setCurrentTradingStrategyName,
                currentTradingStrategyName
            },
            tradingStrategyStore: {setTradingStrategy, tradingStrategies},
        } = useStores();

        const today = new Date()
        const twoDaysAgo = new Date(today)
        twoDaysAgo.setDate(today.getDate() - 2)

        const [startDate, setStartDate] = useState(twoDaysAgo.toISOString().split('T')[0])
        const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
        const [frequency, setFrequency] = useState("hourly")
        const [asset, setAsset] = useState("EURUSD")
        const [data, setData] = useState([] as SampleAssetData)
        // const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null)
        // const [tradeType, setTradeType] = useState<'long' | 'short'>('long')
        const [editingTrade, setEditingTrade] = useState<TradingRule | null>(null)

        const resetSelectedTrades = () => {
            setTradingRule([]);
            setDefinedRefArea([]);
        }

        useEffect(() => {
            setData(generateData(new Date(startDate), new Date(endDate), asset));
        }, [startDate, endDate, asset]);

    useEffect(() => {
        resetSelectedTrades();
    }, [startDate, endDate, asset, frequency]);

        const removeTrade = (startTime: string) => {
            setTradingRule(tradingRules.filter(trade => trade.startTime !== startTime))
            setDefinedRefArea(tradingRules.filter(trade => trade.startTime !== startTime).map(trade => ({
                referencedAreaLeft: trade.startTime,
                referencedAreaRight: trade.endTime
            })));
        }

        const startEditTrade = (trade: TradingRule) => {
            setEditingTrade(trade)
        }

        const saveEditedTrade = (editedTrade: TradingRule) => {
            const updatedTrade = {
                ...editedTrade,
                // pnl: calculatePnL(editedTrade, data)
            }
            setTradingRule(tradingRules.map(trade => trade.startTime === updatedTrade.startTime ? updatedTrade : trade))
            setEditingTrade(null)
        }

        const cancelEditTrade = () => {
            setEditingTrade(null)
        }

        function createAndSaveTradingStrategy(param: { name: string; rules: TradingRule[] }) {
            const {name, rules} = param;

            const tradingStrategy = {
                id: uuidv4(),
                name,
                tradingRules: rules
            }

            setTradingStrategy([...tradingStrategies, tradingStrategy]);

        }

        function handleCreateStrategy() {

            createAndSaveTradingStrategy({
                name: currentTradingStrategyName,
                rules: tradingRules
            });
        }

        return (
            <Card className="w-full max-w-6xl">
                <CardHeader>
                    <CardTitle>Enhanced Trading Asset Viewer</CardTitle>
                    <CardDescription>Select asset, date range, and manage trades</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4 mb-6">
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <Label htmlFor="asset">Asset</Label>
                                <Select value={asset} onValueChange={setAsset}>
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
                                    }}
                                    max={new Date().toJSON().split('T')[0]}
                                />
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="frequency">Frequency</Label>
                                <Select value={frequency} onValueChange={setFrequency}>
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
                    </form>
                    <div className="flex space-x-4 mb-4">
                        <div className="flex-4">
                            <Label htmlFor="asset">Trading Rule Name</Label>
                            <Input id={"tading-rule-name"} defaultValue={"My Trading Rule"} onChange={e => {
                                setCurrentTradingStrategyName(e.target.value)
                            }}/>
                        </div>
                    </div>
                    <div className="flex space-x-4 mb-4">
                        <Button
                            variant={currentSelectedTradeKind === 'long' ? 'default' : 'outline'}
                            onClick={() => setCurrentSelectedTradeKind('long')}
                        >
                            <ArrowUpCircle className="mr-2 h-4 w-4"/> Long
                        </Button>
                        <Button
                            variant={currentSelectedTradeKind === 'short' ? 'default' : 'outline'}
                            onClick={() => setCurrentSelectedTradeKind('short')}
                        >
                            <ArrowDownCircle className="mr-2 h-4 w-4"/> Short
                        </Button>
                    </div>


                    <CandleStickChart generatedData={data} asset={asset}/>


                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Selected Trades</h3>
                        {tradingRules.length === 0 ? (
                            <p>No trades selected yet. Click on the chart to select trade ranges.</p>
                        ) : (
                            <ul className="space-y-2">
                                {tradingRules.map((trade) => (
                                    <li key={trade.startTime}
                                        className="flex items-center justify-between bg-muted p-2 rounded">
                  <span>
                    {trade.kind === 'long' ? <ArrowUpCircle className="inline mr-2 h-4 w-4 text-green-500"/> :
                        <ArrowDownCircle className="inline mr-2 h-4 w-4 text-red-500"/>}
                      {trade.startTime} to {trade.endTime}
                  </span>
                                        <span
                                            className={`font-semibold ${parseFloat(String(trade.profitNLoss)) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    P&L: {trade.profitNLoss}
                  </span>
                                        <div>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm"
                                                            onClick={() => startEditTrade(trade)}>
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
                                                                type="datetime-local"
                                                                value={editingTrade?.startTime || ''}
                                                                onChange={(e) => setEditingTrade(prev => prev ? {
                                                                    ...prev,
                                                                    startTime: e.target.value
                                                                } : null)}
                                                                className="col-span-3"
                                                                step="3600"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="end-date" className="text-right">
                                                                End Date
                                                            </Label>
                                                            <Input
                                                                id="end-date"
                                                                type="datetime-local"
                                                                value={editingTrade?.endTime || ''}
                                                                onChange={(e) => setEditingTrade(prev => prev ? {
                                                                    ...prev,
                                                                    endTime: e.target.value
                                                                } : null)}
                                                                className="col-span-3"
                                                                step="3600"
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose>
                                                        <Button variant="outline"
                                                                onClick={cancelEditTrade}>Cancel</Button>
                                                        </DialogClose>
                                                        <DialogClose>

                                                        <Button
                                                            onClick={() => editingTrade && saveEditedTrade(editingTrade)}>Save
                                                            Changes</Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                            <Button variant="ghost" size="sm"
                                                    onClick={() => removeTrade(trade.startTime)}>
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex space-x-4 mb-4 flex justify-end mt-6">

                        <Button variant="outline" size="sm">
                            {/*<Trash2 className="h-4 w-4"/>*/}
                            Cancel
                        </Button>
                        <Link href="/strategy-manager">
                            <Button variant="default" size="sm" onClick={handleCreateStrategy}>
                                {/*<Trash2 className="h-4 w-4"/>*/}
                                Create
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        )
    }
);
export default EnhancedTradingAssetViewer;