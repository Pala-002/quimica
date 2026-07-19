"""
Endpoint para obtener datos de moléculas y geometrías
Lee desde el archivo JSON local data/molecules.json
"""

from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

router = APIRouter()

# Ruta al archivo de datos
DATA_FILE = Path(__file__).parent.parent / "data" / "molecules.json"

@router.get("/molecules")
async def get_molecules():
    """
    Obtiene la lista completa de moléculas con sus geometrías
    
    Devuelve todos los datos del archivo molecules.json incluyendo:
    - Fórmula química
    - Nombre
    - Pares enlazantes
    - Pares solitarios
    - Geometría molecular
    - Ángulo de enlace
    - Ejemplos adicionales
    """
    try:
        if not DATA_FILE.exists():
            raise HTTPException(
                status_code=404, 
                detail="Archivo de moléculas no encontrado"
            )
        
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return data
    
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500, 
            detail="Error al parsear el archivo JSON"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error interno: {str(e)}"
        )

@router.get("/molecules/{formula}")
async def get_molecule_by_formula(formula: str):
    """
    Obtiene una molécula específica por su fórmula
    
    Ejemplo: /molecules/H2O devuelve los datos del agua
    """
    try:
        if not DATA_FILE.exists():
            raise HTTPException(
                status_code=404, 
                detail="Archivo de moléculas no encontrado"
            )
        
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Buscar la molécula (búsqueda case-insensitive)
        for molecule in data['molecules']:
            if molecule['formula'].upper() == formula.upper():
                return molecule
        
        raise HTTPException(
            status_code=404, 
            detail=f"Molécula {formula} no encontrada"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error interno: {str(e)}"
        )
