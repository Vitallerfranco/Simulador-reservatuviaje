//destino card animaciones
const cards = document.querySelectorAll(".destino-card");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {

            setTimeout(() => {
                entry.target.classList.add("show");
            }, index * 150); // efecto escalonado

            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.2
});

cards.forEach(card => observer.observe(card));

//testimonios slider
const historias = document.querySelectorAll('.historia-iguazu');
const puntos = document.querySelectorAll('.punto-bondi');
let actual = 0;

function mostrarHistoria(indice) {
    historias.forEach(h => h.classList.remove('activa-maradona'));
    puntos.forEach(p => p.classList.remove('activo-maradona'));

    historias[indice].classList.add('activa-maradona');
    puntos[indice].classList.add('activo-maradona');
}

function siguienteHistoria() {
    actual = (actual + 1) % historias.length;
    mostrarHistoria(actual);
}

setInterval(siguienteHistoria, 5000);

puntos.forEach((punto, indice) => {
    punto.addEventListener('click', () => {
        actual = indice;
        mostrarHistoria(indice);
    });
});

// Scroll reveal
const efectos = document.querySelectorAll('.efecto-messi');

function activarEfecto() {
    efectos.forEach(el => {
        const altoVentana = window.innerHeight;
        const posicion = el.getBoundingClientRect().top;

        if (posicion < altoVentana - 100) {
            el.classList.add('activa-maradona');
        }
    });
}

window.addEventListener('scroll', activarEfecto);
activarEfecto();

// section de promociones 




const targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 7);

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    document.getElementById("days").innerText = days.toString().padStart(2, "0");
    document.getElementById("hours").innerText = hours.toString().padStart(2, "0");
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, "0");
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, "0");
}

setInterval(updateCountdown, 1000);


//particulas fondo

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedY = Math.random() * 1;
    }
    update() {
        this.y += this.speedY;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.fillStyle = "rgba(255,209,102,0.8)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    for (let i = 0; i < 120; i++) {
        particlesArray.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

init();
animate();