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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

// RTK hooks
import {
    useAllCategoryQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
} from "@/components/Redux/RTK/categoryApi";
import { toast } from "sonner";

interface TCategory {
    _id: string;
    name: string;
    description?: string;
    parent_category_id?: string | null;
    imageUrl?: string;
    bannerImage?: string;
    isActive?: boolean;
    showInNavbar?: boolean;
    order?: number;
    sub_categories?: TCategory[];
}

type Mode = "create" | "edit";

interface CreateEditCategoryDialogProps {
    mode?: Mode; // default create
    triggerLabel?: string;
    triggerVariant?: "default" | "outline" | "secondary" | "ghost";
    triggerSize?: "default" | "sm" | "lg" | "icon";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    categoryToEdit?: TCategory | null;
    defaultParentId?: string | null;
    onSuccess?: () => void;
}

export default function CreateEditCategoryDialog({
    mode = "create",
    triggerLabel,
    triggerVariant = "default",
    triggerSize = "default",
    open,
    onOpenChange,
    categoryToEdit = null,
    defaultParentId = null,
    onSuccess,
}: CreateEditCategoryDialogProps) {
    const { data: topCategories = [] } = useAllCategoryQuery(false);
    const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();

    // local form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [parentId, setParentId] = useState<string | null>(defaultParentId);
    const [selectedImage, setSelectedImage] = useState<MediaFile | null>(null);
    const [selectedBanner, setSelectedBanner] = useState<MediaFile | null>(null);
    const [order, setOrder] = useState<number | string>("");
    const [isActive, setIsActive] = useState<boolean>(true);
    const [showInNavbar, setShowInNavbar] = useState<boolean>(true);
    const [internalOpen, setInternalOpen] = useState(false);

    // support controlled open (edit) or internal (create with trigger)
    useEffect(() => {
        if (typeof open === "boolean") {
            setInternalOpen(open);
        }
    }, [open]);

    useEffect(() => {
        if (mode === "edit" && categoryToEdit) {
            setName(categoryToEdit.name || "");
            setDescription(categoryToEdit.description || undefined);
            setParentId(categoryToEdit.parent_category_id ?? null);
            setOrder(typeof categoryToEdit.order === "number" ? categoryToEdit.order : "");
            setIsActive(categoryToEdit.isActive !== false);
            setShowInNavbar(categoryToEdit.showInNavbar !== false);

            if (categoryToEdit.imageUrl) {
                setSelectedImage({
                    _id: "existing-thumb-" + categoryToEdit._id,
                    url: categoryToEdit.imageUrl,
                    key: categoryToEdit.imageUrl,
                    size: 0,
                    mimetype: "image/*",
                    title: "Current thumbnail",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            } else {
                setSelectedImage(null);
            }

            if (categoryToEdit.bannerImage) {
                setSelectedBanner({
                    _id: "existing-banner-" + categoryToEdit._id,
                    url: categoryToEdit.bannerImage,
                    key: categoryToEdit.bannerImage,
                    size: 0,
                    mimetype: "image/*",
                    title: "Current banner",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            } else {
                setSelectedBanner(null);
            }
        } else if (mode === "create") {
            setName("");
            setDescription(undefined);
            setParentId(defaultParentId || null);
            setOrder("");
            setIsActive(true);
            setShowInNavbar(true);
            setSelectedImage(null);
            setSelectedBanner(null);
        }
    }, [mode, categoryToEdit, internalOpen, defaultParentId]);

    const closeDialog = () => {
        if (onOpenChange) onOpenChange(false);
        else setInternalOpen(false);
    };

    const handleSelectImage = (files: MediaFile[]) => {
        if (!files || files.length === 0) return;
        setSelectedImage(files[0]);
    };

    const handleSelectBanner = (files: MediaFile[]) => {
        if (!files || files.length === 0) return;
        setSelectedBanner(files[0]);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        let parsedOrder: number | undefined = undefined;
        if (order !== "" && order !== undefined && order !== null) {
            const num = Number(order);
            if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
                toast.error("Display Order must be a valid non-negative integer (e.g. 0, 1, 2)");
                return;
            }
            parsedOrder = num;
        }

        const payload: any = {
            name: name.trim(),
            description: description?.trim() || undefined,
            parent_category_id: parentId && parentId !== "none" ? parentId : null,
            imageUrl: selectedImage?.url || "",
            bannerImage: selectedBanner?.url || "",
            isActive: Boolean(isActive),
            showInNavbar: Boolean(showInNavbar),
        };

        if (parsedOrder !== undefined) {
            payload.order = parsedOrder;
        }

        try {
            let res;

            if (mode === "create") {
                res = await createCategory(payload).unwrap();

                if (res.statusCode === 201) {
                    toast.success(res.message || "Category created");
                } else {
                    toast.error(res.message || "Failed to create category");
                    return;
                }
            }

            if (mode === "edit" && categoryToEdit) {
                res = await updateCategory({
                    id: categoryToEdit._id,
                    data: payload,
                }).unwrap();

                if (res.statusCode === 200) {
                    toast.success(res.message || "Category updated");
                } else {
                    toast.error(res.message || "Failed to update category");
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

    // Filter potential parents (exclude the current category being edited)
    const eligibleParents = topCategories.filter(
        (c: TCategory) => !c.parent_category_id && (!categoryToEdit || c._id !== categoryToEdit._id)
    );

    // Provide a trigger for create mode if triggerLabel provided
    const trigger = triggerLabel ? (
        <DialogTrigger asChild>
            <Button
                variant={triggerVariant}
                size={triggerSize}
                onClick={() => setInternalOpen(true)}
            >
                {triggerLabel}
            </Button>
        </DialogTrigger>
    ) : null;

    return (
        <Dialog open={internalOpen} onOpenChange={(val) => {
            if (onOpenChange) onOpenChange(val);
            setInternalOpen(val);
        }}>
            {trigger}
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create"
                            ? defaultParentId
                                ? "Create Subcategory"
                                : "Create Category"
                            : `Edit Category: ${categoryToEdit?.name || ""}`}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div>
                        <Label htmlFor="cat-name">
                            Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="cat-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={parentId && parentId !== "none" ? "e.g. STEM Toys" : "e.g. Toys & Games"}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="cat-desc">Description</Label>
                        <Textarea
                            id="cat-desc"
                            value={description || ""}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description"
                        />
                    </div>

                    {/* 🌟 Parent Category Selector to create subcategories */}
                    <div>
                        <Label htmlFor="cat-parent">Parent Category (Optional)</Label>
                        <Select
                            value={parentId || "none"}
                            onValueChange={(val) => setParentId(val === "none" ? null : val)}
                        >
                            <SelectTrigger id="cat-parent" className="mt-1 bg-white">
                                <SelectValue placeholder="None (Create as Main Parent Category)" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="none">
                                    📁 None (Create as Main Primary Category)
                                </SelectItem>
                                {eligibleParents?.map((c: TCategory) => (
                                    <SelectItem key={c._id} value={c._id}>
                                        ↳ Subcategory under: {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Select a parent category if you want to make this a Subcategory.
                        </p>
                    </div>

                    {/* 🌟 Display Order, Storefront Visibility & Navbar Visibility */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div>
                            <Label htmlFor="cat-order" className="text-xs font-semibold text-slate-700">
                                Display Order
                            </Label>
                            <Input
                                id="cat-order"
                                type="number"
                                min={0}
                                step={1}
                                className="mt-1 bg-white"
                                value={order}
                                onChange={(e) => setOrder(e.target.value)}
                                placeholder="Auto (e.g. 1)"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                                Priority on store.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="cat-active" className="text-xs font-semibold text-slate-700">
                                Storefront Visibility
                            </Label>
                            <div className="flex items-center justify-between mt-1 h-9 px-3 bg-white border border-input rounded-md">
                                <span className="text-xs font-medium text-slate-700">
                                    {isActive ? "Active" : "Hidden"}
                                </span>
                                <Switch
                                    id="cat-active"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Entire store visibility.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="cat-navbar" className="text-xs font-semibold text-slate-700">
                                Navbar Visibility
                            </Label>
                            <div className="flex items-center justify-between mt-1 h-9 px-3 bg-white border border-input rounded-md">
                                <span className="text-xs font-medium text-slate-700">
                                    {showInNavbar ? "Visible" : "Hidden"}
                                </span>
                                <Switch
                                    id="cat-navbar"
                                    checked={showInNavbar}
                                    onCheckedChange={setShowInNavbar}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Show in top navbar.
                            </p>
                        </div>
                    </div>

                    {/* 🌟 Thumbnail / Icon Image */}
                    <div className="flex flex-col gap-2 p-3 bg-slate-50/70 border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-slate-700">
                                Thumbnail Image (Icon)
                            </Label>
                            {selectedImage && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setSelectedImage(null)}
                                >
                                    <X className="w-3 h-3 mr-1" /> Remove
                                </Button>
                            )}
                        </div>
                        <MediaLibrary
                            onSelect={handleSelectImage}
                            multiple={false}
                            maxFiles={1}
                            title="Select Thumbnail Image"
                        />
                        {selectedImage && (
                            <div className="mt-2 flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                                <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 shrink-0">
                                    <img
                                        src={selectedImage.url}
                                        alt={selectedImage.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-xs text-slate-600 min-w-0 flex-1">
                                    <div className="font-semibold truncate text-slate-800">
                                        {selectedImage.title || "Thumbnail"}
                                    </div>
                                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                        {selectedImage.url}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 🌟 Storefront Banner Image */}
                    <div className="flex flex-col gap-2 p-3 bg-slate-50/70 border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-slate-700">
                                Category Banner Image (Home Page)
                            </Label>
                            {selectedBanner && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setSelectedBanner(null)}
                                >
                                    <X className="w-3 h-3 mr-1" /> Remove
                                </Button>
                            )}
                        </div>
                        <MediaLibrary
                            onSelect={handleSelectBanner}
                            multiple={false}
                            maxFiles={1}
                            title="Select Banner Image"
                        />
                        {selectedBanner && (
                            <div className="mt-2 relative w-full h-32 rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                                <img
                                    src={selectedBanner.url}
                                    alt="Category Banner Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                            This banner is shown alongside products on the Home Page category section.
                        </p>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="submit" disabled={mode === "create" ? creating : updating}>
                            {mode === "create" ? (creating ? "Creating..." : "Create Category") : (updating ? "Saving..." : "Save changes")}
                        </Button>
                        <Button variant="outline" type="button" onClick={closeDialog}>Cancel</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

