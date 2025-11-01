import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Book, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LessonCreationProps {
  onComplete: (lessonName: string, file: File) => void;
  onCancel: () => void;
  isLoading?: boolean;
  existingLesson?: { name: string; fileName: string };
}

export const LessonCreation = ({ onComplete, onCancel, isLoading, existingLesson }: LessonCreationProps) => {
  const [lessonName, setLessonName] = useState(existingLesson?.name || "");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

    if (!file) {
      toast({
        title: "Error",
        description: "Please upload study materials.",
        variant: "destructive",
      });
      return;
    }

    onComplete(lessonName, file);
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
              Upload your study materials and we'll generate a personalized learning experience.
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
              
              <div className="space-y-2">
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
              </div>

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
                  disabled={!lessonName.trim() || !file || isLoading}
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
