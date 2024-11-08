import StrategyManager from "@/components/strategy-manager";
import React from "react";
import {StoreWrapper} from "@/store/Provider";

const Page = () => {

    return (
        <StoreWrapper>
            <StrategyManager />
        </StoreWrapper>
    );
}

export default Page;