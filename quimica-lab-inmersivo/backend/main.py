"""
Backend principal para Química I - Lab Inmersivo
Configuración de FastAPI, CORS y rutas estáticas
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

# Importar routers
from backend.api_ia import router as ia_router
from backend.molecules import router as molecules_router

# Crear aplicación FastAPI
app = FastAPI(
    title="Química I - Lab Inmersivo",
    description="Aplicación web educativa con visualización 3D y tutoría IA",
    version="1.0.0"
)

# Configurar CORS para permitir conexiones locales
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "file://"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers de API
app.include_router(ia_router, prefix="/api", tags=["IA Tutor"])
app.include_router(molecules_router, prefix="/api", tags=["Moléculas"])

# Servir archivos estáticos del frontend
frontend_path = Path(__file__).parent.parent / "frontend"
app.mount("/css", StaticFiles(directory=str(frontend_path / "css")), name="css")
app.mount("/js", StaticFiles(directory=str(frontend_path / "js")), name="js")

# Ruta principal - servir index.html
@app.get("/")
async def root():
    """Sirve el archivo principal del frontend"""
    return FileResponse(frontend_path / "index.html")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Verifica que el servidor esté funcionando"""
    return {"status": "healthy", "message": "Química I - Lab Inmersivo API activa"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
