import TradingRuleStore, {TradingRule} from "@/store/TradingRuleStore";
import {makeAutoObservable} from "mobx";
import {CANDLESTICK_FREQUENCY} from "@/utils";
import CandleStickChart from "@/components/ui/candleStickChart";


export interface BacktestingOffSample {
    startDate: string,
    endDate: string,
    trades: TradingRule[],
}

export interface BacktestingOnSample {
    startDate: string,
    endDate: string,
}

export interface TradingStrategy {
    id: string,
    name: string,
    indicators: string[],
    winRate: string,
    profitFactor: string,
    sharpeRatio: string,
    status: 'active' | 'inactive',
    underline: CandleStickChart[],
    selectedStartDate: string,
    selectedEndDate: string,
    frequency: CANDLESTICK_FREQUENCY,

    backtestingOffSample: BacktestingOffSample;
    backtestingOnSample: BacktestingOnSample;

    //user configured
    tradingRules: TradingRule[],

    //trading algo configured
    tradeOnSample: TradingRule[];

    //trading algo generated
    tradeOffSample: TradingRule[];

}



class TradingStrategyStore {

    tradingStrategies: TradingStrategy[];
    tradeOnSample: TradingRule[];
    tradeOffSample: TradingRule[];

    constructor() {
        this.tradingStrategies = [];
        this.tradeOnSample = [];
        this.tradeOffSample = [];

        makeAutoObservable(this);
    }

    setTradingStrategy = (tradingStrategies: TradingStrategy[]) => {
        this.tradingStrategies = tradingStrategies
    };

}


export const RootStore = {
    tradingRuleStore: new TradingRuleStore(),
    tradingStrategyStore: new TradingStrategyStore(),
}