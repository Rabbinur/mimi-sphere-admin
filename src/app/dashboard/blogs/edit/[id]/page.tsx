"use client"

import { useBlogByIdQuery, useUpdateBlogMutation } from "@/components/Redux/RTK/blogApi";
import { useAllBlogCategoriesQuery, useCreateBlogCategoryMutation } from "@/components/Redux/RTK/blogCategoryApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MediaFile, MediaLibrary } from "@/components/ui/media-manager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { blogResolver, type BlogFormValues } from "@/lib/validators/blogSchema";
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@tinymce/tinymce-react").then(mod => mod.Editor), { ssr: false });

import { ArrowLeft, ChevronRight, Loader2, Plus, Save, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditBlogPage() {
    const router = useRouter();
    const { id } = useParams();

    const { data: blogData, isLoading: isFetching } = useBlogByIdQuery(id as string);
    const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
    const { data: categoriesData } = useAllBlogCategoriesQuery();
    const [createCategory, { isLoading: isCreatingCat }] = useCreateBlogCategoryMutation();

    const [newCatName, setNewCatName] = useState("");
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);

    const form = useForm<BlogFormValues>({
        resolver: blogResolver,
        defaultValues: {
            title: "",
            slug: "",
            content: "",
            author: "Admin",
            category: "General",
            isPublished: true,
            thumbnail: "",
        },
    });

    useEffect(() => {
        if (blogData?.data) {
            const blog = blogData.data;
            form.reset({
                title: blog.title || "",
                slug: blog.slug || "",
                content: blog.content || "",
                author: blog.author || "Admin",
                category: blog.category || "General",
                isPublished: blog.isPublished ?? true,
                thumbnail: blog.thumbnail || "",
            });
        }
    }, [blogData, form]);

    const handleCreateCategory = async () => {
        if (!newCatName) return;
        try {
            const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            await createCategory({ name: newCatName, slug }).unwrap();
            toast.success("Category created");
            setNewCatName("");
            setIsCatModalOpen(false);
        } catch (err) {
            toast.error("Failed to create category");
        }
    };

    const blogCategories = categoriesData?.data || [];

    const onSubmit = async (data: BlogFormValues) => {
        try {
            await updateBlog({ id: id as string, data }).unwrap();
            toast.success("Blog updated successfully");
            router.push("/dashboard/blogs");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update blog");
        }
    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-lg text-gray-600">Loading Blog Data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen  bg-white">
            <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/blogs" className="rounded-md p-1 hover:bg-muted transition">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Blogs</span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="font-medium text-foreground">Edit blog</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto mt-8 px-4 lg:px-8 pb-20">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Enter blog title" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Slug</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="url-friendly-slug" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Content</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Editor
                                                        apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY}
                                                        value={field.value}
                                                        init={{
                                                            height: 500,
                                                            menubar: false,
                                                            plugins: [
                                                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                                            ],
                                                            toolbar: 'undo redo | blocks | ' +
                                                                'bold italic forecolor | alignleft aligncenter ' +
                                                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                                                'removeformat | help',
                                                        }}
                                                        onEditorChange={(content) => field.onChange(content)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="author"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Author</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Category</FormLabel>
                                                    <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button type="button" variant="link" size="sm" className="h-8 px-0 text-xs">
                                                                <Plus className="h-3 w-3 mr-1" /> Add New
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Create New Category</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="py-4">
                                                                <Input
                                                                    placeholder="Category name"
                                                                    value={newCatName}
                                                                    onChange={(e) => setNewCatName(e.target.value)}
                                                                />
                                                            </div>
                                                            <DialogFooter>
                                                                <Button
                                                                    type="button"
                                                                    onClick={handleCreateCategory}
                                                                    disabled={isCreatingCat}
                                                                >
                                                                    {isCreatingCat ? "Saving..." : "Create Category"}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {blogCategories.map((cat: any) => (
                                                            <SelectItem key={cat._id} value={cat.name}>
                                                                {cat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="thumbnail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Thumbnail</FormLabel>
                                                <div className="space-y-4">
                                                    {field.value && (
                                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                                            <Image
                                                                src={field.value}
                                                                alt="Thumbnail preview"
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                className="absolute top-2 right-2 h-8 w-8"
                                                                onClick={() => field.onChange("")}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <FormControl>
                                                        <MediaLibrary
                                                            onSelect={(files: MediaFile[]) => {
                                                                if (files.length > 0) {
                                                                    field.onChange(files[0].url);
                                                                }
                                                            }}
                                                            multiple={false}
                                                            title="Select Thumbnail"
                                                        />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isPublished"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Publish Status</FormLabel>
                                                    <div className="text-xs text-muted-foreground">Visible to public</div>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isUpdating}>
                                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Update Blog
                                    </Button>
                                    <Button type="button" variant="outline" className="w-full" asChild>
                                        <Link href="/dashboard/blogs">Discard</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
