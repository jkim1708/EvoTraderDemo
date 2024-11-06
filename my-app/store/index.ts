import { enableStaticRendering } from "mobx-react-lite";
import TradingRuleStore, {TradingRule} from "./TradingRuleStore";

enableStaticRendering(typeof window === "undefined");

let clientStore: undefined | TradingRuleStore;

const initStore = (tradingRules: TradingRule[]) => {
    const store = clientStore ?? new TradingRuleStore();
    if (tradingRules) store.hydrate(tradingRules);

    if (typeof window === "undefined") return store;
    if (!clientStore) clientStore = store;
    return store;
};

export function useStore(tradingRules: TradingRule[]) {
    return initStore(tradingRules);
}
