
// SISTEMA DE RESERVA DE VIAJES
// ÚNICO SIMULADOR EN HERO


let destinos = [];
let carritoLocal = [];
let reservaActual = null;

// Multiplicadores de categoría
const MULTIPLICADORES = {
    economico: 1,
    premium: 1.25,
    lujo: 1.5
};

// Códigos de descuento
const CODIGOS_DESCUENTO = {
    'TRAVEL10': 0.10,
    'TRAVEL20': 0.20,
    'VIP20': 0.20,
    'SUMMER15': 0.15
};


// INICIALIZACIÓN


document.addEventListener('DOMContentLoaded', () => {
    cargarDestinos();
    inicializarEventos();
    actualizarCarrito();
});


// CARGAR DESTINOS


function cargarDestinos() {
    fetch('./data/destinos.json')
        .then(res => {
            if (!res.ok) throw new Error('Error al cargar destinos');
            return res.json();
        })
        .then(data => {
            destinos = data;
            llenarSelectDestinos();
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('No se pudieron cargar los destinos');
        });
}

function llenarSelectDestinos() {
    const select = document.getElementById('heroDestino');
    select.innerHTML = '<option value="">Elegí destino</option>';
    
    destinos.forEach(destino => {
        const option = document.createElement('option');
        option.value = destino.id;
        option.textContent = `${destino.nombre} - Desde $${destino.precioBase.toLocaleString()}`;
        select.appendChild(option);
    });
}


// INICIALIZAR EVENTOS


function inicializarEventos() {
    // Formulario HERO
    document.getElementById('formHero').addEventListener('submit', (e) => {
        e.preventDefault();
        simularYMostrarReserva();
    });

    // Carrito
    document.getElementById('abrirCarrito').addEventListener('click', abrirCarrito);
    document.getElementById('cerrarDrawer').addEventListener('click', cerrarCarrito);
    document.getElementById('irCheckout').addEventListener('click', irAlCheckout);

    // Carrito drawer - cerrar al hacer click fuera
    document.getElementById('carritoDrawer').addEventListener('click', (e) => {
        if (e.target.id === 'carritoDrawer') cerrarCarrito();
    });

    // Seleccionar destino muestra info
    document.getElementById('heroDestino').addEventListener('change', mostrarDetallesDestino);
}


// MOSTRAR DETALLES DEL DESTINO


function mostrarDetallesDestino() {
    const idDestino = document.getElementById('heroDestino').value;
    const contenedor = document.getElementById('infoDestinoHero');
    
    if (!idDestino) {
        contenedor.innerHTML = '';
        return;
    }

    const destino = destinos.find(d => d.id == idDestino);
    if (!destino) return;

    let htmlExtras = '<div class="extras-list">';
    if (destino.extrasDisponibles && destino.extrasDisponibles.length > 0) {
        destino.extrasDisponibles.forEach((extra, idx) => {
            htmlExtras += `
                <label class="extra-checkbox">
                    <input type="checkbox" data-extra-id="${idx}" data-extra-precio="${extra.precio}">
                    <span>${extra.nombre} - $${extra.precio.toLocaleString()}</span>
                </label>
            `;
        });
    }
    htmlExtras += '</div>';

    const html = `
        <div class="destino-detalles">
            <h4>${destino.nombre}</h4>
            <p><strong>${destino.ciudad}, ${destino.pais}</strong></p>
            <p>${destino.descripcion}</p>
            <div class="destino-stats">
                <span>⭐ ${destino.rating} (${destino.opiniones} opiniones)</span>
                <span>📅 ${destino.duracionDias} días</span>
                <span>💰 Desde $${destino.precioBase.toLocaleString()}</span>
                <span>🪑 ${destino.cuposDisponibles} cupos disponibles</span>
            </div>
            <h5>Incluye:</h5>
            <ul class="lista-incluye">
                ${(destino.incluye || []).map(item => `<li>✓ ${item}</li>`).join('')}
            </ul>
            ${destino.extrasDisponibles && destino.extrasDisponibles.length > 0 ? `
                <h5>Extras disponibles:</h5>
                ${htmlExtras}
            ` : ''}
        </div>
    `;

    contenedor.innerHTML = html;
}


// SIMULAR Y MOSTRAR RESERVA


function simularYMostrarReserva() {
    const idDestino = document.getElementById('heroDestino').value;
    const checkin = document.getElementById('heroFechaCheckin').value;
    const checkout = document.getElementById('heroFechaCheckout').value;
    const personas = parseInt(document.getElementById('heroPersonas').value);
    const categoria = document.getElementById('heroCategoria').value;
    const codigoDesc = document.getElementById('heroCodigoDescuento').value.toUpperCase();

    // Validaciones
    if (!idDestino || !checkin || !checkout || !personas || !categoria) {
        mostrarError('Por favor completa todos los campos');
        return;
    }

    if (new Date(checkin) >= new Date(checkout)) {
        mostrarError('La fecha de salida debe ser posterior a la entrada');
        return;
    }

    if (personas <= 0) {
        mostrarError('La cantidad de personas debe ser mayor a 0');
        return;
    }

    const destino = destinos.find(d => d.id == idDestino);
    if (!destino) {
        mostrarError('Destino no válido');
        return;
    }

    // Calcular días
    const diastranscurridos = Math.ceil(
        (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)
    );

    if (diastranscurridos <= 0) {
        mostrarError('Las fechas no son válidas');
        return;
    }

    // Calcular precio
    let precioTotal = destino.precioBase * personas * MULTIPLICADORES[categoria];

    // Agregar extras
    const extrasSeleccionados = [];
    let precioExtras = 0;
    document.querySelectorAll('.extras-list input[type="checkbox"]:checked').forEach(input => {
        const precio = parseInt(input.dataset.extraPrecio);
        const nombreExtra = input.parentElement.textContent.trim();
        extrasSeleccionados.push({ nombre: nombreExtra, precio });
        precioExtras += precio * personas; // extras por persona
    });

    precioTotal += precioExtras;

    // Aplicar descuento
    let descuento = 0;
    if (codigoDesc && CODIGOS_DESCUENTO[codigoDesc]) {
        descuento = precioTotal * CODIGOS_DESCUENTO[codigoDesc];
        precioTotal -= descuento;
    }

    // Validar cupos
    if (personas > destino.cuposDisponibles) {
        mostrarError(`Solo hay ${destino.cuposDisponibles} cupos disponibles`);
        return;
    }

    // Crear objeto de reserva
    reservaActual = {
        id: Date.now(),
        destino: destino,
        checkin: checkin,
        checkout: checkout,
        dias: diastranscurridos,
        personas: personas,
        categoria: categoria,
        precioBase: destino.precioBase,
        precioCategoria: destino.precioBase * MULTIPLICADORES[categoria],
        extras: extrasSeleccionados,
        precioExtras: precioExtras,
        codigoDescuento: codigoDesc || null,
        descuento: descuento,
        total: Math.round(precioTotal)
    };

    mostrarResumenReserva();
}


// MOSTRAR RESUMEN DE RESERVA


function mostrarResumenReserva() {
    if (!reservaActual) return;

    const destino = reservaActual.destino;
    const htmlExtras = reservaActual.extras.length > 0 
        ? reservaActual.extras.map(e => `
            <div class="resumen-item">
                <span>${e.nombre} (x${reservaActual.personas})</span>
                <span>$${(e.precio * reservaActual.personas).toLocaleString()}</span>
            </div>
        `).join('')
        : '<p class="sin-extras">Sin extras adicionales</p>';

    const html = `
        <div class="resumen-reserva">
            <div class="resumen-header">
                <h3>Resumen de tu reserva</h3>
                <button type="button" class="btn-close-resumen" onclick="cerrarResumen()">✕</button>
            </div>
            
            <div class="resumen-destino">
                <h4>${destino.nombre}</h4>
                <p>${destino.ciudad}, ${destino.pais}</p>
            </div>

            <div class="resumen-fechas">
                <div>
                    <strong>Check-in:</strong>
                    <span>${new Date(reservaActual.checkin).toLocaleDateString('es-AR')}</span>
                </div>
                <div>
                    <strong>Check-out:</strong>
                    <span>${new Date(reservaActual.checkout).toLocaleDateString('es-AR')}</span>
                </div>
                <div>
                    <strong>Duración:</strong>
                    <span>${reservaActual.dias} noches</span>
                </div>
            </div>

            <div class="resumen-detalles">
                <div class="resumen-item">
                    <span>Precio base (${reservaActual.personas} persona/s × ${reservaActual.dias} noche/s)</span>
                    <span>$${(reservaActual.precioBase * reservaActual.personas * reservaActual.dias).toLocaleString()}</span>
                </div>
                <div class="resumen-item">
                    <span>Categoría (${reservaActual.categoria.charAt(0).toUpperCase() + reservaActual.categoria.slice(1)})</span>
                    <span>×${MULTIPLICADORES[reservaActual.categoria]}</span>
                </div>
                ${htmlExtras}
                ${reservaActual.descuento > 0 ? `
                    <div class="resumen-item descuento">
                        <span>Descuento (${reservaActual.codigoDescuento})</span>
                        <span>-$${reservaActual.descuento.toLocaleString()}</span>
                    </div>
                ` : ''}
                <div class="resumen-total">
                    <strong>Total:</strong>
                    <strong>$${reservaActual.total.toLocaleString()}</strong>
                </div>
            </div>

            <button id="btnReservarAhora" class="btn-primary btn-large">
                Reservar ahora
            </button>
        </div>
    `;

    const contenedor = document.getElementById('infoDestinoHero');
    contenedor.innerHTML = html;

    // Agregar evento al botón
    document.getElementById('btnReservarAhora').addEventListener('click', agregarAlCarritoDesdeResumen);
}


// AGREGAR AL CARRITO


function agregarAlCarritoDesdeResumen() {
    if (!reservaActual) return;

    carritoLocal.push(reservaActual);
    guardarCarritoEnStorage();
    actualizarCarrito();
    
    mostrarSuccessMessage('¡Reserva agregada al carrito!');
    cerrarResumen();
}

function cerrarResumen() {
    document.getElementById('infoDestinoHero').innerHTML = '';
    reservaActual = null;
}


// MANEJO DEL CARRITO


function abrirCarrito() {
    const drawer = document.getElementById('carritoDrawer');
    if (drawer) {
        drawer.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function cerrarCarrito() {
    const drawer = document.getElementById('carritoDrawer');
    if (drawer) {
        drawer.classList.remove('open');
        document.body.style.overflow = 'auto';
    }
}

function actualizarCarrito() {
    carritoLocal = JSON.parse(localStorage.getItem('travelar_carrito') || '[]');
    
    const contador = document.getElementById('contadorCarrito');
    contador.textContent = carritoLocal.length;

    const contenedor = document.getElementById('carritoItems');
    const totalElemento = document.getElementById('carritoTotal');
    const btnCheckout = document.getElementById('irCheckout');

    if (carritoLocal.length === 0) {
        contenedor.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
        totalElemento.textContent = '$0';
        btnCheckout.disabled = true;
        return;
    }

    contenedor.innerHTML = '';
    let totalGeneral = 0;

    carritoLocal.forEach((reserva, idx) => {
        totalGeneral += reserva.total;
        const checkinDate = new Date(reserva.checkin).toLocaleDateString('es-AR');
        const checkoutDate = new Date(reserva.checkout).toLocaleDateString('es-AR');

        const html = `
            <div class="carrito-item">
                <div class="item-info">
                    <h4>${reserva.destino.nombre}</h4>
                    <p>${checkinDate} → ${checkoutDate} (${reserva.dias} noches)</p>
                    <p>${reserva.personas} persona/s | ${reserva.categoria}</p>
                    ${reserva.extras.length > 0 ? `<p class="item-extras">Extras: ${reserva.extras.map(e => e.nombre).join(', ')}</p>` : ''}
                </div>
                <div class="item-precio">
                    <strong>$${reserva.total.toLocaleString()}</strong>
                </div>
                <button class="btn-eliminar" onclick="eliminarDelCarrito(${idx})">🗑️</button>
            </div>
        `;

        contenedor.innerHTML += html;
    });

    totalElemento.textContent = `$${totalGeneral.toLocaleString()}`;
    btnCheckout.disabled = false;
}

function eliminarDelCarrito(index) {
    if (confirm('¿Eliminar esta reserva?')) {
        carritoLocal.splice(index, 1);
        guardarCarritoEnStorage();
        actualizarCarrito();
        mostrarSuccessMessage('Reserva eliminada');
    }
}

function guardarCarritoEnStorage() {
    localStorage.setItem('travelar_carrito', JSON.stringify(carritoLocal));
}


// NAVEGACIÓN


function irAlCheckout() {
    if (carritoLocal.length === 0) {
        mostrarError('Tu carrito está vacío');
        return;
    }
    window.location.href = './pages/checkout.html';
}


// UTILIDADES


function mostrarError(mensaje) {
    const div = document.createElement('div');
    div.className = 'alert alert-error';
    div.textContent = mensaje;
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.classList.add('show');
    }, 10);

    setTimeout(() => {
        div.classList.remove('show');
        setTimeout(() => div.remove(), 300);
    }, 3000);
}

function mostrarSuccessMessage(mensaje) {
    const div = document.createElement('div');
    div.className = 'alert alert-success';
    div.textContent = mensaje;
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.classList.add('show');
    }, 10);

    setTimeout(() => {
        div.classList.remove('show');
        setTimeout(() => div.remove(), 300);
    }, 3000);
}
