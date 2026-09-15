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
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState } from "react";

// RTK hooks (adjust paths if needed)
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
    isActive?: boolean;
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
            if (categoryToEdit.imageUrl) {
                setSelectedImage({ // build a minimal MediaFile-like object to preview
                    _id: "existing-" + categoryToEdit._id,
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
        } else if (mode === "create") {
            // reset on open
            setName("");
            setDescription(undefined);
            setParentId(defaultParentId || null);
            setSelectedImage(null);
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


    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        const payload: any = {
            name: name.trim(),
            description: description?.trim() || undefined,
            parent_category_id: parentId && parentId !== "none" ? parentId : null,
            imageUrl: selectedImage?.url || undefined,
        };

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

    // Render a small image preview
    const ImagePreview = () =>
        selectedImage ? (
            <div className="mt-3 flex items-center gap-3">
                <div className="w-20 h-20 rounded-lg overflow-hidden shadow-sm">
                    <img src={selectedImage.url} alt={selectedImage.title} className="w-full h-full object-cover" />
                </div>
                <div className="text-sm text-gray-700">
                    <div className="font-medium truncate max-w-[200px]">{selectedImage.title}</div>
                    <div className="text-xs text-muted-foreground">{(selectedImage.size / 1024).toFixed(1)} KB</div>
                </div>
            </div>
        ) : null;

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
            <DialogContent className="sm:max-w-[520px] bg-white">
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

                    <div className="flex flex-col gap-2">
                        <Label>Thumbnail / Image</Label>
                        <div>
                            <MediaLibrary
                                onSelect={handleSelectImage}
                                multiple={false}
                                maxFiles={1}
                                title="category-thumbnail"
                            />
                        </div>
                        <ImagePreview />
                    </div>

                    <DialogFooter className="pt-4">
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
