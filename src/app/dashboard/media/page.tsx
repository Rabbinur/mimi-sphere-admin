"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaFile, MediaLibrary } from "@/components/ui/media-manager";

import { useState } from "react";

interface TUploadedFile {
  _id: string;
  url: string;
  key: string;
  size: number;
  mimetype: string;
  title: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export default function ExampleUsage() {
  const [selectedImages, setSelectedImages] = useState<MediaFile[]>([]);

  const handleImageSelect = (files: MediaFile[]) => {
    setSelectedImages(files);

  };

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen space-y-6">

      <Card className=" p-2 md:p-4">
        <CardHeader className=" p-2 md:p-4">
          <CardTitle>React Media Library Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4  p-2 md:p-4">
          {selectedImages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Selected Images:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedImages.map((image) => (
                  <div
                    key={image._id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">
                        {image.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(image.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <MediaLibrary
        onSelect={handleImageSelect}
        multiple={true}
        maxFiles={1}
        title="Choose Images"
      />
    </div>
  );
}
