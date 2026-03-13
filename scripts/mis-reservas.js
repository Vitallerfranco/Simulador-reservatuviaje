
let reservas = [];

cargarReservas();
mostrarReservas();
inicializarEventos();

// cargar reservas desde el storage


function cargarReservas() {
    // Obtener confirmaciones guardadas
    const confirmaciones = obtenerDelStorage('travelar_confirmaciones') || [];
    reservas = confirmaciones;
}


// mostrar reservas


function mostrarReservas() {
    const contenedor = document.getElementById('historialReservas');
    
    if (reservas.length === 0) {
        contenedor.innerHTML = `
            <div class="reservas-vacio">
                <i class="fa-solid fa-calendar-xmark"></i>
                <h2>No tienes reservas</h2>
                <p>Aún no has realizado ninguna reserva. ¡Vuelve al inicio y planifica tu próximo viaje!</p>
                <a href="../index.html" class="btn-primary">Ir al simulador</a>
            </div>
        `;
        return;
    }

    let html = '<div class="reservas-listado">';
    
    reservas.forEach((reserva, index) => {
        const fecha = new Date(reserva.fechaEmision);
        const fechaFormato = fecha.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        html += `
            <div class="reserva-card">
                <div class="reserva-card-header">
                    <div class="reserva-info-principal">
                        <h3>#${reserva.numeroReserva}</h3>
                        <p class="fecha-reserva">Reservado el ${fechaFormato}</p>
                    </div>
                    <span class="estado-reserva">✓ Confirmada</span>
                </div>

                <div class="reserva-card-body">
                    <div class="reserva-detalles">
                        <h4>Datos del Viajero</h4>
                        <p><strong>Nombre:</strong> ${reserva.datosPasajero.nombre}</p>
                        <p><strong>DNI:</strong> ${reserva.datosPasajero.dni}</p>
                        <p><strong>Email:</strong> ${reserva.datosPasajero.email}</p>
                        <p><strong>Teléfono:</strong> ${reserva.datosPasajero.telefono}</p>
                    </div>

                    ${reserva.carrito && reserva.carrito.length > 0 ? `
                        <div class="reserva-viajes">
                            <h4>Viajes Reservados</h4>
                            ${reserva.carrito.map(item => `
                                <div class="viaje-item">
                                    <div class="viaje-info">
                                        <p><strong>${item.destino.nombre}</strong></p>
                                        <p class="viaje-fechas">
                                            ${new Date(item.fechaCheckin).toLocaleDateString('es-AR')} - 
                                            ${new Date(item.fechaCheckout).toLocaleDateString('es-AR')}
                                        </p>
                                        <p class="viaje-detalles">
                                            ${item.personas} personas • ${item.categoria} • 
                                            ${item.extras.length > 0 ? `+${item.extras.length} extras` : 'Sin extras'}
                                        </p>
                                    </div>
                                    <div class="viaje-precio">
                                        <p>$${item.total.toLocaleString()}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div class="reserva-total">
                        <p><strong>Total pagado:</strong> <span>$${reserva.totalPagado.toLocaleString()}</span></p>
                    </div>

                    <div class="reserva-codigos">
                        <p><strong>Código de confirmación:</strong> <code>${reserva.codigoConfirmacion}</code></p>
                    </div>

                    <div class="reserva-acciones">
                        <button onclick="descargarPDFReserva(${index})" class="btn-secondary">
                            <i class="fa-solid fa-download"></i> Descargar PDF
                        </button>
                        <button onclick="contactarSoporte()" class="btn-secondary">
                            <i class="fa-solid fa-headset"></i> Soporte
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    contenedor.innerHTML = html;
}


// inicializar eventos


function inicializarEventos() {
    // Aquí pueden ir eventos globales si es necesario
}


// descargar PDF de reserva


function descargarPDFReserva(index) {
    if (!reservas[index]) return;
    
    const reserva = reservas[index];
    
    // Usar la función generarPDFConfirmacion del logicareserva.js
    // pero adaptada para guardar
    generarPDFConfirmacion(reserva);
}


// contactar a soporte


function contactarSoporte() {
    Swal.fire({
        title: 'Contactar Soporte',
        text: 'Te redirigiremos al chat de soporte. Por el momento, contacta a soporte@travelar.com',
        icon: 'info',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'De acuerdo'
    });
}


// funciones auxiliares


function mostrarAlerta(mensaje, tipo = 'info') {
    const div = document.createElement('div');
    div.className = `alert alert-${tipo}`;
    div.textContent = mensaje;
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, 4000);
}
