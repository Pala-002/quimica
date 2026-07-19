/**
 * Aplicación principal - Química I - Lab Inmersivo
 * Maneja la navegación SPA y el cambio de modos (Estudiante/Profesor)
 */

// Estado global de la aplicación
const AppState = {
    currentMode: 'student', // 'student' o 'professor'
    currentSection: 'molecules',
    apiConnected: false
};

// Configuración de la API
const API_BASE_URL = window.location.hostname === '' ? '' : window.location.origin;

/**
 * Inicializa la aplicación cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeModeSwitcher();
    checkAPIConnection();
    
    // Cargar moléculas inicialmente
    if (typeof loadMolecules === 'function') {
        loadMolecules();
    }
    
    console.log('🧪 Química I - Lab Inmersivo inicializado');
});

/**
 * Configura la navegación entre secciones
 */
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover clase active de todos los links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al link clickeado
            link.classList.add('active');
            
            // Ocultar todas las secciones
            sections.forEach(section => section.classList.add('d-none'));
            
            // Mostrar la sección seleccionada
            const sectionId = link.getAttribute('data-section') + '-section';
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.remove('d-none');
                targetSection.classList.add('fade-in');
            }
            
            // Actualizar estado
            AppState.currentSection = link.getAttribute('data-section');
            
            console.log(`Navegando a: ${AppState.currentSection}`);
        });
    });
}

/**
 * Configura el selector de modo (Estudiante/Profesor)
 */
function initializeModeSwitcher() {
    const modeDropdowns = document.querySelectorAll('[data-mode]');
    const currentModeLabel = document.getElementById('currentMode');
    const professorPanel = document.getElementById('professorPanel');
    
    modeDropdowns.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const newMode = item.getAttribute('data-mode');
            
            // Actualizar estado
            AppState.currentMode = newMode;
            
            // Actualizar label
            if (currentModeLabel) {
                currentModeLabel.textContent = newMode === 'student' 
                    ? 'Modo Estudiante' 
                    : 'Modo Profesor';
            }
            
            // Actualizar dropdown active state
            modeDropdowns.forEach(d => d.classList.remove('active'));
            item.classList.add('active');
            
            // Mostrar/ocultar panel de profesor
            if (professorPanel) {
                if (newMode === 'professor') {
                    professorPanel.classList.remove('d-none');
                    professorPanel.classList.add('slide-in');
                } else {
                    professorPanel.classList.add('d-none');
                }
            }
            
            console.log(`Modo cambiado a: ${newMode}`);
        });
    });
}

/**
 * Verifica la conexión con la API del backend
 */
async function checkAPIConnection() {
    const apiStatus = document.getElementById('apiStatus');
    
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'healthy') {
            AppState.apiConnected = true;
            
            if (apiStatus) {
                apiStatus.textContent = 'Conectado';
                apiStatus.classList.remove('bg-secondary');
                apiStatus.classList.add('bg-success');
            }
            
            console.log('✅ API conectada:', data.message);
        }
    } catch (error) {
        AppState.apiConnected = false;
        
        if (apiStatus) {
            apiStatus.textContent = 'Desconectado';
            apiStatus.classList.remove('bg-success');
            apiStatus.classList.add('bg-danger');
        }
        
        console.warn('⚠️ API no disponible (ejecutando en modo local):', error.message);
    }
}

/**
 * Obtiene datos del backend
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<any>} - Datos de la respuesta
 */
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching from API:', error);
        throw error;
    }
}

/**
 * Envía datos al backend
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a enviar
 * @returns {Promise<any>} - Respuesta de la API
 */
async function postToAPI(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error posting to API:', error);
        throw error;
    }
}

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación ('success', 'error', 'warning', 'info')
 */
function showToast(message, type = 'info') {
    // Crear elemento toast
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show`;
    toast.role = 'alert';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 150);
    }, 5000);
}

/**
 * Crea el contenedor de toasts si no existe
 */
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
    document.body.appendChild(container);
    return container;
}

/**
 * Formatea texto para mostrar fórmulas químicas
 * @param {string} text - Texto con fórmulas
 * @returns {string} - HTML formateado
 */
function formatChemicalFormulas(text) {
    // Reemplazar números subíndices
    text = text.replace(/([A-Z][a-z]?)(\d+)/g, '$1<sub>$2</sub>');
    // Reemplazar cargas
    text = text.replace(/([+-])(\d*)/g, '<sup>$1$2</sup>');
    return text;
}

// Exportar funciones globales
window.AppState = AppState;
window.fetchFromAPI = fetchFromAPI;
window.postToAPI = postToAPI;
window.showToast = showToast;
window.formatChemicalFormulas = formatChemicalFormulas;
