import React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const dialog = (open,setOpen) => {

    return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
            <AlertDialog.Trigger>Open</AlertDialog.Trigger>
            <AlertDialog.Portal>
                <AlertDialog.Overlay />
                <AlertDialog.Content>
                    <AlertDialog.Title>Title</AlertDialog.Title>
                    <AlertDialog.Description>Description</AlertDialog.Description>

                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
};

export default dialog;
