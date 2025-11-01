import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Chapter {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  quizScore: number | null;
}

interface ChapterViewerProps {
  chapter: Chapter;
  onComplete: () => void;
  onBack: () => void;
}

export const ChapterViewer = ({ chapter, onComplete, onBack }: ChapterViewerProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {chapter.title}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{chapter.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {chapter.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end pt-6 border-t">
              <Button onClick={onComplete} size="lg" className="gap-2">
                Take Quiz
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
