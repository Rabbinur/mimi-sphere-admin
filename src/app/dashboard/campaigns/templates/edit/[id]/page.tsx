"use client";

import { useGetSingleTemplateQuery, useUpdateTemplateMutation } from "@/components/Redux/RTK/campaignApi";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@tinymce/tinymce-react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const templateSchema = z.object({
    name: z.string().min(3, "Template name must be at least 3 characters"),
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    content: z.string().min(20, "Content must be at least 20 characters"),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

const TemplateEditPage = () => {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    const { data: templateData, isLoading: isFetching } = useGetSingleTemplateQuery(id);
    const [updateTemplate, { isLoading: isUpdating }] = useUpdateTemplateMutation();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm<TemplateFormValues>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: "",
            subject: "",
            content: "",
        },
    });

    useEffect(() => {
        if (templateData?.data) {
            form.reset({
                name: templateData.data.name,
                subject: templateData.data.subject,
                content: templateData.data.content,
            });
        }
    }, [templateData, form]);

    const onSubmit = async (values: TemplateFormValues) => {
        try {
            await updateTemplate({ id, ...values }).unwrap();
            toast.success("Template updated successfully");
            router.push("/dashboard/campaigns/templates");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update template");
        }
    };

    if (!isMounted || isFetching) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    return (
        <div className="p-2 md:p-6 container mx-auto bg-white min-h-screen">
            <header className="mb-10 flex flex-col md:flex-row items-center gap-6 border-b pb-8">
                <div className="flex items-center gap-4 w-full">
                    <Link href="/dashboard/campaigns/templates" className="p-2.5 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div className="flex-grow">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Template</h1>
                        <p className="text-sm font-medium text-gray-500">Update your reusable email design</p>
                    </div>
                </div>
            </header>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-5xl space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Template Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Welcome Email" {...field} className="rounded-xl border-gray-200 h-11" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Default Subject Line</FormLabel>
                                    <FormControl>
                                        <Input placeholder="What the customer will see" {...field} className="rounded-xl border-gray-200 h-11" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold">Email Design (HTML)</FormLabel>
                                <FormControl>
                                    <div className="border rounded-2xl overflow-hidden border-gray-200 shadow-sm">
                                        <Editor
                                            apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY}
                                            value={field.value}
                                            onEditorChange={(content) => field.onChange(content)}
                                            init={{
                                                height: 600,
                                                menubar: true,
                                                plugins: [
                                                    "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
                                                    "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                                                    "insertdatetime", "media", "table", "help", "wordcount"
                                                ],
                                                toolbar:
                                                    "undo redo | blocks | " +
                                                    "bold italic forecolor | alignleft aligncenter " +
                                                    "alignright alignjustify | bullist numlist outdent indent | " +
                                                    "removeformat | help | image",
                                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                                branding: false,
                                            }}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="flex-grow md:flex-grow-0 md:min-w-[200px] h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20"
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Update Template
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.push("/dashboard/campaigns/templates")}
                            className="h-12 rounded-xl text-gray-500 font-bold"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default TemplateEditPage;
