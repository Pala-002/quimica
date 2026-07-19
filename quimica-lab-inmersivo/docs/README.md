# Química I - Lab Inmersivo

## Descripción del Proyecto
Prototipo de aplicación web local para el aprendizaje interactivo de Química I, con visualización 3D de moléculas y tutoría inteligente mediante IA.

## Prerrequisitos

### Software Requerido
- **Python 3.9+**: Para el backend FastAPI
- **pip**: Gestor de paquetes de Python
- **Navegador web moderno**: Chrome, Firefox, Edge (con soporte para WebGL)

### Dependencias del Backend
```bash
pip install fastapi uvicorn openai python-dotenv
```

## Estructura del Proyecto

```
quimica-lab-inmersivo/
├── backend/
│   ├── main.py          # Configuración principal de FastAPI
│   ├── api_ia.py        # Endpoint para comunicación con IA
│   └── molecules.py     # Endpoint para datos moleculares
├── frontend/
│   ├── index.html       # Punto de entrada principal
│   ├── css/
│   │   └── styles.css   # Estilos personalizados
│   └── js/
│       ├── app.js       # Lógica principal de la SPA
│       ├── molecules.js # Visualización 3D de moléculas
│       └── chat.js      # Sistema de chat con IA
├── data/
│   └── molecules.json   # Base de datos de geometrías moleculares
├── docs/
│   └── README.md        # Este archivo
└── .env                 # Variables de entorno (API keys)
```

## Instrucciones de Instalación

### Paso 1: Clonar/Navegar al proyecto
```bash
cd quimica-lab-inmersivo
```

### Paso 2: Instalar dependencias del backend
```bash
pip install fastapi uvicorn openai python-dotenv
```

### Paso 3: Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto con:
```env
OPENAI_API_KEY=tu_clave_api_aqui
# O si usas IBM Watsonx:
# WATSONX_API_KEY=tu_clave_watsonx
# WATSONX_PROJECT_ID=tu_project_id
```

### Paso 4: Levantar el servidor FastAPI
Desde la raíz del proyecto:
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en: `http://localhost:8000`

### Paso 5: Abrir el frontend
Abrir directamente en el navegador:
```
file:///ruta/a/quimica-lab-inmersivo/frontend/index.html
```

O servir los archivos estáticos desde FastAPI (recomendado):
El frontend se servirá automáticamente en `http://localhost:8000`

## Endpoints de la API

### GET /molecules
Devuelve la lista completa de moléculas con sus geometrías.

### POST /chat
Envía un mensaje al tutor de IA y recibe una respuesta.
Body: `{"message": "texto", "history": []}`

## Modos de Usuario

### Modo Estudiante
- Interfaz limpia y simplificada
- Sin acceso a configuraciones técnicas
- Enfocado en el aprendizaje

### Modo Profesor
- Acceso a consolas de desarrollo
- Configuración de parámetros de IA
- Herramientas de depuración

## Tecnologías Utilizadas

- **Backend**: Python 3.9+, FastAPI, Uvicorn
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **UI Framework**: Bootstrap 5.3
- **Visualización 3D**: 3Dmol.js
- **IA**: OpenAI API (o IBM Watsonx)
- **Base de Datos**: JSON local

## Notas Importantes

1. **Ejecución Local**: Todo el sistema corre 100% local, excepto las llamadas a la API de IA.
2. **CORS**: Configurado para permitir conexiones desde localhost.
3. **WebGL**: Necesario para la visualización 3D de moléculas.
4. **API Key**: Requiere una clave válida de OpenAI o IBM Watsonx.

## Solución de Problemas

### Error de CORS
Asegúrate de que el backend esté corriendo y que CORS esté habilitado correctamente.

### Error de visualización 3D
Verifica que tu navegador soporte WebGL y que JavaScript esté habilitado.

### Error de conexión con IA
Revisa que tu API key sea válida y tenga créditos disponibles.
