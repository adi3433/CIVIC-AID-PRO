
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";

interface AddUtilityModalProps {
    onAdd: (data: any) => void;
    trigger?: React.ReactNode;
}

export function AddUtilityModal({ onAdd, trigger }: AddUtilityModalProps) {
    const [open, setOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ name: "New Utility", type: "electricity" }); // Mock implementation
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="text-primary p-0 h-auto font-normal">
                        <Plus className="w-4 h-4 mr-1" /> Add New
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Utility</DialogTitle>
                    <DialogDescription>
                        Track bills for electricity, water, or gas.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="provider" className="text-right">
                            Provider
                        </Label>
                        <Input id="provider" placeholder="e.g. Tata Power" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="consumer" className="text-right">
                            Consumer ID
                        </Label>
                        <Input id="consumer" placeholder="e.g. 102938475" className="col-span-3" required />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Add Utility</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
