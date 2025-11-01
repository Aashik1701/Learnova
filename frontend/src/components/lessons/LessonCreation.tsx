import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Book, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface LessonCreationProps {
  onCompleteUpload: (lessonName: string, file: File) => void;
  onCompleteText: (lessonName: string, description: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  existingLesson?: { name: string; fileName: string };
}

export const LessonCreation = ({ onCompleteUpload, onCompleteText, onCancel, isLoading, existingLesson }: LessonCreationProps) => {
  const [lessonName, setLessonName] = useState(existingLesson?.name || "");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [mode, setMode] = useState<"upload" | "text">("upload");
  const [description, setDescription] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'text/plain'];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or text file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (10MB max)
      const maxSize = 100 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 100MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      toast({
        title: "File ready",
        description: `${selectedFile.name} is ready to upload.`,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lessonName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a lesson name.",
        variant: "destructive",
      });
      return;
    }

    if (mode === "upload") {
      if (!file) {
        toast({
          title: "Error",
          description: "Please upload study materials.",
          variant: "destructive",
        });
        return;
      }
      onCompleteUpload(lessonName, file);
    } else {
      if (!description.trim()) {
        toast({
          title: "Error",
          description: "Please enter a brief description for the topic.",
          variant: "destructive",
        });
        return;
      }
      onCompleteText(lessonName, description.trim());
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-6">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-6 w-6 text-primary" />
              {existingLesson ? "Edit Lesson" : "Create New Lesson"}
            </CardTitle>
            <CardDescription>
              Choose how you'd like to create your lesson.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="lesson-name">Lesson Name</Label>
                <Input
                  id="lesson-name"
                  placeholder="Enter lesson name"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="upload">From PDF/Text</TabsTrigger>
                  <TabsTrigger value="text">From Topic</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-2 mt-4">
                  <Label>Upload Study Materials (PDF or Text)</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.txt,application/pdf,text/plain"
                    className="hidden"
                    disabled={isLoading}
                  />
                  
                  <div 
                    onClick={handleFileClick}
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors p-4 text-center"
                  >
                    {file ? (
                      <div className="flex flex-col items-center">
                        <FileText className="w-10 h-10 text-primary mb-2" />
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                        </p>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                        >
                          Remove file
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF or TXT (max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-2 mt-4">
                  <Label>Topic Description</Label>
                  <Textarea
                    placeholder="Briefly describe the topic you want to study..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    disabled={isLoading}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={
                    !lessonName.trim() || 
                    (mode === 'upload' ? !file : !description.trim()) || 
                    isLoading
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Generate Questions'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
