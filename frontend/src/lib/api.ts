import { toast } from "@/hooks/use-toast";

export interface QuestionnaireQuestion {
  question: string;
  options: string[];
  correct_answer: number;
}

export interface QuestionnaireResponse {
  questions: QuestionnaireQuestion[];
  lesson_name: string;
}

export const generateQuestionnaire = async (
  lessonName: string,
  file: File
): Promise<QuestionnaireResponse> => {
  const formData = new FormData();
  formData.append("lesson_name", lessonName);
  formData.append("file", file);

  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/generate-questionnaire`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || "Failed to generate questionnaire"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating questionnaire:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to generate questionnaire. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

export interface StudyMaterialSection {
  title: string;
  content: string;
  questions: Array<{
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  }>;
}

export interface StudyMaterialsResponse {
  sections: StudyMaterialSection[];
}

export const generateStudyMaterials = async (
  lessonName: string,
  file: File,
  userResponses: Array<{
    question: string;
    selected_option: string;
    is_correct: boolean;
    correct_answer: string;
  }>
): Promise<StudyMaterialsResponse> => {
  const formData = new FormData();
  formData.append("lesson_name", lessonName);
  formData.append("file", file);
  formData.append("user_responses", JSON.stringify(userResponses));

  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/generate-study-materials`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || "Failed to generate study materials"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating study materials:", error);
    throw error;
  }
};
