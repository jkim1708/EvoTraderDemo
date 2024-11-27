import { makeAutoObservable } from "mobx";

export interface TradingRule {
    kind: "short" | "long",
    startTime: string,
    endTime: string,
    asset: 'EURUSD' | 'USDJPY' | 'GBPUSD' | 'EURCHF' | 'EURNOK',
    profitNLoss: number,

}

class TradingRuleStore {

    currentTradingStrategyName: string;

    setCurrentTradingStrategyName = (name: string) => {
        this.currentTradingStrategyName = name;
    }
    tradingRules: TradingRule[];

    definedRefArea: { referencedAreaLeft: string, referencedAreaRight: string, tradeKind: 'long' | 'short'  }[] = [];

    currentSelectedAsset: 'EURUSD' | 'USDJPY' | 'GBPUSD' | 'EURCHF' | 'EURNOK' = 'EURUSD';

    currentSelectedTradeKind: 'short' | 'long';

    currentTradingStrategyOnSampleRange: number = 180;

    constructor() {
        this.tradingRules = [];
        this.currentSelectedTradeKind = 'long';
        this.currentSelectedAsset = 'EURUSD';
        this.currentTradingStrategyName = 'My Trading Strategy Name'
        // this.searchParam = "";
        makeAutoObservable(this);
    }
    //
    // setSearchParam = (param) => {
    //     this.searchParam = param;
    // };
    //
    setTradingRule = (tradingRules: TradingRule[]) => {
        this.tradingRules = tradingRules
    };

    setCurrentTradingStrategyOnSampleRange = (range: number) => {
        this.currentTradingStrategyOnSampleRange = range;
    }

    setDefinedRefArea = (definedRefArea: { referencedAreaLeft: string, referencedAreaRight: string, tradeKind: 'long' | 'short' }[]) => {
        this.definedRefArea = definedRefArea;
    }

    setCurrentSelectedAsset = (asset: 'EURUSD' | 'USDJPY' | 'GBPUSD' | 'EURCHF' | 'EURNOK') => {
        this.currentSelectedAsset = asset;
    }

    setCurrentSelectedTradeKind = (kind: 'short' | 'long') => {
        this.currentSelectedTradeKind = kind;
    }
    //
    // fetchBooks = async () => {
    //     return Promise.resolve(books);
    // };
    //
    // fetchAndSetBooksOnClient = async () => {
    //     const newBooks = await Promise.resolve([...books, ...clientBooks]);
    //     console.log(newBooks);
    //     this.setBooks(newBooks);
    // };
    //
    // get filteredBooks() {
    //     return this.books.filter((book) =>
    //         book.title.toLowerCase().includes(this.searchParam.toLowerCase())
    //     );
    // }
    //
    // get totalBooks() {
    //     return this.books.length;
    // }
    //
    hydrate = (tradingRules: TradingRule[]) => {
        if (!tradingRules) return;
        this.setTradingRule(tradingRules);
    };
}

export default TradingRuleStore;
