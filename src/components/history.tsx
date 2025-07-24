"use client";

import { useState, useEffect, useCallback } from "react";
import { getImageHistory, ImageHistoryItem } from "@/services/imageService";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function History({ onReusePrompt }: { onReusePrompt: (prompt: string) => void }) {
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const historyData = await getImageHistory();
      setHistory(historyData);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast({
        title: "Error Fetching History",
        description: "Could not load image generation history. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDownload = (url: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${prompt.substring(0, 20) || 'generated-image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleReusePrompt = (prompt: string) => {
    onReusePrompt(prompt);
    toast({
        title: "Prompt Loaded",
        description: "The prompt has been loaded in the generator.",
    });
  };

  return (
    <Card className="overflow-hidden">
        <CardHeader>
            <CardTitle>Generation History</CardTitle>
            <CardDescription>View, download, or reuse prompts from your past creations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             {loading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-square w-full rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : history.length === 0 ? (
                 <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <AlertCircle className="h-12 w-12 mb-4" />
                    <h3 className="text-lg font-semibold">No History Found</h3>
                    <p>You haven't generated any images yet. Go to the "Text to Image" tab to start creating!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                    {history.map((item) => (
                        <div key={item.id} className="group relative">
                             <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="aspect-square w-full bg-muted">
                                         <Image
                                            src={item.imageUrl}
                                            alt={item.prompt}
                                            width={512}
                                            height={512}
                                            className="object-contain h-full w-full"
                                            data-ai-hint="historic image"
                                        />
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <p className="text-sm text-muted-foreground truncate" title={item.prompt}>{item.prompt}</p>
                                        <div className="flex justify-between items-center">
                                             <Button variant="ghost" size="sm" onClick={() => handleReusePrompt(item.prompt)}>
                                                <RefreshCw className="mr-2 h-4 w-4" /> Reuse
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDownload(item.imageUrl, item.prompt)}>
                                                <Download className="mr-2 h-4 w-4" /> Download
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
    </Card>
  );
}
