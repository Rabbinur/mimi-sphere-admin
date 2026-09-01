"use client";

import {
  useAllUsersQuery,
  useCreateUserByAdminMutation,
  useDeleteUserByAdminMutation,
  useUpdateUserByAdminMutation,
} from "@/components/Redux/RTK/authApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit2,
  Plus,
  Shield,
  ShieldAlert,
  Trash2,
  User as UserIcon
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CustomersPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAllUsersQuery({ page });
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserByAdminMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserByAdminMutation();
  const [createUser, { isLoading: isCreating }] = useCreateUserByAdminMutation();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    role: "CUSTOMER",
    isVerified: false,
  });

  const [createData, setCreateData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
  });

  const users = data?.data?.data || [];
  const meta = data?.data?.meta;
  const pagination = meta
    ? {
        currentPage: meta.page,
        totalPages: Math.ceil(meta.total / meta.limit),
        totalItems: meta.total,
      }
    : null;

  const handleCreate = async () => {
    try {
      if (!createData.name || !createData.email || !createData.password) {
        toast.error("Please fill in all required fields");
        return;
      }
      await createUser(createData).unwrap();
      toast.success("Customer created successfully");
      setIsCreateModalOpen(false);
      setCreateData({ name: "", email: "", phone: "", password: "", role: "CUSTOMER" });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create customer");
    }
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setEditData({
      name: user.name || "",
      phone: user.phone || "",
      role: user.role,
      isVerified: user.isVerified,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await updateUser({
        id: selectedUser._id,
        data: editData,
      }).unwrap();
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(selectedUser._id).unwrap();
      toast.success("User deleted successfully");
      setIsDeleteConfirmOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete user");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Fetching customers...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen">
      <div className="">
        <header className="mb-8 border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Customer Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage user roles, verification status, and account access.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="bg-white px-4 py-1.5 text-xs font-bold shrink-0 shadow-sm border-slate-200 uppercase tracking-wider">
              {pagination?.totalItems || users.length} Users
            </Badge>
          </div>
        </header>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto mt-4">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="pl-6 uppercase text-[10px] font-bold text-slate-400">
                  User Info
                </TableHead>
                <TableHead className="uppercase text-[10px] font-bold text-slate-400">
                  Contact
                </TableHead>
                <TableHead className="uppercase text-[10px] font-bold text-slate-400">
                  Role
                </TableHead>
                <TableHead className="uppercase text-[10px] font-bold text-slate-400">
                  Status
                </TableHead>
                <TableHead className="uppercase text-[10px] font-bold text-slate-400">
                  Joined
                </TableHead>
                <TableHead className="text-right pr-6 uppercase text-[10px] font-bold text-slate-400">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-40 text-center text-slate-400"
                  >
                    No customers found in the system.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any) => (
                  <TableRow key={user._id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border shrink-0 overflow-hidden">
                          {user.photo ? (
                            <img src={user.photo} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <UserIcon size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {user.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {user._id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-slate-600">
                        {user.email}
                      </p>
                      <p className="text-xs text-slate-400">
                        {user.phone || "No phone"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.role === "ADMIN" ? (
                          <Shield size={14} className="text-indigo-600" />
                        ) : (
                          <UserIcon size={14} className="text-slate-400" />
                        )}
                        <span
                          className={`text-xs font-bold ${user.role === "ADMIN"
                            ? "text-indigo-600"
                            : "text-slate-600"
                            }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isVerified ? (
                        <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-100 text-[10px] font-bold">
                          VERIFIED
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-100 text-[10px] font-bold">
                          PENDING
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                          onClick={() => handleEditClick(user)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="bg-white"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1 mx-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Page
              </span>
              <span className="text-sm font-black text-slate-900">
                {pagination.currentPage || page}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                of {pagination.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="bg-white"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md bg-white p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-emerald-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Plus size={20} /> Create New Customer
              </DialogTitle>
              <DialogDescription className="text-emerald-100">
                Setup a new user account with pre-verified status.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Full Name *
              </Label>
              <Input
                placeholder="John Doe"
                value={createData.name}
                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                className="h-10 border-slate-200"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Email Address *
              </Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={createData.email}
                onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                className="h-10 border-slate-200"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Phone Number
              </Label>
              <Input
                placeholder="017XXXXXXXX"
                value={createData.phone}
                onChange={(e) => setCreateData({ ...createData, phone: e.target.value })}
                className="h-10 border-slate-200"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Initial Password *
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={createData.password}
                onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                className="h-10 border-slate-200"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Assign Role
              </Label>
              <Select
                value={createData.role}
                onValueChange={(v) => setCreateData({ ...createData, role: v })}
              >
                <SelectTrigger className="h-10 border-slate-200">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-xl border-slate-100">
                  <SelectItem value="CUSTOMER">Standard Customer</SelectItem>
                  {/* <SelectItem value="ADMIN">Administrator</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="border-none bg-transparent hover:bg-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
            >
              {isCreating ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-white p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-indigo-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Edit2 size={20} /> Edit User Details
              </DialogTitle>
              <DialogDescription className="text-indigo-100">
                Update account details, role and verification status for{" "}
                <span className="font-bold text-white">
                  {selectedUser?.name}
                </span>
                .
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Full Name
              </Label>
              <Input
                placeholder="Name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="h-10 border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Phone Number
              </Label>
              <Input
                placeholder="Phone"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="h-10 border-slate-200"
              />
            </div>

            {/* <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                System Role
              </Label>
              <Select
                value={editData.role}
                onValueChange={(v) => setEditData({ ...editData, role: v })}
              >
                <SelectTrigger className="h-10 border-slate-200">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-xl border-slate-100">
                  <SelectItem value="CUSTOMER">Standard Customer</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Verification Status
              </Label>
              <Select
                value={editData.isVerified ? "true" : "false"}
                onValueChange={(v) =>
                  setEditData({ ...editData, isVerified: v === "true" })
                }
              >
                <SelectTrigger className="h-10 border-slate-200">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-xl border-slate-100">
                  <SelectItem value="true">Verified Account</SelectItem>
                  <SelectItem value="false">Pending Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-none bg-transparent hover:bg-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <DialogContent className="max-w-sm bg-white p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <ShieldAlert size={32} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="mt-2">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-slate-800">{selectedUser?.name}</span>'s
                account? This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 mt-8">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="w-full"
            >
              No, keep it
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full font-bold text-white bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Yes, delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersPage;
