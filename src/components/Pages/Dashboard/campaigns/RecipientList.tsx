"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChevronDown, Users } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface RecipientListProps {
  form: UseFormReturn<any>;
  allEmails: string[];
  filteredEmails: string[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  showRecipients: boolean;
  setShowRecipients: (val: boolean) => void;
  totalCount: number;
}

export const RecipientList = ({
  form,
  allEmails,
  filteredEmails,
  searchTerm,
  setSearchTerm,
  showRecipients,
  setShowRecipients,
  totalCount
}: RecipientListProps) => {
  const excludedEmails = form.watch("excludedEmails") || [];
  const manualEmails = form.watch("manualEmails") || [];

  const handleToggleRecipient = (email: string) => {
    const currentExcluded = form.getValues("excludedEmails") || [];
    if (currentExcluded.includes(email)) {
      form.setValue("excludedEmails", currentExcluded.filter((e: string) => e !== email));
    } else {
      form.setValue("excludedEmails", [...currentExcluded, email]);
    }
  };

  return (
    <div className="pt-4 border-t border-gray-200">
      <button 
        type="button"
        onClick={() => setShowRecipients(!showRecipients)}
        className="w-full flex items-center justify-between text-sm font-bold text-gray-700 hover:text-primary transition-colors py-2"
      >
        <span className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Active Recipients ({totalCount})
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showRecipients ? 'rotate-180' : ''}`} />
      </button>
      
      {showRecipients && (
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Input 
              placeholder="Filter recipients by email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border-gray-200 bg-white h-10 text-xs pl-9 focus:ring-primary/20"
            />
            <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="max-h-[350px] overflow-y-auto space-y-1 pr-2 custom-scrollbar bg-white p-3 rounded-xl border border-gray-100 shadow-inner">
            {allEmails.length > 0 && !searchTerm && (
              <div className="flex items-center space-x-3 py-2 px-3 border-b border-gray-50 mb-2 sticky top-0 bg-white z-10">
                <Checkbox 
                  id="select-all" 
                  checked={excludedEmails.length === 0 && allEmails.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      form.setValue("excludedEmails", []);
                    } else {
                      form.setValue("excludedEmails", allEmails);
                    }
                  }}
                />
                <label htmlFor="select-all" className="text-xs font-bold text-primary cursor-pointer select-none">
                  Check / Uncheck All in this list
                </label>
              </div>
            )}
            
            {filteredEmails.map((email: string) => {
              const isExcluded = excludedEmails.includes(email);
              const isManual = manualEmails.includes(email);
              
              return (
                <div 
                  key={email} 
                  className={`flex items-center space-x-3 py-2 px-3 rounded-lg transition-all ${
                    isExcluded ? 'opacity-40 grayscale bg-gray-50' : 
                    isManual ? 'bg-blue-50/40 hover:bg-blue-50/60 border border-blue-100/50' : 
                    'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <Checkbox 
                    id={`rec-${email}`} 
                    checked={!isExcluded}
                    onCheckedChange={() => handleToggleRecipient(email)}
                  />
                  <label 
                    htmlFor={`rec-${email}`} 
                    className={`text-xs truncate flex-grow cursor-pointer flex items-center justify-between select-none ${
                      isExcluded ? 'line-through text-gray-400' : 'text-gray-700 font-medium'
                    }`}
                  >
                    <span>{email}</span>
                    {isManual && (
                      <span className="text-[9px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full shadow-sm">
                        MANUAL
                      </span>
                    )}
                  </label>
                </div>
              );
            })}
            
            {filteredEmails.length === 0 && (
              <div className="text-center py-10 px-4">
                <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400 italic">
                  {searchTerm ? `No recipients found matching "${searchTerm}"` : "Your recipient list is currently empty."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
