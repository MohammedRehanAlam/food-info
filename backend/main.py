from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import io
from PIL import Image
import google.generativeai as genai
import base64

load_dotenv()

app = FastAPI(title="Food Analyzer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def process_image(image):
    # Convert image to RGB if it's not
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize image if it's too large (max 4MB after base64 encoding)
    max_size = (1024, 1024)
    image.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    # Convert to bytes
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    
    return img_byte_arr

@app.post("/analyze-food")
async def analyze_food(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        processed_image = process_image(image)

        # Prepare the prompt for food analysis
        prompt = """
        Analyze this food image and provide:
        1. Food name
        2. Calories (kcal)
        3. Protein (g)
        4. Carbs (g)
        5. Fat (g)
        6. Brief health benefits

        Return in this exact format:
        food_name: [name]
        calories: [number] kcal
        protein: [number] g
        carbs: [number] g
        fat: [number] g
        benefits: [text]
        """

        # Generate content using Gemini
        response = model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": processed_image}
        ])

        # Parse response
        try:
            response_lines = response.text.strip().split('\n')
            data = {}
            for line in response_lines:
                if ':' in line:
                    key, value = line.split(':', 1)
                    data[key.strip()] = value.strip()

            # Format the results
            results = [{
                "food_item": data.get('food_name', 'Unknown food'),
                "nutritional_info": {
                    "calories": data.get('calories', 'N/A'),
                    "protein": data.get('protein', 'N/A'),
                    "carbs": data.get('carbs', 'N/A'),
                    "fat": data.get('fat', 'N/A'),
                    "details": data.get('benefits', 'No information available')
                }
            }]

            return {"results": results}

        except Exception as e:
            print(f"Error parsing Gemini response: {str(e)}")
            print(f"Raw response: {response.text}")
            raise HTTPException(
                status_code=500,
                detail="Error processing AI response"
            )

    except Exception as e:
        print(f"Error in analyze_food: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing food: {str(e)}"
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 