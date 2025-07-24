"use client";

import { useState, useRef, useCallback } from "react";
import { generateCaptionFromImage } from "@/ai/flows/generate-caption-from-image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUp, Sparkles, Loader2, Quote } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ImageToText() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid file type', description: 'Please upload an image file.', variant: 'destructive' });
        return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
        setImageDataUrl(reader.result as string);
        setCaption(null);
    };
    reader.readAsDataURL(file);
  }
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleSubmit = async () => {
    if (!imageDataUrl) {
      toast({
        title: "No Image Selected",
        description: "Please upload an image to generate a caption.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setCaption(null);

    try {
      const result = await generateCaptionFromImage({ photoDataUri: imageDataUrl });
      if (result.caption) {
        setCaption(result.caption);
      } else {
        throw new Error("Caption generation failed.");
      }
    } catch (error) {
      console.error("Caption generation error:", error);
      toast({
        title: "Error Generating Caption",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
        <CardHeader>
            <CardTitle>AI Image Captioner</CardTitle>
            <CardDescription>Upload an image to get an AI-generated caption.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div 
                className="aspect-square w-full rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground p-4 cursor-pointer hover:border-primary hover:bg-accent/10 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                />
                {imageDataUrl ? (
                <Image
                    src={imageDataUrl}
                    alt="Uploaded preview"
                    width={512}
                    height={512}
                    className="object-contain h-full w-full rounded-md"
                    data-ai-hint="uploaded image"
                />
                ) : (
                <div className="text-center">
                    <FileUp className="mx-auto h-12 w-12" />
                    <p className="mt-2">Click to upload or drag & drop an image</p>
                    <p className="text-xs text-muted-foreground/80">PNG, JPG, WEBP</p>
                </div>
                )}
            </div>

            <Button onClick={handleSubmit} className="w-full" disabled={!imageDataUrl || loading}>
                {loading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                    </>
                ) : (
                    <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Caption
                    </>
                )}
            </Button>

            {(loading || caption) && (
                <Card className="bg-background">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-foreground">
                    Generated Caption
                    </h3>
                    {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                    ) : (
                    <blockquote className="border-l-2 pl-4 italic text-foreground/90 flex items-start">
                        <Quote className="h-4 w-4 mr-2 mt-1 shrink-0" />
                        <span>{caption}</span>
                    </blockquote>
                    )}
                </CardContent>
                </Card>
            )}
        </CardContent>
    </Card>
  );
}
