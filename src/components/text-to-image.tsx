"use client";

import { useState } from "react";
import { generateImageFromText } from "@/ai/flows/generate-image-from-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Wand2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TextToImage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast({
        title: "Prompt is required",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setImageUrl(null);

    try {
      const result = await generateImageFromText({ prompt });
      if (result.image) {
        setImageUrl(result.image);
      } else {
        throw new Error("Image generation failed to return an image.");
      }
    } catch (error) {
      console.error("Image generation error:", error);
      toast({
        title: "Error Generating Image",
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
        <CardTitle>AI Image Generator</CardTitle>
        <CardDescription>Describe the image you want to create.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="e.g., A majestic lion wearing a crown, studio lighting, detailed"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="resize-none"
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Weaving...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>
        </form>
        
        <div className="aspect-square w-full rounded-lg border border-dashed flex items-center justify-center overflow-hidden bg-background">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt={prompt}
              width={512}
              height={512}
              className="object-contain h-full w-full transition-opacity duration-500 opacity-100"
              data-ai-hint="generated image"
            />
          ) : (
            <div className="text-center text-muted-foreground p-8">
              <p>Your generated image will appear here.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
