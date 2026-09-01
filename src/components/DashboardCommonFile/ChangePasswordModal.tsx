import { useChangePasswordMutation } from "@/components/Redux/RTK/authApi"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type TChangePasswordModal = {
    open: boolean
    onClose: () => void
}

export function ChangePasswordModal({ open, onClose }: TChangePasswordModal) {
    const [changePassword, { isLoading }] = useChangePasswordMutation()

    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const [show, setShow] = useState(false)

    const handleChange = (field: string, value: string) => {
        setForm((p) => ({ ...p, [field]: value }))
    }

    const handleSubmit = async () => {
        if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
            toast.error("All fields are required")
            return
        }

        if (form.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters")
            return
        }

        if (form.newPassword !== form.confirmPassword) {
            toast.error("New password and confirm password do not match")
            return
        }

        try {
            await changePassword({
                oldPassword: form.oldPassword,
                newPassword: form.newPassword,
            }).unwrap()

            toast.success("Password changed successfully 🔐")
            setForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
            onClose()
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to change password")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <Label>Current Password</Label>
                        <div className="relative">
                            <Input
                                type={show ? "text" : "password"}
                                value={form.oldPassword}
                                onChange={(e) =>
                                    handleChange("oldPassword", e.target.value)
                                }
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-2.5 text-muted-foreground"
                                onClick={() => setShow(!show)}
                            >
                                {show ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <Label>New Password</Label>
                        <div className="relative">
                            <Input
                                type={show ? "text" : "password"}
                                value={form.newPassword}
                                onChange={(e) =>
                                    handleChange("newPassword", e.target.value)
                                }
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-2.5 text-muted-foreground"
                                onClick={() => setShow(!show)}
                            >
                                {show ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label>Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                type={show ? "text" : "password"}
                                value={form.confirmPassword}
                                onChange={(e) =>
                                    handleChange("confirmPassword", e.target.value)
                                }
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-2.5 text-muted-foreground"
                                onClick={() => setShow(!show)}
                            >
                                {show ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? "Updating..." : "Change Password"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
