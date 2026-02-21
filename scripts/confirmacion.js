
// LÓGICA DE CONFIRMACIÓN


let confirmacion = null;


// INICIALIZACIÓN


document.addEventListener('DOMContentLoaded', () => {
    cargarConfirmacion();
    mostrarDatos();
});


// CARGAR CONFIRMACIÓN


function cargarConfirmacion() {
    // Obtener de sessionStorage (se guarda en checkout.js)
    const datosSession = sessionStorage.getItem('travelar_confirmacion');
    
    if (datosSession) {
        confirmacion = JSON.parse(datosSession);
        sessionStorage.removeItem('travelar_confirmacion');
    } else {
        // Fallback: obtener del historial de localStorage
        const confirmaciones = obtenerDelStorage('travelar_confirmaciones') || [];
        if (confirmaciones.length > 0) {
            confirmacion = confirmaciones[confirmaciones.length - 1];
        } else {
            // No hay confirmación, redirigir al inicio
            window.location.href = '../index.html';
            return;
        }
    }
}


// MOSTRAR DATOS


function mostrarDatos() {
    if (!confirmacion) return;

    // Datos de confirmación
    document.getElementById('confirmNumeroReserva').textContent = confirmacion.numeroReserva;
    document.getElementById('confirmCodigo').textContent = confirmacion.codigoConfirmacion;
    
    const fechaEmision = new Date(confirmacion.fecha).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('confirmFecha').textContent = fechaEmision;

    // Datos del pasajero
    const pasajero = confirmacion.pasajero;
    document.getElementById('confirmEmail').textContent = pasajero.email || 'No especificado';
    document.getElementById('confirmPasajeroNombre').textContent = pasajero.nombre || 'No especificado';
    document.getElementById('confirmPasajeroDNI').textContent = pasajero.dni || 'No especificado';
    document.getElementById('confirmPasajeroTelefono').textContent = pasajero.telefono || 'No especificado';
    document.getElementById('confirmPasajeroCiudad').textContent = pasajero.ciudad || 'No especificado';
    document.getElementById('emailPasajero').textContent = pasajero.email || 'tu@email.com';
    document.getElementById('numeroReservaRepetido').textContent = confirmacion.numeroReserva;

    // Mostrar reservas
    mostrarReservas();

    // Mostrar totales
    mostrarTotales();
}


// MOSTRAR RESERVAS


function mostrarReservas() {
    const contenedor = document.getElementById('confirmacionReservas');
    
    let html = '';
    
    confirmacion.reservas.forEach((reserva, idx) => {
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
            <div class="reserva-confirmada">
                <div class="reserva-confirmada-header">
                    <h3>${reserva.destino.nombre}</h3>
                    <span class="badge">${reserva.categoria.toUpperCase()}</span>
                </div>

                <div class="reserva-confirmada-body">
                    <div class="reserva-confirmada-info">
                        <div class="info-grupo">
                            <span class="info-label">Destino:</span>
                            <span class="info-valor">${reserva.destino.nombre}, ${reserva.destino.pais}</span>
                        </div>

                        <div class="info-grupo">
                            <span class="info-label">Check-in:</span>
                            <span class="info-valor">${checkinDate}</span>
                        </div>

                        <div class="info-grupo">
                            <span class="info-label">Check-out:</span>
                            <span class="info-valor">${checkoutDate}</span>
                        </div>

                        <div class="info-grupo">
                            <span class="info-label">Duración:</span>
                            <span class="info-valor">${reserva.dias} noches</span>
                        </div>

                        <div class="info-grupo">
                            <span class="info-label">Cantidad de personas:</span>
                            <span class="info-valor">${reserva.personas}</span>
                        </div>

                        <div class="info-grupo">
                            <span class="info-label">Categoría de alojamiento:</span>
                            <span class="info-valor">${reserva.categoria.charAt(0).toUpperCase() + reserva.categoria.slice(1)}</span>
                        </div>

                        ${reserva.destino.incluye && reserva.destino.incluye.length > 0 ? `
                            <div class="info-grupo">
                                <span class="info-label">Incluye:</span>
                                <ul class="lista-incluye">
                                    ${reserva.destino.incluye.map(item => `<li>✓ ${item}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        ${reserva.extras && reserva.extras.length > 0 ? `
                            <div class="info-grupo">
                                <span class="info-label">Extras contratados:</span>
                                <ul class="lista-extras">
                                    ${reserva.extras.map(e => `
                                        <li>${e.nombre} - $${e.precio.toLocaleString()}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>

                    <div class="reserva-confirmada-precio">
                        <strong>Total: $${reserva.total.toLocaleString()}</strong>
                    </div>
                </div>
            </div>
        `;
    });

    contenedor.innerHTML = html;
}


// MOSTRAR TOTALES


function mostrarTotales() {
    const subtotal = confirmacion.total;
    const impuestos = Math.round(subtotal * 0.21); // IVA 21%
    const total = subtotal + impuestos;

    document.getElementById('confirmSubtotal').textContent = `$${subtotal.toLocaleString()}`;
    document.getElementById('confirmImpuestos').textContent = `$${impuestos.toLocaleString()}`;
    document.getElementById('confirmTotal').textContent = `$${total.toLocaleString()}`;
}


// DESCARGAR PDF


function descargarPDF() {
    if (!confirmacion) return;

    const { numeroReserva, fecha, pasajero, reservas, total } = confirmacion;
    
    const fechaFormato = new Date(fecha).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const impuestos = Math.round(total * 0.21);
    const totalFinal = total + impuestos;

    let contenidoHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Reserva - ${numeroReserva}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
        }
        .page { page-break-after: always; }
        .container {
            max-width: 900px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 40px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 4px solid #fb8a00;
            padding-bottom: 30px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #fb8a00;
            font-size: 32px;
            margin: 0 0 10px 0;
        }
        .header p {
            color: #666;
            font-size: 14px;
        }
        .success-box {
            background: #d4edda;
            border: 2px solid #28a745;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
        }
        .seccion {
            margin-bottom: 35px;
            page-break-inside: avoid;
        }
        .seccion h2 {
            background: #f5f5f5;
            padding: 12px 15px;
            border-left: 4px solid #fb8a00;
            margin: 0 0 20px 0;
            font-size: 18px;
            color: #333;
        }
        .datos-tabla {
            width: 100%;
            margin-bottom: 20px;
        }
        .datos-tabla tr {
            border-bottom: 1px solid #eee;
        }
        .datos-tabla tr:last-child {
            border-bottom: none;
        }
        .datos-tabla td {
            padding: 10px 0;
            vertical-align: top;
        }
        .datos-tabla td:first-child {
            font-weight: bold;
            width: 200px;
            color: #555;
        }
        .reserva-box {
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-left: 4px solid #fb8a00;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 3px;
            page-break-inside: avoid;
        }
        .reserva-box h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 18px;
        }
        .reserva-box table {
            width: 100%;
        }
        .reserva-box td {
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .reserva-box td:first-child {
            font-weight: bold;
            width: 180px;
            color: #666;
        }
        .lista-incluye, .lista-extras {
            list-style: none;
            padding-left: 20px;
        }
        .lista-incluye li, .lista-extras li {
            padding: 5px 0;
        }
        .lista-incluye li:before {
            content: "✓ ";
            color: #28a745;
            font-weight: bold;
            margin-right: 5px;
        }
        .lista-extras li:before {
            content: "• ";
            color: #fb8a00;
            font-weight: bold;
            margin-right: 5px;
        }
        .totales-box {
            background: #f5f5f5;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 3px;
            page-break-inside: avoid;
        }
        .total-fila {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
        }
        .total-final {
            background: #fb8a00;
            color: white;
            padding: 15px;
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            border-radius: 3px;
            margin-top: 10px;
        }
        .pasos {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .paso {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 3px;
            border: 1px solid #ddd;
            text-align: center;
        }
        .paso-numero {
            background: #fb8a00;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
            font-weight: bold;
            font-size: 18px;
        }
        .paso h4 {
            margin: 10px 0 8px 0;
            color: #333;
        }
        .paso p {
            font-size: 13px;
            color: #666;
        }
        .notas {
            background: #fffacd;
            border: 1px solid #f0e68c;
            padding: 20px;
            border-radius: 3px;
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .notas h3 {
            margin: 0 0 15px 0;
            color: #333;
        }
        .notas ul {
            list-style: none;
            padding-left: 0;
        }
        .notas li {
            padding: 8px 0 8px 25px;
            position: relative;
            color: #666;
        }
        .notas li:before {
            content: "→";
            position: absolute;
            left: 0;
            color: #fb8a00;
            font-weight: bold;
        }
        .footer-pdf {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #999;
            font-size: 12px;
        }
        @media print {
            body { margin: 0; padding: 0; }
            .container { border: none; box-shadow: none; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌍 TravelAR</h1>
            <p>Confirmación de Reserva de Viaje</p>
            <div class="success-box">✓ Reserva Confirmada Exitosamente</div>
        </div>

        <!-- DATOS DE CONFIRMACIÓN -->
        <div class="seccion">
            <h2>Datos de tu Confirmación</h2>
            <table class="datos-tabla">
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

        <!-- DATOS DEL PASAJERO -->
        <div class="seccion">
            <h2>Datos del Pasajero</h2>
            <table class="datos-tabla">
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
                <tr>
                    <td>Ciudad:</td>
                    <td>${pasajero.ciudad || 'N/A'}</td>
                </tr>
            </table>
        </div>

        <!-- DETALLES DE RESERVAS -->
        <div class="seccion">
            <h2>Detalles de tus Reservas</h2>
            ${reservas.map((reserva, idx) => `
                <div class="reserva-box">
                    <h3>Reserva ${idx + 1}: ${reserva.destino.nombre}</h3>
                    <table>
                        <tr>
                            <td>Destino:</td>
                            <td>${reserva.destino.nombre}, ${reserva.destino.pais}</td>
                        </tr>
                        <tr>
                            <td>Check-in:</td>
                            <td>${new Date(reserva.checkin).toLocaleDateString('es-AR')}</td>
                        </tr>
                        <tr>
                            <td>Check-out:</td>
                            <td>${new Date(reserva.checkout).toLocaleDateString('es-AR')}</td>
                        </tr>
                        <tr>
                            <td>Duración:</td>
                            <td>${reserva.dias} noches</td>
                        </tr>
                        <tr>
                            <td>Cantidad de personas:</td>
                            <td>${reserva.personas}</td>
                        </tr>
                        <tr>
                            <td>Categoría:</td>
                            <td>${reserva.categoria.charAt(0).toUpperCase() + reserva.categoria.slice(1)}</td>
                        </tr>
                        ${reserva.destino.incluye && reserva.destino.incluye.length > 0 ? `
                            <tr>
                                <td>Incluye:</td>
                                <td><ul class="lista-incluye">${reserva.destino.incluye.map(i => `<li>${i}</li>`).join('')}</ul></td>
                            </tr>
                        ` : ''}
                        ${reserva.extras && reserva.extras.length > 0 ? `
                            <tr>
                                <td>Extras:</td>
                                <td><ul class="lista-extras">${reserva.extras.map(e => `<li>${e.nombre}</li>`).join('')}</ul></td>
                            </tr>
                        ` : ''}
                    </table>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; text-align: right;">
                        <strong>Total: $${reserva.total.toLocaleString()}</strong>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- RESUMEN FINANCIERO -->
        <div class="seccion">
            <h2>Resumen Financiero</h2>
            <div class="totales-box">
                <div class="total-fila">
                    <span>Subtotal:</span>
                    <span>$${total.toLocaleString()}</span>
                </div>
                <div class="total-fila">
                    <span>Impuestos (IVA 21%):</span>
                    <span>$${impuestos.toLocaleString()}</span>
                </div>
                <div class="total-final">
                    TOTAL: $${totalFinal.toLocaleString()}
                </div>
            </div>
        </div>

        <!-- PRÓXIMOS PASOS -->
        <div class="seccion">
            <h2>¿Qué sucede ahora?</h2>
            <div class="pasos">
                <div class="paso">
                    <div class="paso-numero">1</div>
                    <h4>Email de Confirmación</h4>
                    <p>Recibirás un email en ${pasajero.email} con todos los detalles de tu reserva.</p>
                </div>
                <div class="paso">
                    <div class="paso-numero">2</div>
                    <h4>Contacto Previo</h4>
                    <p>Nos pondremos en contacto 48 horas antes del viaje para confirmar detalles.</p>
                </div>
                <div class="paso">
                    <div class="paso-numero">3</div>
                    <h4>Bienvenida en Destino</h4>
                    <p>Serás recibido por nuestro personal en el destino para garantizar la mejor experiencia.</p>
                </div>
            </div>
        </div>

        <!-- NOTAS IMPORTANTES -->
        <div class="notas">
            <h3>Información Importante</h3>
            <ul>
                <li>Guarda tu número de reserva <strong>${numeroReserva}</strong> para cualquier consulta o cambio.</li>
                <li>Si necesitas cancelar o modificar tu reserva, contáctanos dentro de 24 horas.</li>
                <li>Los detalles del transporte llegarán 48 horas antes de tu viaje.</li>
                <li>Asistencia 24/7: <strong>+54 11 1234-5678</strong> o <strong>info@travelar.com</strong></li>
                <li>Revisa nuestros términos y condiciones para más información sobre políticas de cancelación.</li>
            </ul>
        </div>

        <div class="footer-pdf">
            <p>Este documento es la confirmación oficial de tu reserva en TravelAR</p>
            <p>Para más información, visita www.travelar.com o contacta a info@travelar.com</p>
            <p>Emitido: ${new Date().toLocaleString('es-AR')}</p>
        </div>
    </div>

    <script>
        // Auto-imprimir al abrir
        window.print();
    </script>
</body>
</html>
    `;

    // Crear blob
    const blob = new Blob([contenidoHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TravelAR-Confirmacion-${numeroReserva}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpiar URL
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
}


// NAVEGACIÓN


function volverAlInicio() {
    window.location.href = '../index.html';
}


// FUNCIONES AUXILIARES


function obtenerDelStorage(clave) {
    try {
        const datos = localStorage.getItem(clave);
        return datos ? JSON.parse(datos) : null;
    } catch (error) {
        console.error('Error al obtener de localStorage:', error);
        return null;
    }
}
