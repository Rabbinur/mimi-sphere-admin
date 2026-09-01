"use client";

import {
    useCreateBrandMutation,
    useUpdateBrandMutation,
} from "@/components/Redux/RTK/brandApi";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaFile, MediaLibrary } from "@/components/ui/media-manager";
import { Switch } from "@/components/ui/switch";
import { Loader2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface TBrand {
    _id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    isActive: boolean;
    order: number;
    displayOrder?: number;
    isFeatured?: boolean;
}

type Mode = "create" | "edit";

interface CreateEditBrandDialogProps {
    mode?: Mode;
    triggerLabel?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    brandToEdit?: TBrand | null;
    onSuccess?: () => void;
}

export default function CreateEditBrandDialog({
    mode = "create",
    triggerLabel,
    open,
    onOpenChange,
    brandToEdit = null,
    onSuccess,
}: CreateEditBrandDialogProps) {
    const [createBrand, { isLoading: creating }] = useCreateBrandMutation();
    const [updateBrand, { isLoading: updating }] = useUpdateBrandMutation();

    // local form state
    const [name, setName] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isFeatured, setIsFeatured] = useState(false);
    const [internalOpen, setInternalOpen] = useState(false);

    // support controlled open (edit) or internal (create with trigger)
    useEffect(() => {
        if (typeof open === "boolean") {
            setInternalOpen(open);
        }
    }, [open]);

    useEffect(() => {
        if (mode === "edit" && brandToEdit) {
            setName(brandToEdit.name || "");
            setLogoUrl(brandToEdit.logoUrl || "");
            setIsActive(brandToEdit.isActive ?? true);
            setDisplayOrder(brandToEdit.displayOrder || brandToEdit.order || 0);
            setIsFeatured(brandToEdit.isFeatured || false);
        } else if (mode === "create") {
            // reset on open
            setName("");
            setLogoUrl("");
            setIsActive(true);
            setDisplayOrder(0);
            setIsFeatured(false);
        }
    }, [mode, brandToEdit, internalOpen]);

    const closeDialog = () => {
        if (onOpenChange) onOpenChange(false);
        else setInternalOpen(false);
    };

    const handleSelectLogo = (files: MediaFile[]) => {
        if (files && files.length > 0) {
            setLogoUrl(files[0].url);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!name.trim()) {
            toast.error("Brand name is required");
            return;
        }

        const payload = {
            name: name.trim(),
            logoUrl: logoUrl || undefined,
            isActive,
            order: Number(displayOrder),
            displayOrder: Number(displayOrder),
            isFeatured,
        };

        try {
            let res;

            if (mode === "create") {
                res = await createBrand(payload).unwrap();

                if (res.success || res.statusCode === 201) {
                    toast.success(res.message || "Brand created successfully");
                } else {
                    toast.error(res.message || "Failed to create brand");
                    return;
                }
            }

            if (mode === "edit" && brandToEdit) {
                res = await updateBrand({
                    id: brandToEdit._id,
                    data: payload,
                }).unwrap();

                if (res.success || res.statusCode === 200) {
                    toast.success(res.message || "Brand updated successfully");
                } else {
                    toast.error(res.message || "Failed to update brand");
                    return;
                }
            }

            onSuccess?.();
            closeDialog();
        } catch (err: any) {
            console.error(err);
            toast.error(
                err?.data?.message ||
                err?.data?.error ||
                "Operation failed"
            );
        }
    };

    // Provide a trigger for create mode if triggerLabel provided
    const trigger = triggerLabel ? (
        <DialogTrigger asChild>
            <Button onClick={() => setInternalOpen(true)}>{triggerLabel}</Button>
        </DialogTrigger>
    ) : null;

    return (
        <Dialog open={internalOpen} onOpenChange={(val) => {
            if (onOpenChange) onOpenChange(val);
            setInternalOpen(val);
        }}>
            {trigger}
            <DialogContent className="sm:max-w-[500px] bg-white border border-slate-200 shadow-lg rounded-lg">
                <DialogHeader className="border-b pb-3">
                    <DialogTitle className="text-xl font-semibold text-slate-800">
                        {mode === "create" ? "Create Brand" : `Edit Brand: ${brandToEdit?.name || ""}`}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="brand-name" className="text-sm font-medium text-slate-700">
                            Brand Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="brand-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. CosRx"
                            required
                            className="h-10 border-slate-200 focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <Label className="text-sm font-medium text-slate-700">Brand Logo</Label>
                        <MediaLibrary
                            onSelect={handleSelectLogo}
                            multiple={false}
                            title="Select Brand Logo"
                        />
                        {logoUrl && (
                            <div className="mt-2 relative w-24 h-24 border border-slate-100 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-2">
                                <img src={logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-sm hover:scale-105 transition-transform"
                                    onClick={() => setLogoUrl("")}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="display-order" className="text-sm font-medium text-slate-700">
                            Display Order
                        </Label>
                        <Input
                            id="display-order"
                            type="number"
                            value={displayOrder}
                            onChange={(e) => setDisplayOrder(Number(e.target.value))}
                            placeholder="0"
                            className="h-10 border-slate-200 focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition-colors">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium text-slate-800">Active Status</Label>
                            <div className="text-xs text-slate-500">Show or hide this brand page across the site</div>
                        </div>
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition-colors">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium text-slate-800">Featured Brand</Label>
                            <div className="text-xs text-slate-500">Showcase this brand in featured homepage carousels or sections</div>
                        </div>
                        <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                    </div>

                    <DialogFooter className="pt-4 border-t flex gap-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={closeDialog}
                            className="h-10 border-slate-200 hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={mode === "create" ? creating : updating}
                            className="h-10 min-w-[120px]"
                        >
                            {mode === "create" ? (
                                creating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Brand"
                                )
                            ) : (
                                updating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
