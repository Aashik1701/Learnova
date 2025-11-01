from fastapi import FastAPI, Request, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os
import json
import tempfile
from dotenv import load_dotenv
from app.services.gemini_service import generate_questionnaire, generate_study_materials
from app.utils.pdf_utils import extract_text_from_pdf

# Load environment variables
load_dotenv()

# Request models
class LessonData(BaseModel):
    name: str
    content: str

class Question(BaseModel):
    question: str
    options: List[str]
    correctAnswer: int = Field(..., alias='correctAnswer')
    explanation: str
    
    class Config:
        populate_by_name = True

class QuestionnaireResponse(BaseModel):
    questions: List[Question]

class UserResponse(BaseModel):
    question: str
    selected_option: str
    is_correct: bool
    correct_answer: str

class StudyMaterialsRequest(BaseModel):
    lesson_name: str
    user_responses: List[UserResponse]

class SectionQuestion(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str

class StudySection(BaseModel):
    title: str
    content: str
    questions: List[SectionQuestion]

class StudyMaterialsResponse(BaseModel):
    sections: List[StudySection]

app = FastAPI(
    title="Prince's FastAPI Backend",
    description="FastAPI backend for Prince's application with AI-powered study materials",
    version="2.0.0",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Prince's FastAPI Backend",
        "version": "2.0.0",
        "status": "healthy"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "gemini-study-materials",
        "version": "2.0.0"
    }

@app.post("/api/generate-questionnaire")
async def generate_questionnaire_endpoint(
    lesson_name: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Generate a questionnaire based on the uploaded file.
    Only accepts PDF or text files.
    """
    try:
        print(f"\n{'='*60}")
        print(f"GENERATE QUESTIONNAIRE REQUEST")
        print(f"{'='*60}")
        print(f"Lesson: {lesson_name}")
        print(f"File: {file.filename} ({file.content_type})")
        
        lesson_content = ""
        
        # Process file upload
        try:
            if file.filename.endswith('.pdf') or (file.content_type and 'pdf' in file.content_type):
                # Read the PDF file
                file_content = await file.read()
                print(f"Read {len(file_content)} bytes from PDF")
                lesson_content = extract_text_from_pdf(file_content)
                print(f"Extracted {len(lesson_content)} characters from PDF")
            else:
                # Read as text file
                lesson_content = (await file.read()).decode('utf-8')
                print(f"Read {len(lesson_content)} characters from text file")
                
        except Exception as e:
            print(f"✗ Error processing file: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")
        
        if not lesson_content.strip():
            raise HTTPException(status_code=400, detail="The uploaded file appears to be empty")
        
        # Generate questionnaire
        questions = generate_questionnaire(lesson_name, lesson_content)
        print(f"✓ Generated {len(questions)} questions successfully")
        
        return JSONResponse(content={"questions": questions})
        
    except HTTPException:
        raise
    except ValueError as e:
        print(f"✗ Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"✗ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process request: {str(e)}")

@app.post("/api/generate-study-materials")
async def generate_study_materials_endpoint(
    lesson_name: str = Form(...),
    file: UploadFile = File(...),
    user_responses: str = Form(...)
):
    """
    Generate personalized study materials based on user's quiz responses.
    
    This endpoint:
    1. Accepts a PDF or text file containing the study material
    2. Processes the file to extract text content
    3. Analyzes the user's quiz performance
    4. Generates structured study materials tailored to their learning needs
    
    The generation process uses chunked API calls to avoid truncation issues.
    """
    try:
        print(f"\n{'='*60}")
        print(f"GENERATE STUDY MATERIALS REQUEST")
        print(f"{'='*60}")
        print(f"Lesson: {lesson_name}")
        print(f"File: {file.filename}")
        
        # Read and process the uploaded file
        file_extension = file.filename.split('.')[-1].lower()
        content = ""
        
        if file_extension == 'pdf':
            file_content = await file.read()
            print(f"Read {len(file_content)} bytes from PDF")
            content = extract_text_from_pdf(file_content)
            print(f"Extracted {len(content)} characters from PDF")
        elif file_extension in ['txt', 'md']:
            content = (await file.read()).decode('utf-8')
            print(f"Read {len(content)} characters from text file")
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: .{file_extension}. Please upload a PDF, TXT, or MD file."
            )
        
        if not content.strip():
            raise HTTPException(
                status_code=400,
                detail="The uploaded file appears to be empty"
            )
        
        # Parse user responses
        try:
            responses = json.loads(user_responses)
            if not isinstance(responses, list):
                raise ValueError("user_responses must be a JSON array")
            print(f"Parsed {len(responses)} user responses")
            
            # Log performance summary
            correct = sum(1 for r in responses if r.get('is_correct', False))
            print(f"User Performance: {correct}/{len(responses)} correct")
            
        except json.JSONDecodeError as e:
            print(f"✗ JSON decode error: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid user_responses format: {str(e)}"
            )
        
        # Generate study materials using chunked generation
        study_materials = generate_study_materials(
            lesson_name=lesson_name,
            lesson_content=content,
            user_responses=responses
        )
        
        sections_count = len(study_materials.get('sections', []))
        print(f"\n✓ Successfully generated {sections_count} sections")
        
        # Return the study materials
        return JSONResponse(content=study_materials)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate study materials: {str(e)}"
        )

# Example API endpoint
@app.get("/api/hello")
async def hello():
    return {"message": "Hello from FastAPI!"}

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"\n{'='*60}")
    print(f"GLOBAL EXCEPTION HANDLER")
    print(f"{'='*60}")
    print(f"Error: {str(exc)}")
    import traceback
    traceback.print_exc()
    
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal Server Error",
            "detail": str(exc),
            "type": type(exc).__name__
        },
    )

# This is required for Vercel to work
app = app