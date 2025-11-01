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

// Text-based generation (topic + description)
export const generateQuestionnaireFromText = async (
  lessonName: string,
  description: string
): Promise<QuestionnaireResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/generate-questionnaire-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_name: lessonName, description })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to generate questionnaire");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating questionnaire (text):", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to generate questionnaire. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

export const generateStudyMaterialsFromText = async (
  lessonName: string,
  description: string,
  userResponses: Array<{
    question: string;
    selected_option: string;
    is_correct: boolean;
    correct_answer: string;
  }>
): Promise<StudyMaterialsResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/generate-study-materials-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_name: lessonName, description, user_responses: userResponses })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to generate study materials");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating study materials (text):", error);
    throw error;
  }
};

// Certificate issuance API
export interface IssueCertificateRequest {
  userId: string;
  courseId: string;
  grade: string;
  courseName?: string;
  learnerName?: string;
  durationHours?: number;
  modules?: number;
  metadata?: Record<string, any>;
  ownerAddress?: string;
}

export interface CertificateResponse {
  status: string;
  cert_id?: string;
  cid_doc?: string;
  cid_proof?: string;
  tx_hash?: string;
  gateway_url?: string;  // IPFS gateway URL for direct access
  verify_url?: string;
  proof_url?: string;
  issued_on?: string;
  error?: string;
}

export const issueCertificate = async (
  request: IssueCertificateRequest
): Promise<CertificateResponse> => {
  try {
    const backendUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    const response = await fetch(`${backendUrl}/internal/issue-certificate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: request.userId,
        courseId: request.courseId,
        grade: request.grade,
        courseName: request.courseName,
        learnerName: request.learnerName,
        durationHours: request.durationHours || 0,
        modules: request.modules || 0,
        metadata: request.metadata,
        ownerAddress: request.ownerAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.detail || error.message || "Failed to issue certificate"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error issuing certificate:", error);
    throw error;
  }
};
