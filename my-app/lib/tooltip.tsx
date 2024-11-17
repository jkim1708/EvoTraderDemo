import * as Tooltip from "@radix-ui/react-tooltip";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const TooltipWrapper = ({children,content}) => {
    return (
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                        {children}
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content className="TooltipContent" sideOffset={5}>
                        {content}
                        <Tooltip.Arrow className="TooltipArrow" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
};

export default TooltipWrapper;