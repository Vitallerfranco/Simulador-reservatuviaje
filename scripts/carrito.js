
// LÓGICA DEL CARRITO


let carrito = [];


// INICIALIZACIÓN


cargarCarrito();
mostrarItems();
mostrarResumen();
inicializarEventos();


// CARGAR CARRITO


function cargarCarrito() {
    carrito = obtenerDelStorage('travelar_carrito') || [];
}


// INICIALIZAR EVENTOS


function inicializarEventos() {
    const btnCheckout = document.getElementById('btnContinuarCheckout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', irAlCheckout);
        btnCheckout.disabled = carrito.length === 0;
    }
}


// MOSTRAR ITEMS


function mostrarItems() {
    const contenedor = document.getElementById('carritoItems');
    
    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="carrito-vacio">
                <i class="fa-solid fa-shopping-cart"></i>
                <h2>Tu carrito está vacío</h2>
                <p>No has agregado ninguna reserva aún. Vuelve al inicio y usa el simulador del HERO.</p>
                <button onclick="volverAlHero()" class="btn-primary">
                    Ir a buscar viajes
                </button>
            </div>
        `;
        return;
    }

    let html = '<div class="items-lista">';

    carrito.forEach((reserva, idx) => {
        const checkinDate = new Date(reserva.checkin).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const checkoutDate = new Date(reserva.checkout).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        html += `
            <div class="carrito-item-card">
                <div class="item-header">
                    <h3>${reserva.destino.nombre}</h3>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${idx})" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>

                <div class="item-detalle">
                    <div class="detalle-fila">
                        <span class="detalle-label">País:</span>
                        <span class="detalle-valor">${reserva.destino.pais}</span>
                    </div>

                    <div class="detalle-fila">
                        <span class="detalle-label">Check-in:</span>
                        <span class="detalle-valor">${checkinDate}</span>
                    </div>

                    <div class="detalle-fila">
                        <span class="detalle-label">Check-out:</span>
                        <span class="detalle-valor">${checkoutDate}</span>
                    </div>

                    <div class="detalle-fila">
                        <span class="detalle-label">Duración:</span>
                        <span class="detalle-valor">${reserva.dias} noches</span>
                    </div>

                    <div class="detalle-fila">
                        <span class="detalle-label">Personas:</span>
                        <span class="detalle-valor">${reserva.personas}</span>
                    </div>

                    <div class="detalle-fila">
                        <span class="detalle-label">Categoría:</span>
                        <span class="badge">${reserva.categoria}</span>
                    </div>

                    ${reserva.extras && reserva.extras.length > 0 ? `
                        <div class="detalle-fila">
                            <span class="detalle-label">Extras:</span>
                            <ul class="extras-list">
                                ${reserva.extras.map(e => `
                                    <li>${e.nombre}: $${e.precio.toLocaleString()}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${reserva.codigoDescuento ? `
                        <div class="detalle-fila descuento-aplicado">
                            <span class="detalle-label">Descuento:</span>
                            <span class="detalle-valor">-$${reserva.descuento.toLocaleString()}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="item-precio">
                    <div class="precio-total">
                        <span>Total:</span>
                        <strong>$${reserva.total.toLocaleString()}</strong>
                    </div>
                </div>

                <button class="btn-editar" onclick="editarReserva(${idx})">
                    <i class="fa-solid fa-edit"></i> Editar reserva
                </button>
            </div>
        `;
    });

    html += '</div>';
    contenedor.innerHTML = html;
}


// MOSTRAR RESUMEN


function mostrarResumen() {
    const contenedor = document.getElementById('resumenCarrito');
    const total = calcularTotalCarrito(carrito);

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="resumen-vacio">
                <p>Sin reservas</p>
            </div>
        `;
        return;
    }

    let html = '<div class="resumen-items">';

    carrito.forEach(reserva => {
        html += `
            <div class="resumen-item">
                <span>${reserva.destino.nombre}</span>
                <span>$${reserva.total.toLocaleString()}</span>
            </div>
        `;
    });

    html += `
        </div>
        <div class="resumen-divider"></div>
        <div class="resumen-total">
            <span>Cantidad de reservas:</span>
            <span>${carrito.length}</span>
        </div>
        <div class="resumen-total">
            <span>Total a pagar:</span>
            <strong>$${total.toLocaleString()}</strong>
        </div>
        <p class="resumen-nota">Los precios incluyen impuestos</p>
    `;

    contenedor.innerHTML = html;
}


// ACCIONES


function eliminarDelCarrito(index) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas eliminar esta reserva del carrito?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            carrito.splice(index, 1);
            guardarEnStorage('travelar_carrito', carrito);
            mostrarItems();
            mostrarResumen();
            inicializarEventos();
            mostrarAlerta('Reserva eliminada', 'success');
        }
    });
}

function editarReserva(index) {
    Swal.fire({
        title: 'Editar Reserva',
        text: 'Te llevaremos al inicio para que puedas modificar tu reserva.',
        icon: 'info',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Continuar'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '../index.html';
        }
    });
}

function irAlCheckout() {
    if (carrito.length === 0) {
        mostrarAlerta('Tu carrito está vacío', 'error');
        return;
    }
    window.location.href = './checkout.html';
}

function volverAlHero() {
    window.location.href = '../index.html';
}


// FUNCIONES AUXILIARES


function mostrarAlerta(mensaje, tipo = 'info') {
    const div = document.createElement('div');
    div.className = `alert alert-${tipo}`;
    div.textContent = mensaje;
    document.body.insertBefore(div, document.body.firstChild);
    
    setTimeout(() => {
        div.classList.add('show');
    }, 10);
    
    if (tipo !== 'error') {
        setTimeout(() => {
            div.classList.remove('show');
            setTimeout(() => div.remove(), 300);
        }, 3000);
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

function guardarEnStorage(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        return false;
    }
}

function calcularTotalCarrito(carrito) {
    return carrito.reduce((sum, reserva) => sum + (reserva.total || 0), 0);
}
