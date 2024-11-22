"use client"

// import dynamic from 'next/dynamic'
import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {ArrowDownCircle, ArrowUpCircle, Edit2, Trash2} from "lucide-react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {
    CANDLESTICK_FREQUENCY, convertToCustomDate,
    convertToDate,
    generateData,
    SampleAssetData,
    transformToCandleStickSeries
} from "@/utils";
import CandleStickChart from "@/components/ui/candleStickChart";
import {observer} from "mobx-react-lite";
import {TradingRule} from "@/store/TradingRuleStore";
import {useStores} from "@/store/Provider";
import {v4 as uuidv4} from 'uuid';
import Link from "next/link";
import {TradingStrategy} from "@/store/RootStore";
import {useRouter, useSearchParams} from "next/navigation";


// const calculatePnL = (trade: Trade, data: { date: string; value: number }[]) => {
//     const startValue = data.find(d => d.date === trade.startDate)?.value || 0
//     const endValue = data.find(d => d.date === trade.endDate)?.value || 0
//     const pnl = trade.type === 'long' ? endValue - startValue : startValue - endValue
//     return pnl.toFixed(4)
// }

const assets= ['EURUSD', 'GBPUSD', 'EURCHF', 'EURNOK']

const EnhancedTradingAssetViewer = observer(() => {
        const {
            tradingRuleStore: {
                tradingRules,
                setTradingRule,
                setDefinedRefArea,
                currentSelectedTradeKind,
                setCurrentSelectedTradeKind,
                setCurrentTradingStrategyName,
                currentTradingStrategyName,
            },
            tradingStrategyStore: {setTradingStrategy, tradingStrategies, createBacktestingTrades, tradeOnSample, tradeOffSample},
        } = useStores();

        const today = new Date()
        const twoDaysAgo = new Date('2019-01-01')

        const searchParams = useSearchParams();
        const pathStrategyName = searchParams.get('strategyName')

        let initialStartDate;
        let initialEndDate;
        let initialAsset;

        if (pathStrategyName) {
            setCurrentTradingStrategyName(pathStrategyName as string);
            tradingStrategies.filter(strategy => strategy.name === pathStrategyName).forEach(strategy => {
                initialStartDate = strategy.selectedStartDate;
                initialEndDate = strategy.selectedEndDate;
                setTradingRule(strategy.tradingRules);
                setDefinedRefArea(strategy.tradingRules.map(trade => ({
                    referencedAreaLeft: trade.startTime,
                    referencedAreaRight: trade.endTime,
                    tradeKind: trade.kind
                })));
                initialAsset = strategy.tradingRules[0].asset;
            });

        }

        const [startDate, setStartDate] = useState(initialStartDate ?? twoDaysAgo.toISOString().split('T')[0])
        const [endDate, setEndDate] = useState(initialEndDate ?? today.toISOString().split('T')[0])
        const [frequency, setFrequency] = useState(CANDLESTICK_FREQUENCY.HOURLY)
        const [asset, setAsset] = useState(initialAsset ?? "EURUSD")
        const [data, setData] = useState([] as CandleStickChart[])
        const [fourHourData, setFourHourData] = useState([] as CandleStickChart[])

        enum VIEW_MODE {
            CREATE,
            EDIT
        };
        const [viewMode, setViewMode] = useState(VIEW_MODE.CREATE)
        // const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null)
        // const [tradeType, setTradeType] = useState<'long' | 'short'>('long')
        const [editingTrade, setEditingTrade] = useState<TradingRule | null>(null)
        const [isStrategyNameValid, setIsStrategyNameValid] = useState(true);

        const resetSelectedTrades = () => {
            setTradingRule([]);
            setDefinedRefArea([]);
        }


        const appRouterInstance = useRouter();


        useEffect(() => {
            if (pathStrategyName) {
                setViewMode(VIEW_MODE.EDIT);
            }
        }, []);

        useEffect(() => {
            if (pathStrategyName) {
                setCurrentTradingStrategyName(pathStrategyName as string);
                tradingStrategies.filter(strategy => strategy.name === pathStrategyName).forEach(strategy => {
                    setStartDate(strategy.selectedStartDate);
                    setEndDate(strategy.selectedEndDate);
                    setTradingRule(strategy.tradingRules);
                    setDefinedRefArea(strategy.tradingRules.map(trade => ({
                        referencedAreaLeft: trade.startTime,
                        referencedAreaRight: trade.endTime,
                        tradeKind: trade.kind
                    })));
                    setAsset(strategy.tradingRules[0].asset);
                });

            }
        }, [pathStrategyName]);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    function transformToFourHourData(candleStickSeries){

            // Initialize result array
            const aggregatedData:  {
                high: string,
                low: string,
                open: string,
                close: string,
                ts: string, // Start of the 4-hour period
                lowHigh: [number, number],
                openClose: [string, string]
            }[] = [];

            // Start the aggregation process
            let currentGroup: {
                high: string,
                low: string,
                open: string,
                close: string,
                ts: string, // Start of the 4-hour period
                lowHigh: [number, number],
                openClose: [number, number]
            }[] = [];
            let currentStartTime: Date | null = null;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
        candleStickSeries.forEach((candle) => {
                const candleTime = convertToDate(candle.ts);

                // If we haven't started a group or this timestamp is within the same 4-hour interval, add it
                if (!currentStartTime || candleTime < new Date(currentStartTime.getTime() + 4 * 60 * 60 * 1000)) {
                    currentGroup.push(candle);
                    if (!currentStartTime) {
                        currentStartTime = candleTime;
                    }
                } else {
                    // Aggregate the current group into a single CandleStickChart
                    const open = currentGroup[0].open;
                    const close = currentGroup[currentGroup.length - 1].close;
                    const high = Math.max(...currentGroup.map(c => parseFloat(c.high)));
                    const low = Math.min(...currentGroup.map(c => parseFloat(c.low)));

                    // Create an aggregated candle for this 4-hour interval
                    aggregatedData.push({
                        high: high.toString(),
                        low: low.toString(),
                        open,
                        close,
                        ts: convertToCustomDate(currentStartTime), // Start of the 4-hour period
                        lowHigh: [low, high],
                        openClose: [open, close]

                    });

                    // Start a new group with the current candle
                    currentGroup = [candle];
                    currentStartTime = candleTime;
                }
            });

            return aggregatedData;
        }

        useEffect(() => {
            const tickSeries: SampleAssetData = generateData(new Date(startDate), new Date(endDate), asset,5);
            const candleStickSeries: CandleStickChart[] = transformToCandleStickSeries(tickSeries, frequency) ?? [];

            setData(candleStickSeries);

            const transformedData = transformToFourHourData(candleStickSeries);
            setFourHourData(transformedData);

        }, [startDate, endDate, asset]);



    useEffect(() => {
            resetSelectedTrades();
        console.log(data);
        console.log(fourHourData);
    }, [startDate, endDate, asset, frequency]);

        const removeTrade = (startTime: string) => {
            setTradingRule(tradingRules.filter(trade => trade.startTime !== startTime))
            setDefinedRefArea(tradingRules.filter(trade => trade.startTime !== startTime).map(trade => ({
                referencedAreaLeft: trade.startTime,
                referencedAreaRight: trade.endTime,
                tradeKind: trade.kind
            })));
        }

        const startEditTrade = (trade: TradingRule) => {
            setEditingTrade(trade);
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

        function createTradingStrategy(param: {
            name: string;
            rules: TradingRule[],
            selectedStartDate: string;
            selectedEndDate: string;
            frequency: CANDLESTICK_FREQUENCY
        }): TradingStrategy {
            const {name, rules} = param;

            return {
                id: uuidv4(),
                name,
                indicators: getRandomIndicators(),
                winRate: '62.5%',
                profitFactor: '62,5%',
                sharpeRatio: '2',
                status: 'active',
                tradingRules: rules,
                selectedStartDate: param.selectedStartDate,
                selectedEndDate: param.selectedEndDate,
                frequency: param.frequency,
                underline: data,
                tradeOnSample,
                tradeOffSample
            }

        }

        function saveTradingStrategy(tradingStrategy: TradingStrategy) {
            for (let i = 0; i < tradingStrategies.length; i++) {
                if (tradingStrategies[i].name === tradingStrategy.name) {
                    tradingStrategies[i] = tradingStrategy;
                    setTradingStrategy([...tradingStrategies]);
                    return;
                }
            }

            setTradingStrategy([...tradingStrategies, tradingStrategy]);
            return
        }

        const getRandomIndicators = () => {
            const indicators = ["MACD", "CCI", "RSI"];
            const randomCount = Math.floor(Math.random() * indicators.length) + 1;
            const shuffled = indicators.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, randomCount);
        };

        function handleCreateStrategy() {

            if (viewMode === VIEW_MODE.CREATE) {

                const isNameValid = !isNameExistent(currentTradingStrategyName);
                setIsStrategyNameValid(isNameValid);

                if (!isNameValid) {
                    return;
                }
            }

            if (tradingRules.length === 0) {

                return;
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            createBacktestingTrades(asset);

            const tradingStrategy = createTradingStrategy({
                name: currentTradingStrategyName,
                rules: tradingRules,
                selectedStartDate: startDate,
                selectedEndDate: endDate,
                frequency: frequency
            });

            console.log('tradingStrategy', tradingStrategy);
            console.log('tradingStrategy', JSON.stringify(tradingStrategy.tradingRules[0]));

            saveTradingStrategy(tradingStrategy);

            console.log('tradingStrategies', tradingStrategies);
            console.log('trading rules', JSON.stringify(tradingRules[0]));

            appRouterInstance.push('/strategy-management');
        }

        function convertToDatepickerFormat(startTime: string) {

            if (startTime.includes('T')) {
                return startTime;
            }

            const date = convertToDate(startTime);

            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const monthStr = month < 10 ? "0" + month : month;
            const day = date.getDate();
            const dayStr = day < 10 ? "0" + day : day;
            const hour = date.getHours();
            const hourStr = hour < 10 ? "0" + hour : hour;

            // '2024-11-09T01:11'
            return `${year}-${monthStr}-${dayStr}T${hourStr}:00`;

        }

        const isNameExistent = (value: string) => {
            if (tradingStrategies.find(strategy => strategy.name === value)) {
                return true;
            }
            return false;
        }

        function handleFrequencySelect(value: string) {
            if(value == 'four_hourly'){
                setFrequency(CANDLESTICK_FREQUENCY.FOUR_HOURLY)
            } else {
                setFrequency(CANDLESTICK_FREQUENCY.HOURLY)
            }
        }

        return (
            <Card className="w-full max-w-full">
                <CardHeader>
                    <CardTitle>Trading Strategy Creator</CardTitle>
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
                                    max={endDate}
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
                                <Select defaultValue={'hourly'}
                                    onValueChange={(value) => handleFrequencySelect(value)}
                                >
                                    <SelectTrigger id="frequency">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hourly">Hourly</SelectItem>
                                        <SelectItem value="four_hourly">4 Hourly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </form>
                    <div className="flex space-x-4 mb-4">
                        <div className="flex-4">
                            <Label htmlFor="asset">Trading Rule Name</Label>
                            <Input className={isStrategyNameValid ? "" : "border-red-500"} id={"tading-rule-name"}
                                   defaultValue={"My Trading Rule"} onChange={e => {
                                setCurrentTradingStrategyName(e.target.value)
                            }} disabled={viewMode === VIEW_MODE.EDIT}/>
                        </div>
                    </div>
                    <div className="flex space-x-4 mb-4 tradeKindButton">
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


                    <CandleStickChart data={frequency == CANDLESTICK_FREQUENCY.HOURLY ? data : fourHourData} asset={asset}/>


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
                                                                value={
                                                                    editingTrade ? convertToDatepickerFormat(editingTrade.startTime) : ''
                                                                }
                                                                onChange={(e) => {
                                                                    setEditingTrade(prev => prev ? {
                                                                        ...prev,
                                                                        startTime: e.target.value
                                                                    } : null)

                                                                }}
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
                                                                value={editingTrade ? convertToDatepickerFormat(editingTrade.endTime) : ''}
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

                        <Link href="/strategy-management">
                            <Button variant="outline" size="sm">
                                {/*<Trash2 className="h-4 w-4"/>*/}
                                Cancel
                            </Button>
                        </Link>
                        <Button variant="default" size="sm" onClick={handleCreateStrategy}>
                            {/*<Trash2 className="h-4 w-4"/>*/}
                            Create
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }
);
export default EnhancedTradingAssetViewer;