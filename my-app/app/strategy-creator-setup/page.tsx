import React from "react";
import {StoreWrapper} from "@/store/Provider";
import StrategyCreatorSetup from "@/components/strategy-creator-setup";

const Page = () => {

    return (
        <StoreWrapper>
            <StrategyCreatorSetup />
        </StoreWrapper>
    );
}

export default Page;