import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceButtonProps {
  text: string;
  lang?: string;
}

export const VoiceButton = ({ text, lang = 'en-US' }: VoiceButtonProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const speak = () => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Not supported",
        description: "Text-to-speech is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Error",
        description: "Failed to read text aloud",
        variant: "destructive",
      });
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={speak}
      className="h-8 w-8"
    >
      {isSpeaking ? (
        <VolumeX className="h-4 w-4 text-primary animate-pulse" />
      ) : (
        <Volume2 className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
};
