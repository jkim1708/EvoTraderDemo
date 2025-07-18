"use client"

// import dynamic from 'next/dynamic'
import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
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
    CANDLESTICK_FREQUENCY,
    convertToCustomDate,
    convertToDate,
    useDaxData
} from "@/utils";
import CandleStickChart from "@/components/ui/candleStickChart";
import {observer} from "mobx-react-lite";
import {TradingRule} from "@/store/TradingRuleStore";
import {useStores} from "@/store/Provider";
import {v4 as uuidv4} from 'uuid';
import Link from "next/link";
import {TradingStrategy} from "@/store/RootStore";
import {useRouter, useSearchParams} from "next/navigation";

const EnhancedTradingAssetViewer = observer(() => {


        const {
            tradingRuleStore: {
                tradingRules,
                setTradingRule,
                setDefinedRefArea,
                setCurrentTradingStrategyName,
                currentTradingStrategyName,
                currentTradingStrategyOnSampleRange,
                setCurrentTradingStrategyOnSampleRange,
            },
            tradingStrategyStore: {setTradingStrategy, tradingStrategies, tradeOnSample, tradeOffSample},
        } = useStores();

        const searchParams = useSearchParams();



        const isEditMode = searchParams.get('strategyName')

        let initialStartDate;
        let initialAsset;
        let initialFrequency;

        //initialize edit Page
        if (isEditMode) {
            setCurrentTradingStrategyName(isEditMode as string);
            tradingStrategies.filter(strategy => strategy.name === isEditMode).forEach(strategy => {
                initialStartDate = strategy.selectedStartDate;
                setTradingRule(strategy.tradingRules);
                setDefinedRefArea(strategy.tradingRules.map(trade => (

                    {
                        referencedAreaLeft: trade.startTime,
                        referencedAreaRight: trade.endTime,
                        tradeKind: trade.kind
                    })));
                initialAsset = strategy.tradingRules[0].asset;
                setCurrentTradingStrategyOnSampleRange(parseInt(strategy.backtestingOnSample.endDate));
            });
        }
        // after setup page
        else {
            setCurrentTradingStrategyName(searchParams.get('tradingName') ?? 'My Trading Rule');
            initialStartDate = searchParams.get('startDate');
            const paramFrequency = searchParams.get('frequency');
            if(paramFrequency == '0'){
                initialFrequency = CANDLESTICK_FREQUENCY.HOURLY;
            } else if(paramFrequency == '1') {
                initialFrequency = CANDLESTICK_FREQUENCY.FOUR_HOURLY;
            }
            initialAsset = searchParams.get('asset');
        }

        const [startDate, setStartDate] = useState(initialStartDate ?? new Date('2020-02-01').toISOString().split('T')[0])
        const [frequency] = useState(initialFrequency ?? CANDLESTICK_FREQUENCY.HOURLY)
        const [asset, setAsset] = useState(initialAsset ?? "EURUSD")
        const [data, setData] = useState([] as CandleStickChart[])
        const [fullTimeRangeData, setFullTimeRangeData] = useState([] as CandleStickChart[])
        const [fullTimeRangeFourHourData, setFullTimeRangeMasterFourHourData] = useState([] as CandleStickChart[])
        const [fourHourData, setFourHourData] = useState([] as CandleStickChart[])

        enum VIEW_MODE {
            CREATE,
            EDIT
        };
        const [viewMode, setViewMode] = useState(VIEW_MODE.CREATE)

        // const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null)
        // const [tradeType, setTradeType] = useState<'long' | 'short'>('long')
        const [editingTrade, setEditingTrade] = useState<TradingRule | null>(null)
        const [errors, setErrors] = useState([])
        const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false)

        const resetSelectedTrades = () => {
            setTradingRule([]);
            setDefinedRefArea([]);
        }


        const appRouterInstance = useRouter();


        useEffect(() => {
            console.log("use Effect empty")
            if (isEditMode) {
                setViewMode(VIEW_MODE.EDIT);

            }
        }, []);

        useEffect(() => {
            console.log("use Effect isEditMode")
            if (isEditMode) {
                setCurrentTradingStrategyName(isEditMode as string);
                tradingStrategies.filter(strategy => strategy.name === isEditMode).forEach(strategy => {
                    setStartDate(strategy.selectedStartDate);
                    setTradingRule(strategy.tradingRules);
                    setDefinedRefArea(strategy.tradingRules.map(trade => ({
                        referencedAreaLeft: trade.startTime,
                        referencedAreaRight: trade.endTime,
                        tradeKind: trade.kind
                    })));
                    setAsset(strategy.tradingRules[0].asset);
                });

            }
        }, [isEditMode]);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        function transformToFourHourData(candleStickSeries) {

            // Initialize result array
            const aggregatedData: {
                high: string,
                low: string,
                open: string,
                close: string,
                ts: string, // Start of the 4-hour period
                lowHigh: [number, number],
                openClose: [string, string],
                movingAverage: string,
                movingAverage50: string,
                rsi: string
            }[] = [];

            // Start the aggregation process
            let currentGroup: {
                high: string,
                low: string,
                open: string,
                close: string,
                ts: string, // Start of the 4-hour period
                lowHigh: [number, number],
                openClose: [number, number],
                movingAverage: string,
                movingAverage50: string,
                rsi: string
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
                        openClose: [open, close],
                        movingAverage: '',
                        movingAverage50: '',
                        rsi: ''
                    });

                    // Start a new group with the current candle
                    currentGroup = [candle];
                    currentStartTime = candleTime;
                }
            });

            return aggregatedData;
        }

    function calculateRSI(data: CandleStickChart[], period: number = 24*14): CandleStickChart[] {
        let gains = 0;
        let losses = 0;

        // Initialize the first period
        for (let i = 0; i <= period; i++) {
            console.log("done",data[i]);
            const change = parseFloat(data[i].close) - parseFloat(data[i +1].close);
            if (change > 0) {
                gains += change;
            } else {
                losses -= change;
            }
            data[i]['rsi'] = '40';
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        // Calculate RSI for the rest of the data
        for (let i = period; i < data.length; i++) {
            console.log("done 2",data[i]);
            const change = parseFloat(data[i].close) - parseFloat(data[i - 24].close);
            if (change > 0) {
                gains = change;
                losses = 0;
            } else {
                gains = 0;
                losses = -change;
            }

            avgGain = (avgGain * (period - 1) + gains) / period;
            avgLoss = (avgLoss * (period - 1) + losses) / period;

            const rs = avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));

            data[i]['rsi'] = rsi.toString();
        }

        return data;
    }

    function attachMovingAverageData(data: CandleStickChart[]): CandleStickChart[] {
            //SMA period
        const SMA_PERIOD_10 = 10; // 10 hours weil data is hourly data
        const SMA_PERIOD_50 = 50; // 50 hours weil data is hourly data
        data.map((tickData, index) => {
            const movingAverage = data.slice(Math.max(0, index - (SMA_PERIOD_10)), index)
                    .reduce((acc, tickData) => {
                        return acc + parseFloat(tickData.close);
                    }, 0)

                / (SMA_PERIOD_10);
            if (index < (SMA_PERIOD_10)) {
                tickData['movingAverage'] = tickData.close;
            } else {
                tickData['movingAverage'] = movingAverage.toString();
            }
        });
        data.map((tickData, index) => {
            const movingAverage = data.slice(Math.max(0, index - (SMA_PERIOD_50)), index)
                    .reduce((acc, tickData) => {
                        return acc + parseFloat(tickData.close);
                    }, 0)

                / (SMA_PERIOD_50);
            if (index < (SMA_PERIOD_50)) {
                tickData['movingAverage50'] = tickData.close;
            } else {
                tickData['movingAverage50'] = movingAverage.toString();
            }
        });

        return data;
    }


    useEffect(() => {
            // const tickSeries: SampleAssetData = generateData(new Date('2019-10-01'), new Date(), asset, 15);
            // const candleStickSeries: CandleStickChart[] = transformToCandleStickSeries(tickSeries) ?? [];
            const candleStickSeries: CandleStickChart[] = useDaxData() ?? [];

            console.log("candleStickSeries",candleStickSeries);

            const dataWithMovingAverage = attachMovingAverageData(candleStickSeries);
            const allData = ((dataWithMovingAverage.length > 0) ? calculateRSI(dataWithMovingAverage) : dataWithMovingAverage);

            setFullTimeRangeData(allData);
            setData(candleStickSeries);

            const transformedData = transformToFourHourData(candleStickSeries);
            setFullTimeRangeMasterFourHourData(transformedData);
            // setFourHourData(transformedData);

            setNewStartDateVisibleDate(startDate, candleStickSeries, transformedData);

        }, [asset]);

        function setNewStartDateVisibleDate(startDate: string, fullTimeRangeData: CandleStickChart[], fullTimeRangeFourHourData: CandleStickChart[]) {
            fullTimeRangeData.forEach((d, i) => {
                if (d.ts.split(',')[0] === startDate) setData(fullTimeRangeData.slice(i));
            });
            fullTimeRangeFourHourData.forEach((d, i) => {
                if (d.ts.split(',')[0] === startDate) setFourHourData(fullTimeRangeFourHourData.slice(i));
            });
        }

        useEffect(() => {
            setNewStartDateVisibleDate(startDate, fullTimeRangeData, fullTimeRangeFourHourData);
        }, [startDate]);

        useEffect(() => {
            resetSelectedTrades();

        }, [startDate, asset, frequency]);

        const removeTrade = (startTime: string) => {
            console.log("remove trade", startTime)
            if (!isEditMode) {
                console.log("!isEditMode", isEditMode)
                setTradingRule(tradingRules.filter(trade => trade.startTime !== startTime));
                setDefinedRefArea(tradingRules.filter(trade => trade.startTime !== startTime).map(trade => (

                    {
                        referencedAreaLeft: trade.startTime,
                        referencedAreaRight: trade.endTime,
                        tradeKind: trade.kind
                    })));

            } else {
                console.log("isEditMode", isEditMode)
                console.log("tradingStrategies", tradingStrategies[0].name)
                tradingStrategies.filter(strategy => strategy.name === isEditMode).forEach(strategy => {
                console.log("strategy", strategy.tradingRules[0].startTime)
                    const filteredStrategies = strategy.tradingRules.filter(trade => trade.startTime !== startTime);
                console.log("filteredStrategies.length", filteredStrategies.length)
                    if (filteredStrategies.length !== 0) {
                        strategy.tradingRules = filteredStrategies;
                        setDefinedRefArea(strategy.tradingRules.filter(trade => trade.startTime !== startTime).map(trade => (
                            {
                                referencedAreaLeft: trade.startTime,
                                referencedAreaRight: trade.endTime,
                                tradeKind: trade.kind
                            })));

                    } else {
                        const error = [];
                        error.push("at_least_one_trade");

                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        setErrors(error);
                    }
                })
            }
        };

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

            rules[0].asset = asset as 'EURUSD' | 'USDJPY' | 'GBPUSD' | 'EURCHF' | 'EURNOK';
console.log("datasss",data)
            console.log("start date",data[0].ts.split(',')[0])
            console.log("end date", data[currentTradingStrategyOnSampleRange].ts.split(',')[0]);

            return {
                id: uuidv4(),
                name,
                indicators: getRandomIndicators(),
                winRate: '62.5%',
                profitFactor: '1,2',
                sharpeRatio: '2',
                status: 'active',
                tradingRules: rules,
                selectedStartDate: param.selectedStartDate,
                selectedEndDate: param.selectedEndDate,
                frequency: param.frequency,
                backtestingOffSample: {
                    startDate: '',
                    endDate: '',
                    trades: [],
                },
                backtestingOnSample: {
                    startDate: data[0].ts.split(',')[0],
                    endDate: data[currentTradingStrategyOnSampleRange].ts.split(',')[0]
                },
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

            const error = [];
            if (viewMode === VIEW_MODE.CREATE) {

                const isNameValid = !isNameExistent(currentTradingStrategyName);
                // setIsStrategyParamValid((isNameValid && isBacktestingOffSampleValid));

                if (!(isNameValid)) {
                    if (!isNameValid) {
                        error.push("duplicate_trading_name");
                    }

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    setErrors(error);
                    setShowErrorDialog(true);
                    return
                }
            }

            if (tradingRules.length === 0) {
                error.push("no_trading_rule");
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setErrors(error);
                setShowErrorDialog(true);
                return
            }

            const tradingStrategy = createTradingStrategy({
                name: currentTradingStrategyName,
                rules: tradingRules,
                selectedStartDate: startDate,
                selectedEndDate: "",
                frequency: frequency
            });
            console.log("done")
            saveTradingStrategy(tradingStrategy);

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

        return (
            <Card className="w-full max-w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Trading Strategy Creator (TSC)</CardTitle>
                    <p className="text-muted-foreground">Select asset, date range, and manage trades</p>
                </CardHeader>
                <CardContent>
                    <CandleStickChart data={frequency == CANDLESTICK_FREQUENCY.HOURLY ? data : fourHourData}
                                      asset={asset}
                    />

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

                        <div>
                            <Dialog open={showErrorDialog}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Error Input Value</DialogTitle>
                                        <DialogDescription>Please insert or change input
                                            values</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <p>
                                            {
                                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                // @ts-expect-error
                                                errors.includes("duplicate_trading_name") ?
                                                    "Trading name already exists" : ""}
                                        </p>
                                        <p>
                                            {
                                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                // @ts-expect-error
                                                errors.includes("no_trading_rule") ?
                                                    "No trading rule selected" : ""}
                                        </p>
                                        <p>
                                            {
                                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                // @ts-expect-error
                                                errors.includes("no_backtesting_range") ?
                                                    "No backtesting range selected" : ""}

                                        </p>
                                        <p>
                                            {
                                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                // @ts-expect-error
                                                errors.includes("at_least_one_trade") ?
                                                    "At least one trade needs to exist" : ""}

                                        </p>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose>
                                            <Button
                                                onClick={() => setShowErrorDialog(false)}>Ok</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>


                    </div>
                </CardContent>
            </Card>
        )
    }
);
export default EnhancedTradingAssetViewer;