"use client";

import { useState } from 'react';
import { TextToImage } from '@/components/text-to-image';
import { ImageToText } from '@/components/image-to-text';
import { History } from '@/components/history';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Bot, History as HistoryIcon } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  const [activeTab, setActiveTab] = useState("text-to-image");
  const [reusedPrompt, setReusedPrompt] = useState<string>('');

  const handleReusePrompt = (prompt: string) => {
    setReusedPrompt(prompt);
    setActiveTab("text-to-image");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background font-body">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 flex flex-col items-center">
            <Logo />
            <h1 className="text-4xl sm:text-5xl font-bold font-headline text-foreground">
              Vision Weaver
            </h1>
            <p className="text-muted-foreground mt-2">
              Weave your imagination into visuals and words with AI.
            </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="text-to-image" className="text-base">
              <Bot className="mr-2 h-5 w-5" />
              Text to Image
            </TabsTrigger>
            <TabsTrigger value="image-to-text" className="text-base">
              <Camera className="mr-2 h-5 w-5" />
              Image to Text
            </TabsTrigger>
            <TabsTrigger value="history" className="text-base">
              <HistoryIcon className="mr-2 h-5 w-5" />
              History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text-to-image">
             <TextToImage prompt={reusedPrompt} onPromptUsed={() => setReusedPrompt('')}/>
          </TabsContent>
          <TabsContent value="image-to-text">
            <ImageToText />
          </TabsContent>
          <TabsContent value="history">
            <History onReusePrompt={handleReusePrompt}/>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
