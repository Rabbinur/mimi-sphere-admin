"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useReorderCategoryMutation } from "@/components/Redux/RTK/categoryApi";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function ReorderCategoriesDialog({ categories, onSuccess }: { categories: any[], onSuccess: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [reorder, { isLoading }] = useReorderCategoryMutation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (categories) {
      const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
      setItems(sorted);
    }
  }, [categories, isOpen]);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);
    
    setItems(reorderedItems);
  };

  const handleSave = async () => {
    const categoryOrders = items.map((item, index) => ({
      id: item._id,
      order: index + 1,
    }));

    try {
      await reorder(categoryOrders).unwrap();
      toast.success("Category order updated successfully");
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update order");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Reorder Categories</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Reorder Categories</DialogTitle>
          <p className="text-sm text-muted-foreground italic">Drag and drop to shuffle categories</p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="categories">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="space-y-2 mb-4"
                >
                  {items.map((item, index) => (
                    <Draggable key={item._id} draggableId={item._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm transition-all ${
                            snapshot.isDragging ? "shadow-lg border-primary ring-1 ring-primary/20 z-50 bg-blue-50/10" : "hover:border-gray-300"
                          }`}
                        >
                          <div 
                            {...provided.dragHandleProps}
                            className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground w-4">{index + 1}.</span>
                          <span className="flex-1 font-medium text-sm truncate">{item.name}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t bg-gray-50/50">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
