"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";

import {
    Calendar,
    Check,
    CheckSquare,
    ChevronDown,
    Grid,
    HardDrive,
    ImageIcon,
    Link,
    List,
    Loader2,
    Play,
    Plus,
    Search,
    Trash,
    Upload,
    X,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useDebounce } from "../hooks/useDebounce";


import { useDeleteMultipleFilesMutation, useGetAllFilesQuery, useUploadFileFromUrlMutation, useUploadFilesMutation } from "../Redux/RTK/fileApi";
import { FilePagination } from "./file-paggination";

export interface MediaFile {
    _id: string;
    url: string;
    key: string;
    size: number;
    mimetype: string;
    title: string;
    createdAt: string; // ISO date string
    updatedAt: string;
}

export interface MediaLibraryProps {
    onSelect: (files: MediaFile[]) => void;
    apiKey?: string;
    apiUrl?: string;
    multiple?: boolean;
    maxFiles?: number;
    acceptedTypes?: string[];
    title?: string;
    triggerLabel?: string;
}

export interface MediaLibraryConfig {
    apiKey: string;
    apiUrl?: string;
}

export function MediaLibrary({
    onSelect,
    multiple = true,
    maxFiles = 10,
    acceptedTypes = ["image/*"],
    title = "Media Library",
}: MediaLibraryProps) {
    const PAGE_LIMIT = 30;
    const [page, setPage] = useState(1);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
    const [showUrlUpload, setShowUrlUpload] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadFiles, { isLoading }] = useUploadFilesMutation();
    const [uploadFileFromUrl, { isLoading: uploadingFromUrl, error }] =
        useUploadFileFromUrlMutation();
    const {
        data,
        isLoading: loadingFiles,
        isFetching,
    } = useGetAllFilesQuery({
        page,
        limit: PAGE_LIMIT,
        search: debouncedSearch,
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteMultipleFiles, { isLoading: deleting }] =
        useDeleteMultipleFilesMutation();

    const allFiles: MediaFile[] = data?.data || [];
    const totalPages = data?.pagination?.totalPages || 0;
    const totalFiles = data?.pagination?.totalItems || 0;

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedFiles(new Set());
            setSearchQuery("");
            setPreviewFile(null);
            setShowUrlUpload(false);
            setUrlInput("");
        }
    }, [isOpen]);

    const filteredFiles = allFiles;

    const selectedFileObjects = allFiles.filter((file) =>
        selectedFiles.has(file._id)
    );

    // Handle file selection
    const handleFileSelect = (fileId: string) => {
        const newSelected = new Set(selectedFiles);
        const file = allFiles.find((f) => f._id === fileId);

        if (newSelected.has(fileId)) {
            newSelected.delete(fileId);
            if (previewFile?._id === fileId) {
                setPreviewFile(
                    newSelected.size > 0
                        ? allFiles.find((f) => newSelected.has(f._id)) || null
                        : null
                );
            }
        } else {
            if (!multiple) {
                newSelected.clear();
            }
            if (newSelected.size < maxFiles) {
                newSelected.add(fileId);
                if (file) {
                    setPreviewFile(file);
                }
            } else {
                toast.warning(`You can only select up to ${maxFiles} files`);
                return;
            }
        }
        setSelectedFiles(newSelected);
    };

    // FIX: Add new files to the mediaFiles state after a successful upload
    const handleFileUpload = async (files: FileList) => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }
        try {
            const result = await uploadFiles(formData).unwrap();

            toast.success("Files uploaded successfully!");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload files.");
        }
    };

    // Handle URL upload
    const handleUrlUpload = async () => {
        if (!urlInput.trim()) {
            toast.error("Please enter a valid URL");
            return;
        }
        try {
            const response = await uploadFileFromUrl({ fileUrl: urlInput }).unwrap();
            console.log("Uploaded file data:", response);
            toast.success("File added from URL successfully");
        } catch (error) {
            toast.error("Invalid URL provided");
        } finally {
        }
    };

    // inside the MediaLibrary component
    const handleDeleteAction = () => {
        // Check if any files are selected
        if (selectedFiles.size === 0) {
            toast.warning("Please select at least one file to delete.");
            return;
        }
        // Open the confirmation dialog instead of deleting immediately
        setShowDeleteConfirm(true);
    };

    // inside the MediaLibrary component
    const confirmDelete = async () => {
        const idsToDelete = Array.from(selectedFiles);

        try {
            const res = await deleteMultipleFiles(idsToDelete).unwrap();
            if (res?.success) {
                toast.success(
                    res.message || `${res.count} files deleted successfully.`
                );
            } else {
                toast.error(res?.message || "Some files could not be deleted.");
            }
        } catch (error: any) {
            console.error("Failed to delete files:", error);
            const errorMessage =
                error?.data?.message ||
                error?.message ||
                "Failed to delete selected files.";
            toast.error(errorMessage);
        } finally {
            // Crucially, close the confirmation dialog
            setShowDeleteConfirm(false);
        }
    };

    // Handle selection confirmation
    const handleConfirmSelection = () => {
        onSelect(selectedFileObjects);
        setIsOpen(false);
    };

    // Clear all selections
    const clearSelection = () => {
        setSelectedFiles(new Set());
        setPreviewFile(null);
    };

    // Select all files
    const selectAll = () => {
        const filesToSelect = filteredFiles.slice(0, maxFiles);
        const newSelected = new Set(filesToSelect.map((file) => file._id));
        setSelectedFiles(newSelected);
        if (filesToSelect.length > 0) {
            setPreviewFile(filesToSelect[0]);
        }
    };

    // Remove file from selection
    const removeFromSelection = (fileId: string) => {
        const newSelected = new Set(selectedFiles);
        newSelected.delete(fileId);
        setSelectedFiles(newSelected);

        if (previewFile?._id === fileId) {
            const remainingFiles = selectedFileObjects.filter(
                (f) => f._id !== fileId
            );
            setPreviewFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "Unknown size";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
        );
    };

    const MediaFileComponent = ({ file }: { file: MediaFile }) => {
        const isSelected = selectedFiles.has(file._id);

        return (
            <div
                className={`group cursor-pointer relative ${isSelected ? "ring-2 ring-blue-500" : ""
                    }`}
                onClick={() => handleFileSelect(file._id)}
            >
                <Card className="overflow-hidden shadow-sm rounded-none hover:shadow-md transition-all duration-200">
                    <CardContent className="p-0">
                        <div className="aspect-square relative bg-gray-100">
                            <Image
                                width={300}
                                height={300}
                                src={file.url || file.url}
                                alt={file.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src =
                                        "/placeholder.svg?height=200&width=200&text=Image";
                                }}
                            />
                            {/* Selection overlay */}
                            <div
                                className={`absolute inset-0 bg-blue-500 bg-opacity-20 ${isSelected ? "opacity-100" : "opacity-0"
                                    } transition-opacity`}
                            />
                            {/* Selection checkbox */}
                            <div className="absolute top-2 left-2">
                                <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                        ? "bg-blue-500 border-blue-500 text-white"
                                        : "bg-white border-gray-300 group-hover:border-blue-400"
                                        }`}
                                >
                                    {isSelected && <Check className="w-4 h-4" />}
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <p className="text-xs font-medium truncate" title={file.title}>
                                {file.title}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const PreviewPanel = () => {
        if (selectedFiles.size === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-2 md:p-4 2xl:p-6">
                    <ImageIcon className="w-16 h-16 mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No files selected</h3>
                    <p className="text-sm text-center">
                        Select files from the library to preview them here
                    </p>
                </div>
            );
        }

        if (!multiple && selectedFileObjects.length === 1) {
            const file = selectedFileObjects[0];
            return (
                <div className="h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg mb-4">
                        <Image
                            width={300}
                            height={300}
                            src={file.url || file.url}
                            alt={file.title}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    </div>
                    <div className="space-y-3">
                        <div>
                            <h3 className="font-medium text-sm mb-2">File Details</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Name:</span>
                                    <span className="truncate" title={file.title}>
                                        {file.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Size:</span>
                                    <span>{formatFileSize(file.size)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Uploaded:</span>
                                    {/* FIX: Convert string to Date object */}
                                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-sm">
                        Selected Files ({selectedFiles.size})
                    </h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        className="text-xs bg-transparent"
                    >
                        Clear All
                    </Button>
                </div>

                <div className="space-y-2 pr-2">
                    {selectedFileObjects.map((file) => (
                        <div
                            key={file._id}
                            className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-md border overflow-hidden bg-white flex-shrink-0">
                                <Image
                                    width={300}
                                    height={300}
                                    src={file.url || file.url}
                                    alt={file.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate" title={file.title}>
                                    {file.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(file.size)}
                                </p>
                            </div>
                            <Button

                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromSelection(file._id)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <Button type="button"
                variant="outline"
                className="relative cursor-pointer border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    e.stopPropagation(); // Stop event bubbling
                    setIsOpen(true);
                }}
            >
                <span className="pointer-events-none flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M4 12l1.5-2.5a2 2 0 011.75-1H9v-1a2 2 0 012-2h2a2 2 0 012 2v1h1.75a2 2 0 011.75 1L20 12M12 11v6"
                        />
                    </svg>
                    {title || "ফাইল নির্বাচন করুন"}
                </span>
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="md:max-w-[60vw] w-full max-h-[95vh] flex flex-col p-2 md:p-4 2xl:p-6  rounded-sm md:rounded-md bg-white">
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple={multiple}
                        accept={acceptedTypes.join(",")}
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                    />

                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            {title}
                            <Badge className=" text-white" variant="secondary">
                                {totalFiles} files
                            </Badge>
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Browse, upload, and manage your media files for your application.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg bg-gray-50 flex-shrink-0 sm:gap-3 sm:p-3">
                        {/* Upload Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-sm px-3 py-1.5"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4 mr-2" />
                                    )}
                                    Upload
                                    <ChevronDown className="w-4 h-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Choose Files
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowUrlUpload(true)}>
                                    <Link className="w-4 h-4 mr-2" />
                                    Upload from URL
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Selected Files Actions */}
                        {selectedFiles.size > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button 
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-sm px-3 py-1.5"
                                    onClick={clearSelection}
                                >
                                    <Trash className="w-4 h-4 mr-2" />
                                    Clear
                                </Button>
                                {multiple && (
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-sm px-3 py-1.5"
                                        onClick={selectAll}
                                    >
                                        <CheckSquare className="w-4 h-4 mr-2" />
                                        Select All
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Spacer to push search + view toggle to the right */}
                        <div className="flex-1 min-w-[100%] sm:min-w-0" />

                        {/* Right-side controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                            {/* Search Input */}
                            <div className="relative w-full sm:w-auto">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-3 py-1.5 w-full sm:w-48 text-sm"
                                />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="border flex flex-wrap gap-2 items-center justify-end overflow-hidden rounded-md ">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                    className="rounded-none px-3 py-1.5 text-sm"
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button 
                                    type="button"
                                    variant={viewMode === "list" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                    className="rounded-none px-3 py-1.5 text-sm"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            type="button"
                                            size="sm"
                                            className="rounded-none px-3 py-1.5 text-sm"
                                            disabled={selectedFiles.size === 0}
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            Action
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Take action</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleDeleteAction}
                                            disabled={selectedFiles.size === 0 || deleting}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            {deleting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash className="w-4 h-4 mr-2" />
                                                    Delete
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Action Button */}
                        </div>
                    </div>

                    {/* URL Upload Section */}
                    {showUrlUpload && (
                        <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 flex-shrink-0">
                            <div className="flex items-center gap-2 mb-2">
                                <Link className="w-4 h-4 text-blue-600" />
                                <h3 className="font-medium text-sm text-blue-900">
                                    Upload from URL
                                </h3>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter image URL..."
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    className="flex-1"
                                    onKeyPress={(e) => e.key === "Enter" && handleUrlUpload()}
                                />
                                <Button 
                                    type="button"
                                    disabled={uploadingFromUrl} 
                                    onClick={handleUrlUpload} 
                                    size="sm"
                                >
                                    {uploadingFromUrl ? 'Loading' : 'Add'}
                                </Button>
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowUrlUpload(false);
                                        setUrlInput("");
                                    }}
                                    size="sm"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Content Area with Proper Scrolling */}
                    <div className="flex-1 min-h-0 flex flex-col xl:flex-row gap-4 overflow-hidden">
                        {/* Media Files Section */}
                        <div className="flex-1 overflow-y-auto">
                            {loadingFiles || isFetching ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                                </div>
                            ) : allFiles?.length === 0 ? (
                                <div className="text-center py-12">
                                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No files uploaded
                                    </h3>
                                    <p className="text-gray-500 mb-4">
                                        Upload your first file to get started
                                    </p>
                                    <Button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Files
                                    </Button>
                                </div>
                            ) : viewMode === "grid" ? (
                                <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                                    {filteredFiles.map((file) => (
                                        <MediaFileComponent key={file._id} file={file} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredFiles.map((file) => (
                                        <div
                                            key={file._id}
                                            className={`flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border ${selectedFiles.has(file._id)
                                                ? "bg-blue-50 border-blue-200"
                                                : "border-gray-200"
                                                }`}
                                            onClick={() => handleFileSelect(file._id)}
                                        >
                                            <div className="w-16 h-16 rounded-md border overflow-hidden bg-gray-100 flex-shrink-0">
                                                <Image
                                                    width={300}
                                                    height={300}
                                                    src={file.url || file.url}
                                                    alt={file.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className=" text-xs md:text-sm font-medium truncate mb-1">
                                                    {file.title}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>{formatFileSize(file.size)}</span>
                                                    {/* FIX: Convert string to Date object */}
                                                    <span>
                                                        {new Date(file.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <div>
                                                        {file.url.startsWith("http") &&
                                                            !file.url.startsWith("blob:") ? (
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-purple-100 text-purple-800 text-xs"
                                                            >
                                                                URL
                                                            </Badge>
                                                        ) : file.url.startsWith("blob:") ? (
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-yellow-100 text-yellow-800 text-xs"
                                                            >
                                                                Local
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-green-100 text-green-800 text-xs"
                                                            >
                                                                Uploaded
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedFiles.has(file._id)
                                                        ? "bg-blue-500 border-blue-500 text-white"
                                                        : "bg-white border-gray-300"
                                                        }`}
                                                >
                                                    {selectedFiles.has(file._id) && (
                                                        <Check className="w-4 h-4" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {allFiles?.length > 0 && (
                                <FilePagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}

                            {/* Preview Panel */}
                        </div>
                        <div className="xl:w-80 border-l bg-gray-50/50 flex flex-col overflow-hidden">
                            <div className=" p-2 md:p-4 h-full overflow-y-auto">
                                <PreviewPanel />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex items-center justify-between flex-shrink-0">
                        <div className=" hidden md:block text-sm text-gray-500">
                            {selectedFiles.size > 0 && (
                                <span>
                                    {selectedFiles.size} of {maxFiles} files selected
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                type="button"
                                onClick={handleConfirmSelection}
                                disabled={selectedFiles.size === 0}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Select Files ({selectedFiles.size})
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">{selectedFiles.size}</span>{" "}
                            selected files? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button 
                            type="button"
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// Hook for easier usage
export function useMediaLibrary() {
    const [isOpen, setIsOpen] = useState(false);

    const openMediaLibrary = () => setIsOpen(true);
    const closeMediaLibrary = () => setIsOpen(false);

    return {
        isOpen,
        openMediaLibrary,
        closeMediaLibrary,
    };
}
