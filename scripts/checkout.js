
// LÓGICA DEL CHECKOUT


let carrito = [];
let pasoActual = 'resumen';
let datosPasajero = {};


// INICIALIZACIÓN


cargarCarrito();
inicializarCheckout();
mostrarResumen();
mostrarResumenLateral();


// CARGAR CARRITO


function cargarCarrito() {
    carrito = obtenerDelStorage('travelar_carrito') || [];
    
    if (carrito.length === 0) {
        window.location.href = '../index.html';
        return;
    }

    // Actualizar contador
    document.getElementById('contadorCarrito').textContent = carrito.length;
}


// INICIALIZAR EVENTOS


function inicializarCheckout() {
    // Formulario de datos
    document.getElementById('formDatosCheckout').addEventListener('submit', (e) => {
        e.preventDefault();
        validarYGuardarDatos();
    });

    // Formulario de pago
    document.getElementById('formPago').addEventListener('submit', (e) => {
        e.preventDefault();
        procesarPago();
    });

    // Mostrar/ocultar campos de tarjeta
    document.getElementById('metodoPago').addEventListener('change', mostrarCamposPago);

    // Formatear números de tarjeta
    document.getElementById('numeroTarjeta')?.addEventListener('input', formatearNumeroTarjeta);

    // Formatear vencimiento
    document.getElementById('vencimiento')?.addEventListener('input', formatearVencimiento);

    // Solo números en CVV
    document.getElementById('cvv')?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}


// MOSTRAR RESUMEN


function mostrarResumen() {
    const contenedor = document.getElementById('resumenReservas');
    
    let html = '<div class="reservas-lista">';
    
    carrito.forEach((reserva, idx) => {
        const checkinDate = new Date(reserva.checkin).toLocaleDateString('es-AR');
        const checkoutDate = new Date(reserva.checkout).toLocaleDateString('es-AR');
        
        html += `
            <div class="reserva-card">
                <div class="reserva-header">
                    <h3>${reserva.destino.nombre}</h3>
                    <span class="badge-categoria">${reserva.categoria}</span>
                </div>
                <div class="reserva-detalles">
                    <p><strong>Fechas:</strong> ${checkinDate} → ${checkoutDate}</p>
                    <p><strong>Duración:</strong> ${reserva.dias} noches</p>
                    <p><strong>Personas:</strong> ${reserva.personas}</p>
                    ${reserva.pais ? `<p><strong>País:</strong> ${reserva.pais}</p>` : ''}
                    ${reserva.destino.ciudad ? `<p><strong>Ciudad:</strong> ${reserva.destino.ciudad}</p>` : ''}
                    ${reserva.extras && reserva.extras.length > 0 ? `
                        <p><strong>Extras:</strong></p>
                        <ul>${reserva.extras.map(e => `<li>${e.nombre} - $${e.precio.toLocaleString()}</li>`).join('')}</ul>
                    ` : ''}
                </div>
                <div class="reserva-precio">
                    <strong>$${reserva.total.toLocaleString()}</strong>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    contenedor.innerHTML = html;
}

function mostrarResumenLateral() {
    const total = calcularTotalCarrito(carrito);
    const contenedor = document.getElementById('resumenLateral');
    
    let html = `
        <div class="resumen-items">
    `;
    
    carrito.forEach(reserva => {
        html += `
            <div class="resumen-item-lateral">
                <span>${reserva.destino.nombre}</span>
                <span>$${reserva.total.toLocaleString()}</span>
            </div>
        `;
    });
    
    html += `
        </div>
        <div class="resumen-divider"></div>
        <div class="resumen-total">
            <span>Total a pagar:</span>
            <span class="total-monto">$${total.toLocaleString()}</span>
        </div>
        <p class="resumen-nota">Los precios incluyen impuestos.</p>
    `;
    
    contenedor.innerHTML = html;
}


// NAVEGACIÓN ENTRE PASOS


function irAlPaso(paso) {
    const pasos = ['resumen', 'datos', 'pago'];
    
    if (!pasos.includes(paso)) return;
    
    pasoActual = paso;
    
    // Ocultar todos los pasos
    document.querySelectorAll('.checkout-step').forEach(el => {
        el.classList.remove('active');
    });
    
    // Mostrar paso actual
    document.getElementById(`step${paso.charAt(0).toUpperCase() + paso.slice(1)}`).classList.add('active');
    
    // Actualizar indicadores
    document.querySelectorAll('.checkout-steps .step').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`[data-step="${paso}"]`)?.classList.add('active');
    
    // Scroll al contenido
    document.querySelector('.checkout-form').scrollIntoView({ behavior: 'smooth' });
}

function volverAlHero() {
    window.location.href = '../index.html';
}


// VALIDAR Y GUARDAR DATOS


function validarYGuardarDatos() {
    const nombre = document.getElementById('checkoutNombre').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const dni = document.getElementById('checkoutDNI').value.trim();
    const telefono = document.getElementById('checkoutTelefono').value.trim();
    const pais = document.getElementById('checkoutPais').value.trim();
    const ciudad = document.getElementById('checkoutCiudad').value.trim();
    
    // Validaciones
    if (!nombre || nombre.length < 3) {
        mostrarAlerta('El nombre debe tener al menos 3 caracteres', 'error');
        return;
    }
    
    if (!validarEmail(email)) {
        mostrarAlerta('Email no válido', 'error');
        return;
    }
    
    if (!validarDNI(dni)) {
        mostrarAlerta('DNI no válido (debe tener 7-8 dígitos)', 'error');
        return;
    }
    
    if (!validarTelefono(telefono)) {
        mostrarAlerta('Teléfono no válido', 'error');
        return;
    }
    
    if (!ciudad) {
        mostrarAlerta('Debe seleccionar una ciudad', 'error');
        return;
    }
    
    // Guardar datos
    datosPasajero = {
        nombre,
        email,
        dni,
        telefono,
        pais,
        ciudad
    };
    
    mostrarAlerta('Datos guardados correctamente', 'success');
    setTimeout(() => {
        irAlPaso('pago');
    }, 1000);
}


// PAGO


function mostrarCamposPago() {
    const metodo = document.getElementById('metodoPago').value;
    
    const datosTarjeta = document.getElementById('datosTarjeta');
    const datosTransferencia = document.getElementById('datosTransferencia');
    
    datosTarjeta.style.display = 'none';
    datosTransferencia.style.display = 'none';
    
    // Limpiar validaciones anteriores
    document.querySelectorAll('#datosTarjeta input, #datosTarjeta select').forEach(el => {
        el.removeAttribute('required');
    });
    
    if (metodo === 'tarjeta-credito' || metodo === 'tarjeta-debito') {
        datosTarjeta.style.display = 'block';
        document.querySelectorAll('#datosTarjeta input[type="text"], #datosTarjeta input[type="tel"], #datosTarjeta select').forEach(el => {
            el.setAttribute('required', 'required');
        });
    } else if (metodo === 'transferencia') {
        datosTransferencia.style.display = 'block';
    }
}

function formatearNumeroTarjeta(e) {
    let valor = e.target.value.replace(/\D/g, '');
    let formateado = valor.match(/.{1,4}/g)?.join(' ') || valor;
    e.target.value = formateado.substring(0, 19);
}

function formatearVencimiento(e) {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length >= 2) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
    }
    e.target.value = valor.substring(0, 5);
}

function procesarPago() {
    // Validar datos pasajero
    if (!datosPasajero.nombre) {
        mostrarAlerta('Por favor completa los datos personales primero', 'error');
        irAlPaso('datos');
        return;
    }
    
    const metodo = document.getElementById('metodoPago').value;
    
    if (!metodo) {
        mostrarAlerta('Selecciona un método de pago', 'error');
        return;
    }
    
    // Validar términos
    if (!document.getElementById('aceptoTerminos').checked) {
        mostrarAlerta('Debes aceptar los términos y condiciones', 'error');
        return;
    }
    
    // Validar datos de tarjeta si corresponde
    if (metodo === 'tarjeta-credito' || metodo === 'tarjeta-debito') {
        const numeroTarjeta = document.getElementById('numeroTarjeta').value.replace(/\s/g, '');
        const vencimiento = document.getElementById('vencimiento').value;
        const cvv = document.getElementById('cvv').value;
        const titular = document.getElementById('titularTarjeta').value;
        
        if (numeroTarjeta.length !== 16 || !/^\d+$/.test(numeroTarjeta)) {
            mostrarAlerta('Número de tarjeta inválido', 'error');
            return;
        }
        
        if (!vencimiento || !/^\d{2}\/\d{2}$/.test(vencimiento)) {
            mostrarAlerta('Vencimiento inválido (formato MM/YY)', 'error');
            return;
        }
        
        if (cvv.length !== 3 || !/^\d+$/.test(cvv)) {
            mostrarAlerta('CVV inválido', 'error');
            return;
        }
        
        if (!titular) {
            mostrarAlerta('Nombre del titular requerido', 'error');
            return;
        }
    }
    
    // Simular procesamiento
    mostrarAlerta('Procesando pago...', 'info');
    
    setTimeout(() => {
        finalizarCompra();
    }, 2000);
}


// FINALIZAR COMPRA


function finalizarCompra() {
    // Validaciones finales
    if (!datosPasajero || !datosPasajero.nombre) {
        mostrarAlerta('Error: falta información del pasajero', 'error');
        return;
    }
    
    if (!carrito || carrito.length === 0) {
        mostrarAlerta('Error: carrito vacío', 'error');
        return;
    }

    try {
        // Crear objeto de confirmación con estructura completa
        const confirmacion = {
            numeroReserva: generarNumeroReserva(),
            codigoConfirmacion: generarCodigoConfirmacion(),
            fechaEmision: new Date().toISOString(),
            pasajero: datosPasajero,
            carrito: carrito,
            totalPagado: calcularTotalCarrito(carrito)
        };

        // Guardar en historial de confirmaciones
        const historial = obtenerDelStorage('travelar_confirmaciones') || [];
        historial.push(confirmacion);
        guardarEnStorage('travelar_confirmaciones', historial);

        // Guardar también en sessionStorage para confirmacion.html
        sessionStorage.setItem('travelar_confirmacion', JSON.stringify(confirmacion));

        // Limpiar el carrito del localStorage
        localStorage.removeItem('travelar_carrito');

        // Mostrar alerta de éxito
        mostrarAlerta('¡Compra finalizada exitosamente!', 'success');

        // Redirigir a la página de confirmación
        setTimeout(() => {
            window.location.href = './confirmacion.html';
        }, 1500);
    } catch (error) {
        console.error('Error al finalizar compra:', error);
        mostrarAlerta('Error al procesar la compra. Por favor intenta nuevamente.', 'error');
    }
}


// UTILIDADES


function mostrarAlerta(mensaje, tipo = 'info') {
    const div = document.createElement('div');
    div.className = `alert alert-${tipo}`;
    div.textContent = mensaje;
    document.body.insertBefore(div, document.body.firstChild);
    
    setTimeout(() => {
        div.classList.add('show');
    }, 10);
    
    if (tipo !== 'info') {
        setTimeout(() => {
            div.classList.remove('show');
            setTimeout(() => div.remove(), 300);
        }, 3000);
    }
}

// Traer funciones globales de logicareserva.js
function obtenerDelStorage(clave) {
    try {
        const datos = localStorage.getItem(clave);
        return datos ? JSON.parse(datos) : null;
    } catch (error) {
        console.error('Error al obtener de localStorage:', error);
        return null;
    }
}

function guardarEnStorage(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        return false;
    }
}

function vaciarCarrito() {
    localStorage.removeItem('travelar_carrito');
}

function calcularTotalCarrito(carrito) {
    return carrito.reduce((sum, reserva) => sum + (reserva.total || 0), 0);
}

function generarConfirmacion(carrito, datosPasajero) {
    const confirmacion = {
        numeroReserva: generarNumeroReserva(),
        codigoConfirmacion: generarCodigoConfirmacion(),
        fecha: new Date().toISOString(),
        pasajero: datosPasajero,
        reservas: carrito,
        total: calcularTotalCarrito(carrito)
    };

    const historial = obtenerDelStorage('travelar_confirmaciones') || [];
    historial.push(confirmacion);
    guardarEnStorage('travelar_confirmaciones', historial);

    return confirmacion;
}

function generarNumeroReserva() {
    const fecha = new Date();
    const year = fecha.getFullYear().toString().slice(-2);
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const numero = String(Math.floor(Math.random() * 100000)).padStart(6, '0');
    return `TR-${year}${mes}-${numero}`;
}

function generarCodigoConfirmacion() {
    return 'CONF-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarDNI(dni) {
    return /^\d{7,8}$/.test(dni.toString());
}

function validarTelefono(telefono) {
    return /^\+?[\d\s\-\(\)]{10,}$/.test(telefono);
}
