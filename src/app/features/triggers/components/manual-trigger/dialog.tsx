"use client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface props {
    open: boolean;
    onOpenChange: (open: boolean) => void
}

export const ManualTriggerDialog = ({ open, onOpenChange }: props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manual Trigger</DialogTitle>
                    <DialogDescription>
                        Configure the setting for manual trigger node.
                    </DialogDescription>
                </DialogHeader>
                <div className='py-4'>
                    <p className='text-sm text-muted-foreground'>Used to manually execute a workflow, no configuration available.</p>
                </div>
            </DialogContent>
        </Dialog>
    )

}