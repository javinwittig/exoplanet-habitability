const SVG_NS = "http://www.w3.org/2000/svg";
const sky = document.getElementById("sky");

const DATA_FILE = "planets.json";
const FALLBACK_FILE = "planets_sample.json";

let planets = [];
let currentStep = -1;

async function loadData() {
  try {
    const res = await fetch(DATA_FILE);
    if (!res.ok) throw new Error("not found");
    planets = await res.json();
    console.log(`${planets.length} planets loaded from ${DATA_FILE}.`);
  } catch (e) {
    const res = await fetch(FALLBACK_FILE);
    planets = await res.json();
    console.warn(
      `${DATA_FILE} not found — showing demo data (${FALLBACK_FILE}). ` +
      `Export your real results from the notebook to replace it.`
    );
  }
}

function renderPlanets() {
  const n = planets.length;
  const svgW = 1000;
  const svgH = 620;
  const padX = 40;
  const padY = 40;
  const usableW = svgW - padX * 2;
  const usableH = svgH - padY * 2;

  const cols = Math.ceil(Math.sqrt(n * usableW / usableH));
  const rows = Math.ceil(n / cols);

  const spacingX = usableW / (cols || 1);
  const spacingY = usableH / (rows || 1);
  const radius = Math.min(spacingX, spacingY) * 0.32;

  const frag = document.createDocumentFragment();
  planets.forEach((p, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = padX + spacingX * (col + 0.5);
    const cy = padY + spacingY * (row + 0.5);

    const dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("cx", cx.toFixed(2));
    dot.setAttribute("cy", cy.toFixed(2));
    dot.setAttribute("r", radius.toFixed(2));
    dot.setAttribute("class", "dot");
    dot.dataset.predicted = p.predicted_habitable ? "1" : "0";
    dot.dataset.actual = p.actual_habitable ? "1" : "0";
    frag.appendChild(dot);
  });
  sky.appendChild(frag);
}

function applyStep(step) {
  if (step === currentStep) return;
  currentStep = step;

  const total = planets.length;
  const predicted = planets.filter((p) => p.predicted_habitable).length;
  const correct = planets.filter((p) => p.predicted_habitable && p.actual_habitable).length;

  document.getElementById("count-total").textContent = total;
  document.getElementById("count-predicted").textContent = step >= 1 ? predicted : "—";
  document.getElementById("count-correct").textContent = step >= 2 ? correct : "—";

  document.querySelectorAll(".log-row").forEach((row) => {
    const rowStep = Number(row.dataset.row);
    row.classList.toggle("active", rowStep <= Math.min(step, 2));
  });

  document.querySelectorAll(".dot").forEach((dot) => {
    dot.classList.remove("predicted", "correct", "false-alarm");
    const isPredicted = dot.dataset.predicted === "1";
    const isActual = dot.dataset.actual === "1";

    if (step >= 1 && isPredicted) dot.classList.add("predicted");
    if (step >= 2 && isPredicted) {
      dot.classList.add(isActual ? "correct" : "false-alarm");
    }
  });
}

function animateCounters() {
  document.querySelectorAll(".matrix-value[data-target]").forEach((el) => {
    const target = parseInt(el.dataset.target, 10);
    if (el.dataset.animated === "true") return;
    el.dataset.animated = "true";

    const duration = 800;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

function setupScroll() {
  const steps = document.querySelectorAll(".step");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          applyStep(Number(entry.target.dataset.step));
        }
      });
    },
    { threshold: 0.4 }
  );
  steps.forEach((s) => observer.observe(s));

  const end = document.querySelector(".step-end");
  const endObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        applyStep(2);
        currentStep = -1;
      }
    }),
    { threshold: 0.3 }
  );
  endObserver.observe(end);

  const matrixSection = document.querySelector(".step-matrix");
  if (matrixSection) {
    const matrixObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCounters();
          }
        });
      },
      { threshold: 0.3 }
    );
    matrixObserver.observe(matrixSection);
  }
}

(function init() {
  loadData().then(() => {
    renderPlanets();
    applyStep(0);
    setupScroll();
  });
})();
