import TradingRuleStore, {TradingRule} from "@/store/TradingRuleStore";
import {makeAutoObservable} from "mobx";
import {CANDLESTICK_FREQUENCY, convertToCustomDate} from "@/utils";
import CandleStickChart from "@/components/ui/candleStickChart";


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

    //user configured
    tradingRules: TradingRule[],

    //trading algo configured
    tradingRulesOnSample: TradingRule[];

    //trading algo generated
    tradingRuleOffSample: TradingRule[];

}

function generateRandomTrades(asset: 'EURUSD' | 'USDJPY' | 'GBPUSD' | 'EURCHF' | 'EURNOK'): TradingRule[] {
    const randomTrades: TradingRule[] = [];
    for(let i=0; i < 10; i++){
        randomTrades.push({
            kind: 'short',
            startTime: convertToCustomDate(new Date()),
            endTime: convertToCustomDate(new Date()),
            asset,
            profitNLoss: 1,
        })
    }
    return randomTrades;
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

    generateBacktestingTrades = (asset:'EURUSD' | 'USDJPY' | 'GBPUSD' | 'EURCHF' | 'EURNOK' = 'EURUSD') => {
        this.tradeOnSample= generateRandomTrades(asset);
        this.tradeOffSample= generateRandomTrades(asset);
    }



}


export const RootStore = {
    tradingRuleStore: new TradingRuleStore(),
    tradingStrategyStore: new TradingStrategyStore(),
}