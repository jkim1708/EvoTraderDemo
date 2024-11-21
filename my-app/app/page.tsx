import EnhancedTradingAssetViewer from "@/components/enhanced-trading-asset-viewer";
import React, {Suspense} from "react";
import {StoreWrapper} from "@/store/Provider";
import {generateData} from "@/utils";

//hook to get stores


 const Page = () => {
  generateData(new Date('01-01-2013'), new Date(), "EURUSD", 60*24*7)

  return (<StoreWrapper><Suspense> <EnhancedTradingAssetViewer /></Suspense> </StoreWrapper>);
}

export default Page;