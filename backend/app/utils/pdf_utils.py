from PyPDF2 import PdfReader
from typing import Optional
import io

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract text from PDF file content
    
    Args:
        file_content: Binary content of the PDF file
        
    Returns:
        Extracted text from the PDF
    """
    try:
        # Create a file-like object from bytes
        pdf_file = io.BytesIO(file_content)
        
        # Create a PDF reader object
        reader = PdfReader(pdf_file)
        
        # Extract text from each page
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
                
        return "\n".join(text_parts)
        
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")
