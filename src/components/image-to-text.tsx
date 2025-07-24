"use client";

import { useState, useRef, useCallback } from "react";
import { generateCaptionFromImage } from "@/ai/flows/generate-caption-from-image";
import { generateSummaryFromImage } from "@/ai/flows/generate-summary-from-image";
import { analyzeFormulaFromImage, AnalyzeFormulaFromImageOutput } from "@/ai/flows/analyze-formula-from-image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUp, Sparkles, Loader2, Quote, Copy, Check, Text, RefreshCcw,Sigma } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type OutputType = 'caption' | 'summary' | 'formula';

export function ImageToText() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [formula, setFormula] = useState<AnalyzeFormulaFromImageOutput | null>(null);
  const [copied, setCopied] = useState<OutputType | null>(null);
  const [activeTab, setActiveTab] = useState<OutputType>('caption');


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
        setSummary(null);
        setFormula(null);
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

  const handleReupload = () => {
    setCaption(null);
    setSummary(null);
    setFormula(null);
    fileInputRef.current?.click();
  }

  const handleSubmit = async (type: OutputType) => {
    if (!imageDataUrl) {
      toast({
        title: "No Image Selected",
        description: `Please upload an image to generate a ${type}.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    if (type === 'caption') setCaption(null);
    if (type === 'summary') setSummary(null);
    if (type === 'formula') setFormula(null);

    try {
        if (type === 'caption') {
            const result = await generateCaptionFromImage({ photoDataUri: imageDataUrl });
            if (result.caption) {
                setCaption(result.caption);
            } else {
                throw new Error("Caption generation failed.");
            }
        } else if (type === 'summary') {
            const result = await generateSummaryFromImage({ photoDataUri: imageDataUrl });
            if (result.summary) {
                setSummary(result.summary);
            } else {
                throw new Error("Summary generation failed.");
            }
        } else {
            const result = await analyzeFormulaFromImage({ photoDataUri: imageDataUrl });
            if (result) {
                setFormula(result);
            } else {
                throw new Error("Formula analysis failed.");
            }
        }
    } catch (error) {
      console.error(`${type} generation error:`, error);
      toast({
        title: `Error Generating ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopy = (text: string | null, type: OutputType) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  const getFormulaText = () => {
    if (!formula) return null;
    return `Formula Name: ${formula.formulaName}\n\nUse: ${formula.use}\n\nExample: ${formula.example}`;
  }

  return (
    <Card className="overflow-hidden">
        <CardHeader>
            <CardTitle>AI Image Analyst</CardTitle>
            <CardDescription>Upload an image to get an AI-generated caption, summary, or formula analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div 
                className="relative group aspect-square w-full rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground p-4 cursor-pointer hover:border-primary hover:bg-accent/10 transition-colors"
                onClick={() => !imageDataUrl && fileInputRef.current?.click()}
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
                  <>
                    <Image
                        src={imageDataUrl}
                        alt="Uploaded preview"
                        width={512}
                        height={512}
                        className="object-contain h-full w-full rounded-md"
                        data-ai-hint="uploaded image"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            variant="outline"
                            onClick={handleReupload}
                            className="text-white bg-transparent hover:bg-white/20 hover:text-white"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Re-upload
                        </Button>
                    </div>
                  </>
                ) : (
                <div className="text-center">
                    <FileUp className="mx-auto h-12 w-12" />
                    <p className="mt-2">Click to upload or drag & drop an image</p>
                    <p className="text-xs text-muted-foreground/80">PNG, JPG, WEBP</p>
                </div>
                )}
            </div>
            
            <Tabs defaultValue="caption" className="w-full" onValueChange={(value) => setActiveTab(value as OutputType)}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="caption"><Quote className="mr-2 h-4 w-4"/>Caption</TabsTrigger>
                    <TabsTrigger value="summary"><Text className="mr-2 h-4 w-4"/>Summary</TabsTrigger>
                    <TabsTrigger value="formula"><Sigma className="mr-2 h-4 w-4"/>Formula</TabsTrigger>
                </TabsList>
                <TabsContent value="caption" className="space-y-4 mt-4">
                    <Button onClick={() => handleSubmit('caption')} className="w-full" disabled={!imageDataUrl || loading}>
                        {loading && activeTab === 'caption' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Caption</>}
                    </Button>
                    {(loading && activeTab === 'caption' && !caption) || caption ? (
                        <Card className="bg-background">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">Generated Caption</CardTitle>
                                {caption && (
                                <Button variant="ghost" size="icon" onClick={() => handleCopy(caption, 'caption')}>
                                    {copied === 'caption' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {loading && activeTab === 'caption' && !caption ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-4/5" />
                                    </div>
                                ) : (
                                    <blockquote className="border-l-2 pl-4 italic text-foreground/90 flex items-start">
                                        <span>{caption}</span>
                                    </blockquote>
                                )}
                            </CardContent>
                        </Card>
                    ) : null}
                </TabsContent>
                <TabsContent value="summary" className="space-y-4 mt-4">
                    <Button onClick={() => handleSubmit('summary')} className="w-full" disabled={!imageDataUrl || loading}>
                        {loading && activeTab === 'summary' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Summary</>}
                    </Button>
                     {(loading && activeTab === 'summary' && !summary) || summary ? (
                        <Card className="bg-background">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">Generated Summary</CardTitle>
                                {summary && (
                                <Button variant="ghost" size="icon" onClick={() => handleCopy(summary, 'summary')}>
                                    {copied === 'summary' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {loading && activeTab === 'summary' && !summary ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                ) : (
                                    <p className="text-foreground/90">{summary}</p>
                                )}
                            </CardContent>
                        </Card>
                    ): null}
                </TabsContent>
                 <TabsContent value="formula" className="space-y-4 mt-4">
                    <Button onClick={() => handleSubmit('formula')} className="w-full" disabled={!imageDataUrl || loading}>
                        {loading && activeTab === 'formula' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Analyze Formula</>}
                    </Button>
                     {(loading && activeTab === 'formula' && !formula) || formula ? (
                        <Card className="bg-background">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">Formula Analysis</CardTitle>
                                {formula && (
                                <Button variant="ghost" size="icon" onClick={() => handleCopy(getFormulaText(), 'formula')}>
                                    {copied === 'formula' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loading && activeTab === 'formula' && !formula ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                ) : (
                                    formula && (
                                        <div className="space-y-2 text-sm text-foreground/90">
                                            <p><strong className="font-semibold">Formula Name:</strong> {formula.formulaName}</p>
                                            <p><strong className="font-semibold">Use:</strong> {formula.use}</p>
                                            <p><strong className="font-semibold">Example:</strong> {formula.example}</p>
                                        </div>
                                    )
                                )}
                            </CardContent>
                        </Card>
                    ): null}
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
