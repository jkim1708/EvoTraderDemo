import TradingRuleStore, {TradingRule} from "@/store/TradingRuleStore";

class TradingStrategyStore {

    tradingRules: TradingRule[];

    constructor() {
        this.tradingRules = [];
    }

    setTradingRule = (tradingRules: TradingRule[]) => {
        this.tradingRules = tradingRules
    };



}

export const RootStore = {
    tradingRuleStore: new TradingRuleStore(),

    tradingStrategyStore: new TradingStrategyStore(),
}