import google.generativeai as genai
from typing import List, Dict, Any, Optional
import os
import json
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_gemini_api_key() -> str:
    """Get Gemini API key from environment variables"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    return api_key

# Initialize the Gemini model
def init_gemini():
    """Initialize the Gemini model with API key from environment"""
    try:
        api_key = get_gemini_api_key()
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-2.0-flash-exp')
    except Exception as e:
        raise Exception(f"Failed to initialize Gemini: {str(e)}")

def generate_questionnaire(lesson_name: str, lesson_content: str) -> List[Dict[str, Any]]:
    """
    Generate a questionnaire based on lesson name and content using Gemini
    
    Args:
        lesson_name: Name of the lesson
        lesson_content: Content of the lesson
        
    Returns:
        List of questions with options and correct answers
    """
    try:
        # Initialize the model
        model = init_gemini()
        
        # Create the prompt
        prompt = f"""
        You are an expert educator creating a multiple-choice questionnaire to test understanding of a lesson.
        
        Lesson Title: {lesson_name}
        
        Lesson Content:
        {lesson_content}
        
        Please create 10 high-quality multiple-choice questions that test key concepts from this lesson.
        
        For each question, provide:
        1. The question text
        2. 4 possible answers (a, b, c, d)
        3. The correct answer (a, b, c, or d)
        4. A brief explanation of why the correct answer is right

        Ask basic questions, this is to understand the pace of the learner, based on this response only further lesson plans will be created. 
        
        IMPORTANT: Return ONLY valid JSON, with no markdown formatting, no code blocks, no extra text.
        
        Format your response exactly as follows:
        [
            {{
                "question": "...",
                "options": ["...", "...", "...", "..."],
                "correctAnswer": 0,
                "explanation": "..."
            }}
        ]
        """
        
    # Generate the response; older SDKs do not support response_mime_type
        generation_config = {
            "temperature": 0.7
        }
        
        response = model.generate_content(prompt, generation_config=generation_config)
        
        # Parse the response
        try:
            # Extract text from response
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
                if response_text.endswith('```'):
                    response_text = response_text[:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:]
                if response_text.endswith('```'):
                    response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON
            questions = json.loads(response_text)
            
            # Validate the response structure
            if not isinstance(questions, list):
                raise ValueError("Expected a list of questions")
            
            if len(questions) == 0:
                raise ValueError("No questions generated")
                
            for i, q in enumerate(questions):
                # Check required fields
                required_fields = ['question', 'options', 'correctAnswer', 'explanation']
                missing_fields = [f for f in required_fields if f not in q]
                if missing_fields:
                    raise ValueError(f"Question {i+1} missing fields: {missing_fields}")
                
                # Validate options
                if not isinstance(q['options'], list):
                    raise ValueError(f"Question {i+1}: options must be a list")
                if len(q['options']) != 4:
                    raise ValueError(f"Question {i+1}: must have exactly 4 options, got {len(q['options'])}")
                
                # Validate correctAnswer
                if not isinstance(q['correctAnswer'], int):
                    raise ValueError(f"Question {i+1}: correctAnswer must be an integer")
                if q['correctAnswer'] < 0 or q['correctAnswer'] > 3:
                    raise ValueError(f"Question {i+1}: correctAnswer must be between 0 and 3")
                
            return questions
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse JSON response: {str(e)}\nResponse text: {response_text[:500]}")
        except Exception as e:
            raise ValueError(f"Failed to validate questions: {str(e)}")
        
    except Exception as e:
        raise Exception(f"Failed to generate questionnaire: {str(e)}")


def extract_json_from_response(response_text: str) -> str:
    """
    Extract JSON content from response, handling markdown code blocks
    
    Args:
        response_text: Raw response text from Gemini
        
    Returns:
        Cleaned JSON string
    """
    response_text = response_text.strip()
    
    # Check for markdown code blocks
    if '```json' in response_text:
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            return json_match.group(1).strip()
        else:
            # Fallback: remove the markers manually
            return response_text.replace('```json', '').replace('```', '').strip()
    elif '```' in response_text:
        json_match = re.search(r'```\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            return json_match.group(1).strip()
        else:
            # Fallback: remove the markers manually
            return response_text.replace('```', '').strip()
    else:
        # No markdown blocks, use the full response
        return response_text


def repair_truncated_json(json_str: str) -> tuple[str, bool]:
    """
    Attempt to repair truncated JSON by adding missing closing brackets
    
    Args:
        json_str: Potentially truncated JSON string
        
    Returns:
        Tuple of (repaired_json_string, was_truncated)
    """
    open_braces = json_str.count('{')
    close_braces = json_str.count('}')
    open_brackets = json_str.count('[')
    close_brackets = json_str.count(']')
    
    print(f"JSON structure check - Braces: {open_braces}/{close_braces}, Brackets: {open_brackets}/{close_brackets}")
    
    is_truncated = (open_braces != close_braces) or (open_brackets != close_brackets)
    
    if is_truncated:
        print("WARNING: Response appears truncated - bracket mismatch detected!")
        print(f"Last 200 chars: ...{json_str[-200:]}")
        
        # Try to repair by adding missing closing brackets
        if open_brackets > close_brackets:
            json_str += ']' * (open_brackets - close_brackets)
            print(f"Added {open_brackets - close_brackets} closing bracket(s)")
            
        if open_braces > close_braces:
            json_str += '}' * (open_braces - close_braces)
            print(f"Added {open_braces - close_braces} closing brace(s)")
            
        print("Attempted to repair truncated JSON")
    
    return json_str, is_truncated


def generate_section_content(
    model: Any,
    lesson_name: str,
    lesson_content: str,
    section_number: int,
    total_sections: int,
    section_focus: str,
    user_performance: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate content for a single section
    
    Args:
        model: Initialized Gemini model
        lesson_name: Name of the lesson
        lesson_content: Original lesson content
        section_number: Current section number (1-indexed)
        total_sections: Total number of sections to generate
        section_focus: Focus area for this section
        user_performance: Dictionary with user's performance metrics
        
    Returns:
        Dictionary containing the section data
    """
    prompt = f"""
You are an expert educator generating a comprehensive study section.

**Lesson:** {lesson_name}
**Section:** {section_number} of {total_sections}
**Focus:** {section_focus}

**Student Performance:**
- Accuracy: {user_performance['accuracy']*100:.1f}%
- Learning Pace: {user_performance['pace']}

**Lesson Content Reference:**
{lesson_content[:3000]}...

---

Generate ONE comprehensive section with the following structure:

{{
  "title": "Clear, descriptive section title",
  "content": "# Section Title\\n\\n[COMPREHENSIVE MARKDOWN CONTENT]\\n\\nWrite 4-8 detailed paragraphs covering:\\n- Core concepts with clear explanations\\n- Multiple practical examples\\n- Code snippets (if applicable)\\n- Real-world applications\\n- Common pitfalls and best practices\\n- Key insights\\n\\nUse markdown formatting: ###, **, *, `, lists, etc.",
  "questions": [
    {{
      "question": "Question text?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct_index": 0,
      "explanation": "Why this is correct and others are wrong"
    }}
    // Include 5-7 questions
  ]
}}

**Requirements:**
- Content should be 600-1000 words of detailed, educational material
- Focus on {section_focus}
- Make it comprehensive and textbook-quality
- Return ONLY valid JSON, no markdown code blocks
- Use \\n for newlines in content strings
"""
    
    generation_config = {
        "temperature": 0.7,
        "max_output_tokens": 8192  # Maximum for Gemini 2.0 Flash
    }
    
    print(f"Generating section {section_number}/{total_sections}: {section_focus}")
    response = model.generate_content(prompt, generation_config=generation_config)
    
    response_text = response.text
    print(f"  Received response of length: {len(response_text)} characters")
    
    # Extract and clean JSON
    json_str = extract_json_from_response(response_text)
    print(f"  Extracted JSON of length: {len(json_str)} characters")
    
    # Repair if truncated
    json_str, was_truncated = repair_truncated_json(json_str)
    if was_truncated:
        print(f"  WARNING: Section {section_number} may have truncated content")
    
    # Clean up common JSON issues
    json_str = re.sub(r',\s*([}\]])', r'\1', json_str)  # Remove trailing commas
    
    # Parse JSON
    section_data = json.loads(json_str)
    
    # Validate structure
    if not isinstance(section_data, dict):
        raise ValueError("Section must be a JSON object")
    
    if 'title' not in section_data or 'content' not in section_data:
        raise ValueError("Section must have 'title' and 'content' fields")
    
    # Ensure questions exist
    if 'questions' not in section_data:
        section_data['questions'] = []
    
    print(f"  ✓ Section {section_number} complete: {len(section_data.get('content', ''))} chars, {len(section_data.get('questions', []))} questions")
    
    return section_data


def generate_study_materials(
    lesson_name: str,
    lesson_content: str,
    user_responses: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Generate structured study materials based on user responses and lesson content.
    Uses chunked generation to avoid truncation issues.
    
    Args:
        lesson_name: Name of the lesson
        lesson_content: Original lesson content
        user_responses: List of user's questionnaire responses
        
    Returns:
        Dictionary containing structured study materials with sections and questions
    """
    try:
        print("\n" + "="*60)
        print("GENERATING COMPREHENSIVE STUDY MATERIALS")
        print("="*60)
        
        # Initialize the model
        model = init_gemini()
        
        # Calculate user's performance
        total_questions = len(user_responses)
        correct_answers = sum(1 for r in user_responses if r.get('is_correct', False))
        accuracy = (correct_answers / total_questions) if total_questions > 0 else 0
        
        # Determine pace based on accuracy
        if accuracy >= 0.8:
            pace = "fast - student has strong grasp, provide advanced insights"
        elif accuracy >= 0.5:
            pace = "moderate - balance fundamentals with deeper concepts"
        else:
            pace = "slow - focus on building strong fundamentals with clear examples"
        
        user_performance = {
            'total_questions': total_questions,
            'correct_answers': correct_answers,
            'accuracy': accuracy,
            'pace': pace
        }
        
        print(f"Lesson: {lesson_name}")
        print(f"Student Performance: {correct_answers}/{total_questions} ({accuracy*100:.1f}%)")
        print(f"Learning Pace: {pace}")
        print("-"*60)
        
        # Define sections to generate based on lesson content
        # You can make this more dynamic based on the lesson content analysis
        section_focuses = [
            "Introduction and Fundamental Concepts",
            "Core Principles and Basic Operations",
            "Intermediate Techniques and Applications",
            "Advanced Concepts and Best Practices",
            "Practical Examples and Real-World Use Cases",
            "Common Pitfalls and Troubleshooting"
        ]
        
        # Adjust number of sections based on content length
        content_length = len(lesson_content)
        if content_length < 3000:
            section_focuses = section_focuses[:3]
        elif content_length < 6000:
            section_focuses = section_focuses[:4]
        elif content_length < 10000:
            section_focuses = section_focuses[:5]
        
        total_sections = len(section_focuses)
        print(f"Generating {total_sections} sections...\n")
        
        # Generate each section separately
        all_sections = []
        
        for i, focus in enumerate(section_focuses, 1):
            try:
                section = generate_section_content(
                    model=model,
                    lesson_name=lesson_name,
                    lesson_content=lesson_content,
                    section_number=i,
                    total_sections=total_sections,
                    section_focus=focus,
                    user_performance=user_performance
                )
                all_sections.append(section)
            except Exception as e:
                print(f"  ✗ Error generating section {i}: {str(e)}")
                print(f"  Continuing with remaining sections...")
                # Continue with other sections even if one fails
                continue
        
        if len(all_sections) == 0:
            raise Exception("Failed to generate any sections")
        
        print("\n" + "="*60)
        print(f"✓ GENERATION COMPLETE: {len(all_sections)}/{total_sections} sections")
        print("="*60)
        
        # Summary
        for i, section in enumerate(all_sections, 1):
            print(f"  Section {i}: {section.get('title', 'Untitled')}")
            print(f"    - Content: {len(section.get('content', ''))} characters")
            print(f"    - Questions: {len(section.get('questions', []))}")
        
        return {"sections": all_sections}
        
    except Exception as e:
        print(f"\n✗ FATAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Failed to generate study materials: {str(e)}")