"use client";

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
import { MediaLibrary } from "@/components/ui/media-manager";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CustomItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: { title: string; price: number; thumbnail: string }) => void;
}

const DEFAULT_IMAGE_URL =
  "https://softwebsys.s3.us-east-1.amazonaws.com/uploads/1782394449079-elegant-gift-box-wrapped-in-kraft-paper-with-green-ribbon-bow-on-white-background-photo.webp";

export function CustomItemDialog({
  isOpen,
  onOpenChange,
  onAdd,
}: CustomItemDialogProps) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [thumbnail, setThumbnail] = useState(DEFAULT_IMAGE_URL);

  // Reset fields when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setPrice(0);
      setThumbnail(DEFAULT_IMAGE_URL);
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (!title.trim()) {
      toast.error("Please provide a valid title");
      return;
    }

    onAdd({
      title,
      price: price || 0,
      thumbnail: thumbnail || DEFAULT_IMAGE_URL,
    });
    onOpenChange(false);
  };

  const handleMediaSelect = (files: any[]) => {
    if (files.length > 0) {
      setThumbnail(files[0].url);
      toast.success("Image selected from media library");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Add Custom Item</DialogTitle>
          <DialogDescription>
            Enter details for a product not in the store registry.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input
              placeholder="Custom product name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Price (৳)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Image (URL or Upload)</Label>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Image URL..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="flex-1"
              />
              <MediaLibrary
                multiple={false}
                onSelect={handleMediaSelect}
                title="Select Image"
              />
            </div>
            {thumbnail && (
              <div className="mt-2 relative w-20 h-20 rounded border overflow-hidden bg-slate-50">
                <img
                  src={thumbnail}
                  alt="Custom item preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/100x100?text=No+Image";
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd}>
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
