"use client";

import React from "react";
import CreateEditCategoryDialog from "../../../categories/_components/CreateEditCategoryDialog";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCategory: any) => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <CreateEditCategoryDialog
      mode="create"
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onSuccess={() => {
        onSuccess({});
        onClose();
      }}
    />
  );
};
