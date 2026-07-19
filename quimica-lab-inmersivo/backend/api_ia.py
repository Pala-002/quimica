"""
API de Inteligencia Artificial para el Tutor de Química I
Conexión directa con OpenAI API (o IBM Watsonx)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

router = APIRouter()

# Modelos de datos
class Message(BaseModel):
    role: str  # "user" o "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    response: str
    model: str

# System Prompt para el tutor de química
SYSTEM_PROMPT = """Eres un tutor experto en Química I, especializado en:
- Geometría molecular y teoría VSEPR
- Ácidos, bases y sales
- Equilibrio iónico y constante de equilibrio
- Enlaces químicos y estructura atómica

Tu estilo de enseñanza:
1. Explica conceptos de manera clara y progresiva
2. Usa ejemplos concretos y analogías cuando sea posible
3. Fomenta el pensamiento crítico haciendo preguntas guiadas
4. Corrige errores conceptuales de manera constructiva
5. Adapta tu lenguaje al nivel del estudiante

Importante:
- Responde en español
- Sé conciso pero completo
- Usa notación química correcta (subíndices, superscripts)
- Si no sabes algo, admítelo honestamente"""

def get_openai_client():
    """Inicializa el cliente de OpenAI"""
    try:
        from openai import OpenAI
        api_key = os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            raise ValueError("OPENAI_API_KEY no configurada en .env")
        
        return OpenAI(api_key=api_key)
    except ImportError:
        raise ImportError("Instala openai: pip install openai")

async def call_openai_api(messages: List[dict]) -> str:
    """Llama a la API de OpenAI y devuelve la respuesta"""
    try:
        client = get_openai_client()
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # O usa "gpt-4" si tienes acceso
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error con OpenAI API: {str(e)}")

@router.post("/chat", response_model=ChatResponse)
async def chat_with_tutor(request: ChatRequest):
    """
    Endpoint para chatear con el tutor de Química I
    
    Recibe el mensaje del usuario y el historial de conversación,
    lo envía a la IA y devuelve la respuesta.
    """
    try:
        # Construir lista de mensajes para la API
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Agregar historial de conversación
        for msg in request.history:
            messages.append({"role": msg.role, "content": msg.content})
        
        # Agregar mensaje actual del usuario
        messages.append({"role": "user", "content": request.message})
        
        # Llamar a la API de OpenAI
        response_text = await call_openai_api(messages)
        
        return ChatResponse(
            response=response_text,
            model="gpt-3.5-turbo"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# Alternativa para IBM Watsonx (comentada, descomentar si se prefiere)
"""
async def call_watsonx_api(messages: List[dict]) -> str:
    Llama a IBM Watsonx API
    
    from ibm_watsonx_ai.foundation_models import ModelInference
    from ibm_watsonx_ai.credentials import Credentials
    
    api_key = os.getenv("WATSONX_API_KEY")
    project_id = os.getenv("WATSONX_PROJECT_ID")
    
    credentials = Credentials(
        url="https://us-south.ml.cloud.ibm.com",
        api_key=api_key
    )
    
    model = ModelInference(
        model_id="meta-llama/llama-3-70b-instruct",
        credentials=credentials,
        project_id=project_id
    )
    
    # Formatear mensajes para Watsonx
    prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
    response = model.generate(prompt=prompt)
    
    return response['results'][0]['generated_text']
"""
