"use client";

import {
    useCreateCampaignMutation,
    useCreateTemplateMutation,
    useGetRecipientPreviewQuery,
    useGetTemplatesQuery
} from "@/components/Redux/RTK/campaignApi";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, FileText, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Reusable Components
import { AudienceSelector } from "@/components/Pages/Dashboard/campaigns/AudienceSelector";
import { CampaignFormContent } from "@/components/Pages/Dashboard/campaigns/CampaignFormContent";
import { ManualEmailImporter } from "@/components/Pages/Dashboard/campaigns/ManualEmailImporter";
import { RecipientList } from "@/components/Pages/Dashboard/campaigns/RecipientList";

const campaignSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    content: z.string().min(20, "Content must be at least 20 characters"),
    target: z.array(z.enum(["all", "all_users", "newsletter_subscribers"])).default([]),
    manualEmails: z.array(z.string().email("Invalid email")).default([]),
    excludedEmails: z.array(z.string()).default([]),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

const CampaignCreatePage = () => {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [createCampaign, { isLoading }] = useCreateCampaignMutation();
    const [createTemplate, { isLoading: isSavingTemplate }] = useCreateTemplateMutation();

    const [manualEmailInput, setManualEmailInput] = useState("");
    const [showRecipients, setShowRecipients] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm<CampaignFormValues>({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            title: "",
            subject: "",
            content: "",
            target: [],
            manualEmails: [],
            excludedEmails: [],
        },
    });

    const selectedTargets = form.watch("target");
    const excludedEmails = form.watch("excludedEmails");
    const manualEmails = form.watch("manualEmails");

    const { data: recipientData, isFetching: isFetchingRecipients } = useGetRecipientPreviewQuery(selectedTargets.join(','));
    const { data: templatesData } = useGetTemplatesQuery(undefined);

    const recipients = recipientData?.data || [];
    const templates = templatesData?.data || [];

    // Memoized recipient list logic
    const { allEmails, filteredEmails, totalCount } = useMemo(() => {
        const merged = Array.from(new Set([...recipients, ...manualEmails]));
        const filtered = merged.filter(email => email.toLowerCase().includes(searchTerm.toLowerCase()));
        const count = merged.filter(e => !excludedEmails.includes(e)).length;
        return { allEmails: merged, filteredEmails: filtered, totalCount: count };
    }, [recipients, manualEmails, searchTerm, excludedEmails]);

    const onSubmit = async (values: CampaignFormValues) => {
        try {
            await createCampaign(values).unwrap();
            toast.success("Campaign created and saved as draft");
            router.push("/dashboard/campaigns");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to save campaign");
        }
    };

    const handleSaveAsTemplate = async () => {
        const { content, subject, title } = form.getValues();
        if (!content || !subject || !title) {
            toast.error("Please fill in Title, Subject, and Content first");
            return;
        }

        const templateName = window.prompt("Enter a name for this template:", title);
        if (!templateName) return;

        try {
            await createTemplate({ name: templateName, subject, content }).unwrap();
            toast.success("Template saved successfully");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to save template");
        }
    };

    const handleLoadTemplate = (templateId: string) => {
        const template = templates.find((t: any) => t._id === templateId);
        if (template) {
            form.setValue("subject", template.subject);
            form.setValue("content", template.content);
            toast.success(`Template "${template.name}" loaded`);
        }
    };

    if (!isMounted) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8  container mx-auto bg-white min-h-screen">
            <header className="mb-10 flex flex-col md:flex-row items-center gap-6 border-b pb-8">
                <div className="flex items-center gap-4 w-full">
                    <Link href="/dashboard/campaigns" className="p-2.5 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div className="flex-grow">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Campaign</h1>
                        <p className="text-sm font-medium text-gray-500">Design your email and segment your audience</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Select onValueChange={handleLoadTemplate}>
                        <SelectTrigger className="w-full md:w-[220px] rounded-xl bg-white border-gray-200 h-11">
                            <div className="flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-primary" />
                                <SelectValue placeholder="My Templates" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            {templates.map((t: any) => (
                                <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                            ))}
                            {templates.length === 0 && <p className="p-3 text-xs text-gray-400 italic">No saved templates</p>}
                        </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveAsTemplate}
                        disabled={isSavingTemplate}
                        className="rounded-xl h-11 px-5 border-gray-200 font-bold hover:bg-gray-50"
                    >
                        {isSavingTemplate ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 text-primary" />}
                        Save Template
                    </Button>
                </div>
            </header>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Column 1 & 2: Main Editor */}
                        <CampaignFormContent form={form} />

                        {/* Column 3: Settings & Audience */}
                        <div className="space-y-8">
                            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-8 shadow-sm">
                                <AudienceSelector
                                    form={form}
                                    isFetchingRecipients={isFetchingRecipients}
                                    recipientsCount={recipients.length}
                                />

                                <ManualEmailImporter
                                    form={form}
                                    manualEmailInput={manualEmailInput}
                                    setManualEmailInput={setManualEmailInput}
                                />

                                <RecipientList
                                    form={form}
                                    allEmails={allEmails}
                                    filteredEmails={filteredEmails}
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    showRecipients={showRecipients}
                                    setShowRecipients={setShowRecipients}
                                    totalCount={totalCount}
                                />
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.97]"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-3" /> Processing...</>
                                    ) : (
                                        <><Save className="w-5 h-5 mr-3" /> Save Draft Campaign</>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.push("/dashboard/campaigns")}
                                    className="w-full h-12 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors"
                                >
                                    Cancel & Discard
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default CampaignCreatePage;
