import { TextToImage } from '@/components/text-to-image';
import { ImageToText } from '@/components/image-to-text';
import { History } from '@/components/history';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Bot, History as HistoryIcon } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background font-body">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold font-headline text-foreground">
              Vision Weaver
            </h1>
            <p className="text-muted-foreground mt-2">
              Weave your imagination into visuals and words with AI.
            </p>
        </div>
        
        <Tabs defaultValue="text-to-image" className="w-full">
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
             <TextToImage />
          </TabsContent>
          <TabsContent value="image-to-text">
            <ImageToText />
          </TabsContent>
          <TabsContent value="history">
            <History />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
