"use client";

import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

interface ManualEmailImporterProps {
  form: UseFormReturn<any>;
  manualEmailInput: string;
  setManualEmailInput: (val: string) => void;
}

export const ManualEmailImporter = ({ form, manualEmailInput, setManualEmailInput }: ManualEmailImporterProps) => {
  const handleAddManualEmail = () => {
    if (!manualEmailInput) return;

    // Regex to extract all emails
    const emails = manualEmailInput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];

    if (emails.length === 0) {
      toast.error("No valid email addresses found in the text");
      return;
    }

    const currentEmails = form.getValues("manualEmails") || [];
    const newEmails = Array.from(new Set([...currentEmails, ...emails]));

    form.setValue("manualEmails", newEmails);
    setManualEmailInput("");
    toast.success(`${emails.length} unique emails extracted and added`);
  };

  return (
    <div className="space-y-3 pt-4 border-t border-gray-200">
      <FormLabel className="flex items-center gap-2 font-bold text-gray-800">
        <Plus className="w-4 h-4 text-primary" />
        Manual Emails (Bulk Import)
      </FormLabel>
      <div className="space-y-3">
        <Textarea
          placeholder="Paste multiple emails here (separated by commas, spaces, or newlines)..."
          value={manualEmailInput}
          onChange={(e) => setManualEmailInput(e.target.value)}
          className="rounded-xl border-gray-200 bg-white min-h-[120px] text-xs focus:ring-primary/20"
        />
        <Button
          type="button"
          onClick={handleAddManualEmail}
          variant="secondary"
          className="w-full rounded-xl px-3 h-10 font-bold hover:bg-gray-200 transition-colors"
        >
          Extract & Import Emails
        </Button>
      </div>
    </div>
  );
};
