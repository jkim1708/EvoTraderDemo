import { makeAutoObservable } from "mobx";

export interface TradingRule {
    kind: "short" | "long",
    startTime: string,
    endTime: string,
    asset: 'EURUSD' | 'USDJPY' | 'GBPUSD' | 'EURCHF' | 'EURNOK',
    profitNLoss: number,

}

class TradingRuleStore {

    tradingRules: TradingRule[];

    constructor() {
        this.tradingRules = [];
        // this.searchParam = "";
        makeAutoObservable(this);
    }
    //
    // setSearchParam = (param) => {
    //     this.searchParam = param;
    // };
    //
    setTradingRule = (tradingRules: TradingRule[]) => {
        console.log("trading rules", this.tradingRules);
        this.tradingRules = tradingRules
    };
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
