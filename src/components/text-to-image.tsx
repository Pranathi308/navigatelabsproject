"use client";

import { useState } from "react";
import { generateImageFromText, GenerateImageFromTextInput } from "@/ai/flows/generate-image-from-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Wand2, Loader2, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TextToImage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${prompt.substring(0, 20) || 'generated-image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

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
      const input: GenerateImageFromTextInput = { prompt };
      const result = await generateImageFromText(input);
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
                Generate
              </>
            )}
          </Button>
        </form>
        
        <div className="grid grid-cols-1 gap-4">
          {loading && (
             <div className="aspect-square w-full rounded-lg border border-dashed flex items-center justify-center overflow-hidden bg-background">
                <Skeleton className="h-full w-full" />
             </div>
          )}
          {!loading && imageUrl && (
            <div className="group relative aspect-square w-full rounded-lg border border-dashed flex items-center justify-center overflow-hidden bg-background">
                <Image
                  src={imageUrl}
                  alt={prompt}
                  width={512}
                  height={512}
                  className="object-contain h-full w-full transition-opacity duration-500 opacity-100"
                  data-ai-hint="generated image"
                />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(imageUrl)}
                        className="text-white hover:bg-white/20 hover:text-white"
                    >
                        <Download className="h-6 w-6" />
                    </Button>
                </div>
            </div>
          )}
           {!loading && !imageUrl && (
           <div className="aspect-square w-full rounded-lg border border-dashed flex items-center justify-center overflow-hidden bg-background">
            <div className="text-center text-muted-foreground p-8">
              <p>Your generated image will appear here.</p>
            </div>
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
}
