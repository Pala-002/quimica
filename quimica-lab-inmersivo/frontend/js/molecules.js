/**
 * Módulo de Visualización 3D de Moléculas
 * Usa 3Dmol.js para renderizar estructuras moleculares interactivas
 */

// Almacena las moléculas cargadas
let moleculesData = [];
let currentViewer = null;

// Coordenadas atómicas hardcoded para las 8 moléculas de la tabla
// Formato: elemento, x, y, z (en Angstroms)
const MOLECULE_COORDINATES = {
    'CO2': {
        atoms: [
            { element: 'C', x: 0.0, y: 0.0, z: 0.0 },
            { element: 'O', x: -1.16, y: 0.0, z: 0.0 },
            { element: 'O', x: 1.16, y: 0.0, z: 0.0 }
        ],
        bonds: [
            { start: 0, end: 1, order: 2 },
            { start: 0, end: 2, order: 2 }
        ]
    },
    'BF3': {
        atoms: [
            { element: 'B', x: 0.0, y: 0.0, z: 0.0 },
            { element: 'F', x: 0.0, y: 1.30, z: 0.0 },
            { element: 'F', x: 1.13, y: -0.65, z: 0.0 },
            { element: 'F', x: -1.13, y: -0.65, z: 0.0 }
        ],
        bonds: [
            { start: 0, end: 1, order: 1 },
            { start: 0, end: 2, order: 1 },
            { start: 0, end: 3, order: 1 }
        ]
    },
    'SO2': {
        atoms: [
            { element: 'S', x: 0.0, y: 0.0, z: 0.0 },
            { element: 'O', x: -1.43, y: 0.0, z: 0.0 },
            { element: 'O', x: 0.72, y: 1.24, z: 0.0 }
        ],
        bonds: [
            { start: 0, end: 1, order: 2 },
            { start: 0, end: 2, order: 2 }
        ]
    },
    'CH4': {
        atoms: [
            { element: 'C', x: 0.0, y: 0.0, z: 0.0 },
            { element: 'H', x: 0.63, y: 0.63, z: 0.63 },
            { element: 'H', x: -0.63, y: -0.63, z: 0.63 },
            { element: 'H', x: -0.63, y: 0.63, z: -0.63 },
            { element: 'H', x: 0.63, y: -0.63, z: -0.63 }
        ],
        bonds: [
            { start: 0, end: 1, order: 1 },
            { start: 0, end: 2, order: 1 },
            { start: 0, end: 3, order: 1 },
            { start: 0, end: 4, order: 1 }
        ]
    },
    'NH3': {
        atoms: [
            { element: 'N', x: 0.0, y: 0.0, z: 0.11 },
            { element: 'H', x: 0.94, y: 0.0, z: -0.25 },
            { element: 'H', x: -0.47, y: 0.81, z: -0.25 },
            { element: 'H', x: -0.47, y: -0.81, z: -0.25 }
        ],
        bonds: [
            { start: 0, end: 1, order: 1 },
            { start: 0, end: 2, order: 1 },
            { start: 0, end: 3, order: 1 }
        ]
    },
    'H2O': {
        atoms: [
            { element: 'O', x: 0.0, y: 0.0, z: 0.0 },
            { element: 'H', x: 0.76, y: 0.59, z: 0.0 },
            { element: 'H', x: -0.76, y: 0.59, z: 0.0 }
        ],
        bonds: [
            { start: 0, end: 1, order: 1 },
            { start: 0, end: 2, order: 1 }
        ]
    },
    'PCl5': {
        atoms: [
            { element: 'P', x: 0.0, y: 0.0, z: 0.0 },
            { element: 'Cl', x: 0.0, y: 0.0, z: 2.04 },
            { element: 'Cl', x: 0.0, y: 0.0, z: -2.04 },
            { element: 'Cl', x: 1.98, y: 0.0, z: 0.0 },
            { element: 'Cl', x: -0.99, y: 1.71, z: 0.0 },
            { element: 'Cl', x: -0.99, y: -1.71, z: 0.0 }
        ],
        bonds: [
            { start: 0, end: 1, order: 1 },
            { start: 0, end: 2, order: 1 },
            { start: 0, end: 3, order: 1 },
            { start: 0, end: 4, order: 1 },
            { start: 0, end: 5, order: 1 }
        ]
    },
    'SF6': {
        atoms: [
            { element: 'S', x: 0.0, y: 0.0, z: 0.0 },
            { element: 'F', x: 0.0, y: 0.0, z: 1.56 },
            { element: 'F', x: 0.0, y: 0.0, z: -1.56 },
            { element: 'F', x: 1.56, y: 0.0, z: 0.0 },
            { element: 'F', x: -1.56, y: 0.0, z: 0.0 },
            { element: 'F', x: 0.0, y: 1.56, z: 0.0 },
            { element: 'F', x: 0.0, y: -1.56, z: 0.0 }
        ],
        bonds: [
            { start: 0, end: 1, order: 1 },
            { start: 0, end: 2, order: 1 },
            { start: 0, end: 3, order: 1 },
            { start: 0, end: 4, order: 1 },
            { start: 0, end: 5, order: 1 },
            { start: 0, end: 6, order: 1 }
        ]
    }
};

/**
 * Carga las moléculas desde el backend
 */
async function loadMolecules() {
    const moleculesList = document.getElementById('moleculesList');
    
    try {
        // Intentar cargar desde API
        const data = await fetchFromAPI('/api/molecules');
        moleculesData = data.molecules || [];
        
        renderMoleculesList(moleculesData);
        
    } catch (error) {
        console.warn('No se pudo conectar al backend, usando datos locales');
        
        // Datos fallback en caso de no tener backend
        moleculesData = [
            { id: 1, formula: 'CO2', name: 'Dióxido de carbono', bonding_pairs: 2, lone_pairs: 0, geometry: 'Lineal', angle: '180º' },
            { id: 2, formula: 'BF3', name: 'Trifluoruro de boro', bonding_pairs: 3, lone_pairs: 0, geometry: 'Trigonal plana', angle: '120°' },
            { id: 3, formula: 'SO2', name: 'Dióxido de azufre', bonding_pairs: 3, lone_pairs: 1, geometry: 'Angular', angle: '<120°' },
            { id: 4, formula: 'CH4', name: 'Metano', bonding_pairs: 4, lone_pairs: 0, geometry: 'Tetraédrica', angle: '109.5°' },
            { id: 5, formula: 'NH3', name: 'Amoníaco', bonding_pairs: 4, lone_pairs: 1, geometry: 'Piramidal trigonal', angle: '<109.5°' },
            { id: 6, formula: 'H2O', name: 'Agua', bonding_pairs: 4, lone_pairs: 2, geometry: 'Angular', angle: '104.5°' },
            { id: 7, formula: 'PCl5', name: 'Pentacloruro de fósforo', bonding_pairs: 5, lone_pairs: 0, geometry: 'Bipiramidal trigonal', angle: '90° y 120°' },
            { id: 8, formula: 'SF6', name: 'Hexafluoruro de azufre', bonding_pairs: 6, lone_pairs: 0, geometry: 'Octaédrica', angle: '90°' }
        ];
        
        renderMoleculesList(moleculesData);
    }
}

/**
 * Renderiza la lista de moléculas en el sidebar
 * @param {Array} molecules - Array de moléculas
 */
function renderMoleculesList(molecules) {
    const moleculesList = document.getElementById('moleculesList');
    
    if (!moleculesList) return;
    
    moleculesList.innerHTML = '';
    
    molecules.forEach((molecule, index) => {
        const item = document.createElement('button');
        item.className = 'list-group-item list-group-item-action';
        item.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${molecule.formula}</h6>
                <small class="text-muted">${molecule.geometry}</small>
            </div>
            <p class="mb-1 small text-muted">${molecule.name}</p>
        `;
        
        item.addEventListener('click', () => {
            // Remover active de todos
            document.querySelectorAll('.list-group-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Mostrar molécula
            displayMolecule(molecule);
        });
        
        moleculesList.appendChild(item);
    });
}

/**
 * Muestra una molécula en el visor 3D
 * @param {Object} molecule - Datos de la molécula
 */
function displayMolecule(molecule) {
    // Actualizar título
    const titleElement = document.getElementById('moleculeTitle');
    if (titleElement) {
        titleElement.textContent = `${molecule.formula} - ${molecule.name}`;
    }
    
    // Inicializar visor 3D
    const element = document.getElementById('gldiv');
    if (!element) return;
    
    // Limpiar visor anterior
    if (currentViewer) {
        currentViewer.clear();
    } else {
        currentViewer = $3Dmol.createViewer(element, {
            bgcolor: 'transparent',
            style: { outline: true }
        });
    }
    
    // Obtener coordenadas de la molécula
    const coords = MOLECULE_COORDINATES[molecule.formula];
    
    if (coords) {
        // Crear modelo a partir de coordenadas
        const model = currentViewer.addModel();
        
        // Agregar átomos
        coords.atoms.forEach(atom => {
            model.addAtom(atom.element, atom.x, atom.y, atom.z);
        });
        
        // Agregar enlaces
        coords.bonds.forEach(bond => {
            model.addBond(bond.start, bond.end, bond.order);
        });
        
        // Estilizar la molécula
        model.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.3 } });
        
        // Centrar y hacer zoom
        currentViewer.zoomTo();
        currentViewer.render();
        
    } else {
        // Mostrar mensaje si no hay coordenadas
        console.warn(`No hay coordenadas para ${molecule.formula}`);
    }
    
    // Mostrar información de la molécula
    displayMoleculeInfo(molecule);
}

/**
 * Muestra la información detallada de la molécula
 * @param {Object} molecule - Datos de la molécula
 */
function displayMoleculeInfo(molecule) {
    const infoPanel = document.getElementById('moleculeInfo');
    
    if (!infoPanel) return;
    
    // Llenar datos
    document.getElementById('infoFormula').textContent = molecule.formula;
    document.getElementById('infoName').textContent = molecule.name;
    document.getElementById('infoGeometry').textContent = molecule.geometry;
    document.getElementById('infoAngle').textContent = molecule.angle;
    document.getElementById('infoBonding').textContent = molecule.bonding_pairs;
    document.getElementById('infoLone').textContent = molecule.lone_pairs;
    document.getElementById('infoExamples').textContent = molecule.example_of || molecule.formula;
    
    // Mostrar panel
    infoPanel.classList.remove('d-none');
    infoPanel.classList.add('fade-in');
}

/**
 * Reinicia el visor 3D
 */
function resetViewer() {
    if (currentViewer) {
        currentViewer.clear();
        currentViewer.render();
    }
    
    const titleElement = document.getElementById('moleculeTitle');
    if (titleElement) {
        titleElement.textContent = 'Selecciona una molécula';
    }
    
    const infoPanel = document.getElementById('moleculeInfo');
    if (infoPanel) {
        infoPanel.classList.add('d-none');
    }
}

// Hacer funciones disponibles globalmente
window.loadMolecules = loadMolecules;
window.displayMolecule = displayMolecule;
window.resetViewer = resetViewer;
window.MOLECULE_COORDINATES = MOLECULE_COORDINATES;
