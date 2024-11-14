import TradingRuleStore, {TradingRule} from "@/store/TradingRuleStore";
import {makeAutoObservable} from "mobx";
import {CANDLESTICK_FREQUENCY} from "@/utils";
import CandleStickChart from "@/components/ui/candleStickChart";


export interface TradingStrategy {
    id: string,
    name: string,
    indicators: string[],
    winRate: string,
    profitFactor: string,
    sharpeRatio: string,
    status: 'active' | 'inactive',
    tradingRules: TradingRule[],
    underline: CandleStickChart[],
    selectedStartDate: string,
    selectedEndDate: string,
    frequency: CANDLESTICK_FREQUENCY,

}

class TradingStrategyStore {

    tradingStrategies: TradingStrategy[];

    constructor() {
        this.tradingStrategies = [];

        makeAutoObservable(this);
    }

    setTradingStrategy = (tradingRules: TradingStrategy[]) => {
        this.tradingStrategies = tradingRules
    };



}


export const RootStore = {
    tradingRuleStore: new TradingRuleStore(),
    tradingStrategyStore: new TradingStrategyStore(),
}