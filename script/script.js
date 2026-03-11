import { cars } from "./cars.js";
import { rentCars } from "./rent-cars.js";

// --- SELEZIONE DOM ---
const carDetailsContainer = document.querySelector(".car-details");
const tabs = document.querySelectorAll(".catalogue-btn");
const upButton = document.querySelector(".fixed-button.up");
const navigationBar = document.querySelector(".navigation");
const sections = {
  vendita: document.querySelector(".sales-cars"),
  noleggio: document.querySelector(".rental-section"),
};

// --- TEMPLATES ---

function createCardTemplate(auto, isRental) {
  const icon = isRental
    ? "Images/transmission-svgrepo-com.svg"
    : "Images/road-alt-svgrepo-com.svg";
  const kmOrTrans = isRental ? auto.transmission : `${auto.km} km`;
  const btnLabel = isRental ? "Prenota Ora" : "Visualizza dettagli";
  const btnHref = isRental ? `tel:3663092552` : "javascript:void(0)";

  return `
    <div class="card">
      <div class="card-img-box">
        <img src="${auto.images[0]}" alt="Foto ${auto.name}" class="card-img" loading="lazy" />
      </div>
      <div class="card-info">
        <h2 class="card-title">${auto.name}</h2>
        <p class="card-model">${auto.model}</p>
        <p class="card-fuel">
          <img src="Images/gas-station-fill.svg" alt="Icona">
          <span>${auto.fuel}</span>
        </p>
        <p class="card-km">
          <img src="${icon}" alt="Icona">
          <span>${kmOrTrans}</span>
        </p>
        <p class="card-price">€ ${auto.price}</p>
        <a href="${btnHref}" class="card-btn" aria-label="${btnLabel}">${btnLabel}</a>
      </div>
    </div>`;
}

function createDetailTemplate(car) {
  const iconRow = (src, text) => `
    <span class="car-icon"><img src="${src}" alt="Icona"> ${text}</span>`;

  return `
    <h2 class="car-title">${car.name}</h2>
    <p class="car-model">${car.model}</p>
    <div class="car-gallery-container">
      <div class="car-gallery slider">
        <button class="prev" aria-label="Precedente">&#10094;</button>
        <div class="slides">
          ${car.images
            .map(
              (img, i) => `
            <div class="slide ${i === 0 ? "active" : ""}">
              <img src="${img}" alt="Foto ${i + 1}" class="car-image" />
            </div>`,
            )
            .join("")}
        </div>
        <button class="next" aria-label="Successiva">&#10095;</button>
      </div>
      <div class="thumbnails">
        ${car.images
          .map(
            (img, i) => `
          <img src="${img}" alt="Miniatura ${i + 1}" class="thumbnail ${i === 0 ? "active" : ""}" data-index="${i}" />`,
          )
          .join("")}
      </div>
    </div>
    <div class="car-info">
      <div class="car-price">Prezzo: € ${car.price}</div>
      <div class="car-details-row">
        ${iconRow("Images/car-repair-car-svgrepo-com.svg", car.condition)}
        ${iconRow("Images/gas-station-fill.svg", car.fuel)}
        ${iconRow("Images/road-alt-svgrepo-com.svg", car.km + " km")}
        ${iconRow("Images/calendar-fill.svg", car.year)}
        ${iconRow("Images/engine-motor-svgrepo-com.svg", car.hp)}
        ${iconRow("Images/seat.png", car.seats)}
      </div>
      <div class="car-description">
        <h2>Descrizione</h2>
        <p>${car.description}</p>
      </div>
    </div>`;
}

// --- SLIDER ---

function initSlider(container) {
  if (!container) return;
  const slides = container.querySelectorAll(".slide");
  const prevBtn = container.querySelector(".prev");
  const nextBtn = container.querySelector(".next");
  const thumbnails = container.parentElement.querySelectorAll(".thumbnail");
  let current = 0;

  const showSlide = (i) => {
    slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
    thumbnails.forEach((thumb, idx) =>
      thumb.classList.toggle("active", idx === i),
    );
  };

  const nextSlide = () => {
    current = (current + 1) % slides.length;
    showSlide(current);
  };
  const prevSlide = () => {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  };

  nextBtn?.addEventListener("click", nextSlide);
  prevBtn?.addEventListener("click", prevSlide);

  // Thumbnail click handlers
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      current = index;
      showSlide(current);
    });
  });

  // Touch Support
  let startX = 0;
  container.addEventListener(
    "touchstart",
    (e) => (startX = e.touches[0].clientX),
    { passive: true },
  );
  container.addEventListener(
    "touchend",
    (e) => {
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) diff > 0 ? prevSlide() : nextSlide();
    },
    { passive: true },
  );
}

// --- RENDERING E EVENTI ---

function renderCards(data, container, isRental = false) {
  if (!container) return;
  if (!data || data.length === 0) {
    container.innerHTML = "<p>Nessuna auto disponibile</p>";
    return;
  }

  container.innerHTML = data
    .map((auto) => createCardTemplate(auto, isRental))
    .join("");

  // Attach click events per i dettagli
  const buttons = container.querySelectorAll(".card-btn");
  buttons.forEach((btn, index) => {
    btn.addEventListener("click", (e) => {
      if (isRental) return;
      e.preventDefault();
      sessionStorage.setItem("selectedCar", JSON.stringify(data[index]));
      window.location.href = "dettagli-auto.html";
    });
  });
}

function renderCarDetails(car) {
  if (!carDetailsContainer) return;
  carDetailsContainer.innerHTML = createDetailTemplate(car);
  initSlider(carDetailsContainer.querySelector(".car-gallery.slider"));
}

// --- GESTIONE NAVBAR E SCROLL ---

function handleScroll() {
  navigationBar?.classList.toggle("add-background", window.scrollY > 100);
  upButton?.classList.toggle("visible", window.scrollY > 300);
}

function init() {
  window.addEventListener("scroll", handleScroll);

  // Setup Tabs
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const isNoleggio = tab.textContent.trim().toLowerCase() === "noleggio";
      sections.vendita.classList.toggle("visible", !isNoleggio);
      sections.noleggio.classList.toggle("visible", isNoleggio);

      renderCards(
        isNoleggio ? rentCars : cars,
        isNoleggio ? sections.noleggio : sections.vendita,
        isNoleggio,
      );
    });
  });

  // Avvio Pagina Catalogo
  if (sections.vendita) renderCards(cars, sections.vendita);

  // Avvio Pagina Dettagli
  if (carDetailsContainer) {
    const selectedCar = JSON.parse(sessionStorage.getItem("selectedCar"));
    selectedCar
      ? renderCarDetails(selectedCar)
      : (carDetailsContainer.innerHTML = "<p>Nessuna auto selezionata</p>");
  }
}

init();

const sr = ScrollReveal({
  origin: "bottom",
  distance: "60px",
  duration: 1500,
  delay: 300,
  easing: "cubic-bezier(0.34, 0.56, 0.73, 1)",
  mobile: false,
});

sr.reveal(".hero-text h1", { origin: "top" });
sr.reveal(".hero-text p", { origin: "top", delay: 1000 });
sr.reveal(".btn", { origin: "bottom" });
sr.reveal(".logo", { origin: "left" });
sr.reveal(".navigation ul li", { origin: "right" });
sr.reveal(".services h2", { origin: "top" });
sr.reveal(".services > p", { origin: "top", delay: 900 });
sr.reveal(".services-card", { origin: "bottom" });

sr.reveal(".fixed-button.whatsapp", { origin: "left" });
sr.reveal(".fixed-button.phone", { origin: "left" });
if (window.innerWidth < 768) {
  sr.reveal(".fixed-button.whatsapp", { origin: "right" });
  sr.reveal(".fixed-button.phone", { origin: "right" });
}

sr.reveal(".page-title", { origin: "left" });

sr.reveal(".catalogue-btn", { origin: "right" });
if (window.innerWidth < 768) {
  sr.reveal(".catalogue-btn", { origin: "left" });
}

sr.reveal(".card", { origin: "bottom" });
sr.reveal(".car-title", { origin: "top" });
sr.reveal(".car-model", { origin: "top", delay: 900 });

sr.reveal(".car-gallery", { origin: "bottom" });
sr.reveal(".thumbnails", { origin: "right" });

sr.reveal(".container-reviews h2", { origin: "top" });
sr.reveal(".quotation.left", { origin: "left" });
sr.reveal(".quotation.right", { origin: "right" });

const container = document.querySelector(".reviews-card");
const reviews = document.querySelectorAll(".review");

let index = 0;
const totalReviews = reviews.length;

function autoScroll() {
  index++;
  if (index >= totalReviews) index = 0;

  const currentCard = reviews[index];
  const scrollAmount =
    currentCard.offsetLeft -
    (container.offsetWidth - currentCard.offsetWidth) / 2;

  container.scrollTo({
    left: scrollAmount,
    behavior: "smooth",
  });
}

let scrollInterval = setInterval(autoScroll, 5000);

const accordions = document.querySelectorAll(".accordion");

accordions.forEach((acc) => {
  const handleToggle = function (e) {
    if (e.type === "touchend") {
      e.preventDefault();
    }
    e.stopPropagation();
    const content = this.querySelector(".accordion-content");
    if (content) {
      content.classList.toggle("visible-acc");
    }
  };

  acc.addEventListener("click", handleToggle, { passive: false });
  acc.addEventListener("touchend", handleToggle, { passive: false });
});
