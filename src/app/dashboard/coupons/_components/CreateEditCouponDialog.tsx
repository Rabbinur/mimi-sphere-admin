"use client";

import { useCreateCouponMutation, useUpdateCouponMutation } from "@/components/Redux/RTK/couponApi";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface TCoupon {
    _id?: string;
    code: string;
    discount_type: "percentage" | "fixedAmount";
    discount_value: number;
    max_discount_amount: number | null;
    start_date: string;
    end_date: string;
    usage_limit: number | null;
    minimum_order_amount: number | null;
    is_active: boolean;
}

interface Props {
    mode: "create" | "edit";
    triggerLabel?: string;
    couponToEdit?: TCoupon | null;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function CreateEditCouponDialog({
    mode,
    triggerLabel,
    couponToEdit,
    onSuccess,
    open,
    onOpenChange,
}: Props) {
    const [localOpen, setLocalOpen] = useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : localOpen;
    const setOpen = isControlled ? onOpenChange : setLocalOpen;

    const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
    const [updateCoupon, { isLoading: updating }] = useUpdateCouponMutation();

    const { register, handleSubmit, reset, setValue, watch } = useForm<TCoupon>({
        defaultValues: {
            discount_type: "percentage",
            is_active: true,
            usage_limit: null,
            minimum_order_amount: null,
            max_discount_amount: null,
        },
    });

    useEffect(() => {
        if (mode === "edit" && couponToEdit) {
            reset({
                ...couponToEdit,
                start_date: couponToEdit.start_date ? new Date(couponToEdit.start_date).toISOString().split('T')[0] : "",
                end_date: couponToEdit.end_date ? new Date(couponToEdit.end_date).toISOString().split('T')[0] : "",
            });
        } else {
            reset({
                code: "",
                discount_type: "percentage",
                discount_value: 0,
                start_date: new Date().toISOString().split('T')[0],
                end_date: "",
                usage_limit: null,
                minimum_order_amount: null,
                max_discount_amount: null,
                is_active: true,
            });
        }
    }, [mode, couponToEdit, reset]);

    const onSubmit = async (data: TCoupon) => {
        try {
            if (mode === "create") {
                await createCoupon(data).unwrap();
                toast.success("Coupon created successfully");
            } else {
                const { _id, createdAt, updatedAt, __v, ...cleanData } = data as any;
                await updateCoupon({ id: couponToEdit?._id, ...cleanData }).unwrap();
                toast.success("Coupon updated successfully");
            }
            setOpen?.(false);
            onSuccess?.();
            reset();
        } catch (error: any) {
            toast.error(error?.data?.message || "Something went wrong");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button variant="default">{triggerLabel}</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Add New Coupon" : "Edit Coupon"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Coupon Code</Label>
                            <Input
                                {...register("code", { required: true })}
                                placeholder="E.g. SUMMER20"
                                className="uppercase"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Discount Type</Label>
                            <Select
                                onValueChange={(v: any) => setValue("discount_type", v)}
                                value={watch("discount_type")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className=" bg-white">
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    <SelectItem value="fixedAmount">Fixed Amount (৳)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Discount Value</Label>
                            <Input
                                type="number"
                                {...register("discount_value", { required: true, valueAsNumber: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Min Order Amount</Label>
                            <Input
                                type="number"
                                {...register("minimum_order_amount", { valueAsNumber: true })}
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    {watch("discount_type") === "percentage" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Max Discount Amount (৳)</Label>
                                <Input
                                    type="number"
                                    {...register("max_discount_amount", { valueAsNumber: true })}
                                    placeholder="Optional cap"
                                />
                            </div>
                            <div className="invisible" />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="date" {...register("start_date", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input type="date" {...register("end_date", { required: true })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Usage Limit</Label>
                            <Input
                                type="number"
                                {...register("usage_limit", { valueAsNumber: true })}
                                placeholder="Total uses allowed"
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <Switch
                                id="active"
                                checked={watch("is_active")}
                                onCheckedChange={(v) => setValue("is_active", v)}
                            />
                            <Label htmlFor="active">Is Active</Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen?.(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={creating || updating}>
                            {creating || updating ? "Saving..." : mode === "create" ? "Create Coupon" : "Update Coupon"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
