/**
 * Módulo de Chat con Tutor IA
 * Maneja la comunicación con el backend para obtener respuestas del tutor de química
 */

// Historial de conversación
let chatHistory = [];
const MAX_HISTORY_LENGTH = 10; // Mantener últimos 10 mensajes para contexto

/**
 * Inicializa el sistema de chat cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeChatListeners();
});

/**
 * Configura los event listeners para el chat
 */
function initializeChatListeners() {
    const sendBtn = document.getElementById('sendBtn');
    const clearBtn = document.getElementById('clearBtn');
    const chatInput = document.getElementById('chatInput');
    
    // Enviar mensaje con botón
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    // Limpiar chat
    if (clearBtn) {
        clearBtn.addEventListener('click', clearChat);
    }
    
    // Enviar con Enter
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

/**
 * Envía un mensaje al tutor IA
 */
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (!chatInput) return;
    
    const message = chatInput.value.trim();
    
    // No enviar mensajes vacíos
    if (!message) {
        showToast('Por favor escribe una pregunta', 'warning');
        return;
    }
    
    // Agregar mensaje del usuario al chat
    addMessageToChat(message, 'user');
    
    // Limpiar input
    chatInput.value = '';
    
    // Mostrar spinner de carga
    if (loadingSpinner) {
        loadingSpinner.classList.remove('d-none');
    }
    
    // Deshabilitar input mientras carga
    chatInput.disabled = true;
    
    try {
        // Preparar historial para enviar
        const historyToSend = chatHistory.slice(-MAX_HISTORY_LENGTH);
        
        // Intentar conectar con el backend
        const response = await postToAPI('/api/chat', {
            message: message,
            history: historyToSend.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }))
        });
        
        // Agregar respuesta al chat
        if (response && response.response) {
            addMessageToChat(response.response, 'assistant');
            
            // Actualizar historial
            chatHistory.push({ sender: 'user', text: message });
            chatHistory.push({ sender: 'assistant', text: response.response });
            
            // Mantener historial limitado
            if (chatHistory.length > MAX_HISTORY_LENGTH * 2) {
                chatHistory = chatHistory.slice(-MAX_HISTORY_LENGTH * 2);
            }
        } else {
            throw new Error('Respuesta inválida del servidor');
        }
        
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        
        // Mostrar mensaje de error
        addMessageToChat(
            'Lo siento, no pude conectarme con el tutor. Verifica que el backend esté ejecutándose.',
            'system'
        );
        
        // En modo demo, mostrar respuesta simulada
        if (AppState.currentMode === 'professor') {
            setTimeout(() => {
                const demoResponse = generateDemoResponse(message);
                addMessageToChat(demoResponse, 'assistant');
            }, 1000);
        }
    } finally {
        // Ocultar spinner
        if (loadingSpinner) {
            loadingSpinner.classList.add('d-none');
        }
        
        // Rehabilitar input
        chatInput.disabled = false;
        chatInput.focus();
    }
}

/**
 * Agrega un mensaje al área de chat
 * @param {string} text - Texto del mensaje
 * @param {string} sender - Remitente ('user', 'assistant', 'system')
 */
function addMessageToChat(text, sender = 'user') {
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatMessages) return;
    
    // Limpiar mensaje de bienvenida si es el primer mensaje
    const welcomeMessage = chatMessages.querySelector('.text-center');
    if (welcomeMessage) {
        chatMessages.innerHTML = '';
    }
    
    // Crear elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    // Formatear texto (convertir saltos de línea y fórmulas químicas)
    let formattedText = formatMessageText(text);
    
    messageDiv.innerHTML = formattedText;
    
    // Agregar al chat
    chatMessages.appendChild(messageDiv);
    
    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Formatea el texto del mensaje para mostrar
 * @param {string} text - Texto original
 * @returns {string} - HTML formateado
 */
function formatMessageText(text) {
    // Convertir saltos de línea a <br>
    let formatted = text.replace(/\n/g, '<br>');
    
    // Formatear fórmulas químicas (subíndices)
    formatted = formatted.replace(/([A-Z][a-z]?)(\d+)/g, '$1<sub>$2</sub>');
    
    // Formatear superíndices para cargas
    formatted = formatted.replace(/([+-])(\d*)/g, '<sup>$1$2</sup>');
    
    // Resaltar términos importantes entre **
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return formatted;
}

/**
 * Limpia todo el chat
 */
function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatMessages) return;
    
    chatMessages.innerHTML = `
        <div class="text-center text-muted">
            <i class="bi bi-chat-square-text fs-1"></i>
            <p class="mt-2">Inicia una conversación con el tutor de química</p>
            <small>Ejemplo: "¿Qué es la geometría molecular?"</small>
        </div>
    `;
    
    // Limpiar historial
    chatHistory = [];
    
    console.log('Chat limpiado');
}

/**
 * Genera una respuesta de demostración (cuando no hay backend)
 * @param {string} question - Pregunta del usuario
 * @returns {string} - Respuesta simulada
 */
function generateDemoResponse(question) {
    const q = question.toLowerCase();
    
    if (q.includes('geometría') || q.includes('geometria')) {
        return `**Geometría Molecular**\n\nLa geometría molecular describe la disposición tridimensional de los átomos en una molécula. Se determina usando la teoría **VSEPR** (Repulsión de Pares de Electrones de la Capa de Valencia).\n\nLos factores clave son:\n• Pares enlazantes\n• Pares solitarios\n\n¿Te gustaría que exploremos alguna molécula específica en el visor 3D?`;
    }
    
    if (q.includes('ácido') || q.includes('acido') || q.includes('ph')) {
        return `**Ácidos y pH**\n\nUn ácido es una sustancia que dona protones (H⁺) en solución acuosa.\n\nEl **pH** mide la acidez:\n• pH < 7: Ácido\n• pH = 7: Neutro\n• pH > 7: Básico\n\nFórmula: pH = -log[H⁺]\n\n¿Quieres profundizar en algún concepto específico?`;
    }
    
    if (q.includes('equilibrio') || q.includes('ka') || q.includes('kb')) {
        return `**Equilibrio Iónico**\n\nEn una reacción reversible, el equilibrio se alcanza cuando las velocidades de reacción directa e inversa son iguales.\n\nPara ácidos débiles:\n**Ka = [H⁺][A⁻] / [HA]**\n\nPara bases débiles:\n**Kb = [BH⁺][OH⁻] / [B]**\n\nRelación: Ka × Kb = Kw = 10⁻¹⁴\n\n¿Necesitas ayuda con algún cálculo?`;
    }
    
    if (q.includes('molécula') || q.includes('molecula') || q.includes('enlace')) {
        return `**Estructura Molecular**\n\nLas moléculas están formadas por átomos unidos mediante enlaces químicos:\n\n• **Enlace covalente**: Compartición de electrones\n• **Enlace iónico**: Transferencia de electrones\n• **Enlace metálico**: Electrones deslocalizados\n\nLa geometría depende de los pares de electrones alrededor del átomo central.\n\n¡Revisa la sección de Geometría Molecular para ver ejemplos 3D!`;
    }
    
    // Respuesta genérica
    return `¡Excelente pregunta! Como tutor de Química I, puedo ayudarte con:\n\n• **Geometría Molecular** - Teoría VSEPR y visualización 3D\n• **Ácidos y Bases** - Propiedades, clasificación y pH\n• **Equilibrio Iónico** - Constantes Ka, Kb y cálculos\n• **Enlaces Químicos** - Estructura y propiedades\n\n¿Sobre qué tema específico te gustaría aprender más?`;
}

/**
 * Exporta funciones globales
 */
window.sendMessage = sendMessage;
window.addMessageToChat = addMessageToChat;
window.clearChat = clearChat;
window.chatHistory = chatHistory;
