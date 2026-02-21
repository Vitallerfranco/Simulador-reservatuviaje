
// LÓGICA DE RESERVA Y UTILIDADES


// Códigos de descuento válidos
const CODIGOS_VALIDOS = {
    'TRAVEL10': 0.10,
    'TRAVEL20': 0.20,
    'VIP20': 0.20,
    'SUMMER15': 0.15
};

// Multiplicadores de categoría
const MULTIPLICADORES_CATEGORIA = {
    economico: 1,
    premium: 1.25,
    lujo: 1.5
};


// FUNCIONES DE VALIDACIÓN


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

function validarFechas(checkin, checkout) {
    const fechaI = new Date(checkin);
    const fechaO = new Date(checkout);
    return fechaI < fechaO && fechaI > new Date();
}


// FUNCIONES DE CÁLCULO


function calcularPrecioTotal(reserva) {
    if (!reserva || !reserva.destino) return 0;
    return reserva.total || 0;
}

function calcularTotalCarrito(carrito) {
    return carrito.reduce((sum, reserva) => sum + (reserva.total || 0), 0);
}

function aplicarDescuento(precio, codigo) {
    const codigoUpper = codigo.toUpperCase();
    if (CODIGOS_VALIDOS[codigoUpper]) {
        return precio * (1 - CODIGOS_VALIDOS[codigoUpper]);
    }
    return precio;
}


// FUNCIONES DE ALMACENAMIENTO


function guardarEnStorage(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        return false;
    }
}

function obtenerDelStorage(clave) {
    try {
        const datos = localStorage.getItem(clave);
        return datos ? JSON.parse(datos) : null;
    } catch (error) {
        console.error('Error al obtener de localStorage:', error);
        return null;
    }
}

function vaciarCarrito() {
    localStorage.removeItem('travelar_carrito');
}

function obtenerCarrito() {
    return obtenerDelStorage('travelar_carrito') || [];
}

function guardarCarrito(carrito) {
    return guardarEnStorage('travelar_carrito', carrito);
}


// GENERACIÓN DE NÚMEROS Y REFERENCIAS


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


// FUNCIONES DE CONFIRMACIÓN


function generarConfirmacion(carrito, datosPasajero) {
    const confirmacion = {
        numeroReserva: generarNumeroReserva(),
        codigoConfirmacion: generarCodigoConfirmacion(),
        fecha: new Date().toISOString(),
        pasajero: datosPasajero,
        reservas: carrito,
        total: calcularTotalCarrito(carrito)
    };

    // Guardar en historial
    const historial = obtenerDelStorage('travelar_confirmaciones') || [];
    historial.push(confirmacion);
    guardarEnStorage('travelar_confirmaciones', historial);

    return confirmacion;
}


// GENERACIÓN DE PDF DESCARGABLE


function generarPDFConfirmacion(confirmacion) {
    const { numeroReserva, fecha, pasajero, reservas, total } = confirmacion;
    
    const fechaFormato = new Date(fecha).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let contenidoHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Reserva</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background: white;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 30px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #fb8a00;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #fb8a00;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #666;
            margin: 5px 0;
        }
        .confirmado {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            text-align: center;
            font-weight: bold;
        }
        .seccion {
            margin-bottom: 30px;
        }
        .seccion h2 {
            background: #f5f5f5;
            padding: 10px;
            border-left: 4px solid #fb8a00;
            margin: 0 0 15px 0;
            font-size: 18px;
        }
        .fila {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .fila:last-child {
            border-bottom: none;
        }
        .fila strong {
            color: #333;
        }
        .reserva {
            background: #f9f9f9;
            padding: 15px;
            margin-bottom: 15px;
            border-left: 4px solid #fb8a00;
            border-radius: 3px;
        }
        .reserva h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .tabla {
            width: 100%;
            margin-bottom: 20px;
        }
        .tabla td {
            padding: 8px;
            border-bottom: 1px solid #eee;
        }
        .tabla td:first-child {
            font-weight: bold;
            width: 200px;
        }
        .total-final {
            background: #fb8a00;
            color: white;
            padding: 15px;
            text-align: right;
            border-radius: 4px;
            font-size: 18px;
            margin-top: 20px;
        }
        .firma {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            .container {
                border: none;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌍 TravelAR</h1>
            <p>Confirmación de Reserva</p>
            <div class="confirmado">✓ Reserva Confirmada</div>
        </div>

        <div class="seccion">
            <h2>Datos de la Reserva</h2>
            <table class="tabla">
                <tr>
                    <td>Número de Reserva:</td>
                    <td><strong>${numeroReserva}</strong></td>
                </tr>
                <tr>
                    <td>Fecha de Emisión:</td>
                    <td>${fechaFormato}</td>
                </tr>
                <tr>
                    <td>Hora:</td>
                    <td>${new Date(fecha).toLocaleTimeString('es-AR')}</td>
                </tr>
            </table>
        </div>

        <div class="seccion">
            <h2>Datos del Pasajero</h2>
            <table class="tabla">
                <tr>
                    <td>Nombre:</td>
                    <td>${pasajero.nombre || 'N/A'}</td>
                </tr>
                <tr>
                    <td>Email:</td>
                    <td>${pasajero.email || 'N/A'}</td>
                </tr>
                <tr>
                    <td>DNI:</td>
                    <td>${pasajero.dni || 'N/A'}</td>
                </tr>
                <tr>
                    <td>Teléfono:</td>
                    <td>${pasajero.telefono || 'N/A'}</td>
                </tr>
            </table>
        </div>

        <div class="seccion">
            <h2>Detalles de las Reservas</h2>
            ${reservas.map((reserva, idx) => `
                <div class="reserva">
                    <h3>Reserva ${idx + 1}: ${reserva.destino.nombre}</h3>
                    <table class="tabla">
                        <tr>
                            <td>Destino:</td>
                            <td>${reserva.destino.nombre}, ${reserva.destino.pais}</td>
                        </tr>
                        <tr>
                            <td>Fecha Check-in:</td>
                            <td>${new Date(reserva.checkin).toLocaleDateString('es-AR')}</td>
                        </tr>
                        <tr>
                            <td>Fecha Check-out:</td>
                            <td>${new Date(reserva.checkout).toLocaleDateString('es-AR')}</td>
                        </tr>
                        <tr>
                            <td>Duración:</td>
                            <td>${reserva.dias} noches</td>
                        </tr>
                        <tr>
                            <td>Cantidad de Personas:</td>
                            <td>${reserva.personas}</td>
                        </tr>
                        <tr>
                            <td>Categoría:</td>
                            <td>${reserva.categoria.charAt(0).toUpperCase() + reserva.categoria.slice(1)}</td>
                        </tr>
                        ${reserva.extras && reserva.extras.length > 0 ? `
                            <tr>
                                <td>Extras:</td>
                                <td>${reserva.extras.map(e => e.nombre).join(', ')}</td>
                            </tr>
                        ` : ''}
                        <tr>
                            <td>Total:</td>
                            <td><strong>$${reserva.total.toLocaleString()}</strong></td>
                        </tr>
                    </table>
                </div>
            `).join('')}
        </div>

        <div class="total-final">
            <strong>TOTAL FINAL: $${total.toLocaleString()}</strong>
        </div>

        <div class="firma">
            <p>Este documento es la confirmación oficial de tu reserva en TravelAR</p>
            <p>Para más información, visita www.travelar.com o contacta a info@travelar.com</p>
            <p>Asistencia 24/7: +54 11 1234-5678</p>
        </div>
    </div>

    <script>
        window.print();
    </script>
</body>
</html>
    `;

    // Crear blob y descargar
    const blob = new Blob([contenidoHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TravelAR-Confirmacion-${numeroReserva}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // También abre en ventana para imprimir
    setTimeout(() => {
        const ventana = window.open(URL.createObjectURL(blob));
    }, 500);
}


// UTILIDADES GLOBALES (UI + CARRITO)


function actualizarContadorCarrito() {
    try {
        const carrito = obtenerDelStorage('travelar_carrito') || [];
        const count = carrito.length;
        document.querySelectorAll('#contadorCarrito').forEach(el => el.textContent = count);
        const btnContinuar = document.getElementById('btnContinuarCheckout');
        if (btnContinuar) btnContinuar.disabled = count === 0;
    } catch (e) {
        console.error('Error actualizando contador de carrito:', e);
    }
}

function renderDrawer() {
    const contenedor = document.getElementById('carritoItems');
    const totalEl = document.getElementById('carritoTotal');
    if (!contenedor) return;

    const carrito = obtenerDelStorage('travelar_carrito') || [];
    if (carrito.length === 0) {
        contenedor.innerHTML = `<div class="carrito-vacio"><h3>Tu carrito está vacío</h3><p>No hay reservas aún.</p></div>`;
        if (totalEl) totalEl.textContent = '$0';
        return;
    }

    let html = '';
    let total = 0;
    carrito.forEach((item, idx) => {
        html += `
            <div class="carrito-item">
                <div class="item-details">
                    <h4>${item.destino.nombre}</h4>
                    <p>${new Date(item.checkin).toLocaleDateString('es-AR')} → ${new Date(item.checkout).toLocaleDateString('es-AR')}</p>
                    <p class="item-meta">${item.personas} personas · ${item.categoria}</p>
                </div>
                <div class="item-precio">$${item.total.toLocaleString()}</div>
                <div class="item-actions"><button onclick="eliminarDelCarrito(${idx})" class="item-remove">Eliminar</button></div>
            </div>
        `;
        total += Number(item.total) || 0;
    });

    contenedor.innerHTML = html;
    if (totalEl) totalEl.textContent = `$${total.toLocaleString()}`;
}

function eliminarDelCarrito(index) {
    try {
        const carrito = obtenerDelStorage('travelar_carrito') || [];
        if (index < 0 || index >= carrito.length) return;
        carrito.splice(index, 1);
        guardarEnStorage('travelar_carrito', carrito);
        actualizarContadorCarrito();
        renderDrawer();
        try { mostrarAlerta('Reserva eliminada del carrito', 'success'); } catch (e) { console.log('Reserva eliminada'); }
    } catch (e) {
        console.error('Error al eliminar del carrito:', e);
    }
}

// Conectar botón de carrito en todas las páginas
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();
    renderDrawer();

    const abrir = document.getElementById('abrirCarrito');
    if (abrir) {
        abrir.addEventListener('click', () => {
            const drawer = document.getElementById('carritoDrawer');
            if (drawer) {
                drawer.classList.add('open');
                document.body.style.overflow = 'hidden';
                renderDrawer();
            } else {
                // redirigir a la página de carrito dependiendo de la ubicación actual
                if (window.location.pathname.includes('/pages/')) {
                    window.location.href = './carrito.html';
                } else {
                    window.location.href = 'pages/carrito.html';
                }
            }
        });
    }

    const cerrar = document.getElementById('cerrarDrawer');
    if (cerrar) {
        cerrar.addEventListener('click', () => {
            const drawer = document.getElementById('carritoDrawer');
            if (drawer) {
                    drawer.classList.remove('open');
                    document.body.style.overflow = '';
                }
        });
    }
});
