import EnhancedTradingAssetViewer from "@/components/enhanced-trading-asset-viewer";
import React from "react";
import {StoreWrapper} from "@/store/Provider";

//hook to get stores


 const Page = () => {
  return (<StoreWrapper> <EnhancedTradingAssetViewer /> </StoreWrapper>);
}

export default Page;