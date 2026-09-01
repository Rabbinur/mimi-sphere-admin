"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FormLabel } from "@/components/ui/form";
import { Users, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface AudienceSelectorProps {
  form: UseFormReturn<any>;
  isFetchingRecipients: boolean;
  recipientsCount: number;
}

export const AudienceSelector = ({ form, isFetchingRecipients, recipientsCount }: AudienceSelectorProps) => {
  const selectedTargets = form.watch("target") || [];

  const targets = [
    { id: 'all', label: 'All (Users + Subscribers)' },
    { id: 'all_users', label: 'Registered Users' },
    { id: 'newsletter_subscribers', label: 'Newsletter Subscribers' }
  ];

  return (
    <div className="space-y-4">
      <FormLabel className="flex items-center gap-2 text-base font-bold text-gray-800">
        <Users className="w-5 h-5 text-primary" />
        Target Audience
      </FormLabel>
      
      <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100 shadow-inner">
        {targets.map((item) => (
          <div key={item.id} className="flex items-center space-x-3 hover:bg-gray-50 p-1 rounded-md transition-colors">
            <Checkbox 
              id={`target-${item.id}`} 
              checked={selectedTargets.includes(item.id)}
              onCheckedChange={(checked) => {
                const current = form.getValues("target") || [];
                if (checked) {
                  form.setValue("target", [...current, item.id]);
                } else {
                  form.setValue("target", current.filter((t: string) => t !== item.id));
                }
              }}
            />
            <label 
              htmlFor={`target-${item.id}`} 
              className="text-sm font-medium leading-none cursor-pointer flex-grow"
            >
              {item.label}
            </label>
          </div>
        ))}
      </div>
      
      {isFetchingRecipients && (
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Loader2 className="w-3 h-3 animate-spin" /> Updating automatic recipient list...
        </span>
      )}
    </div>
  );
};
