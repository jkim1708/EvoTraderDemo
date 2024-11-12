import TradingRuleStore, {TradingRule} from "@/store/TradingRuleStore";
import {makeAutoObservable} from "mobx";


export interface TradingStrategy {
    id: string,
    name: string,
    indicators: string[],
    winRate: string,
    profitFactor: string,
    sharpeRatio: string,
    status: 'active' | 'inactive',
    tradingRules: TradingRule[],
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