"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Editor } from "@tinymce/tinymce-react";
import { UseFormReturn } from "react-hook-form";

interface CampaignFormContentProps {
  form: UseFormReturn<any>;
}

export const CampaignFormContent = ({ form }: CampaignFormContentProps) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-bold text-gray-700">Campaign Title (Internal)</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., Ramadan Special Offer 2024" 
                {...field} 
                className="rounded-xl border-gray-200 h-11 focus:ring-primary/20" 
              />
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
            <FormLabel className="text-sm font-bold text-gray-700">Email Subject Line</FormLabel>
            <FormControl>
              <Input 
                placeholder="What the customer will see in their inbox" 
                {...field} 
                className="rounded-xl border-gray-200 h-11 focus:ring-primary/20" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-bold text-gray-700">Email Content (HTML)</FormLabel>
            <FormControl>
              <div className="border rounded-xl overflow-hidden border-gray-200 shadow-sm">
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY}
                  value={field.value}
                  onEditorChange={(content) => field.onChange(content)}
                  init={{
                    height: 500,
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
    </div>
  );
};
