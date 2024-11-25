import EnhancedTradingAssetViewer from "@/components/enhanced-trading-asset-viewer";
import React, {Suspense} from "react";
import {StoreWrapper} from "@/store/Provider";

//hook to get stores


 const Page = () => {
  return (<StoreWrapper><Suspense> <EnhancedTradingAssetViewer /></Suspense> </StoreWrapper>);
}

export default Page;