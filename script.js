/* ============================================================
   Dulce by Romina — logică (coș, drawer, estimator, evenimente)
   Datele care se schimbă des sunt în CONFIG și în listele de produse.
   ============================================================ */

const CONFIG = {
    // Numărul WhatsApp al atelierului, în format internațional, fără + și fără spații.
    // TODO: înlocuiește cu numărul real al Rominei.
    whatsapp: "40700000000",
    address: "Strada Mărăști 51, Bacău",
    // Zilele în care se poate ridica (0 = duminică ... 6 = sâmbătă). Acum: Mar–Sâm.
    openDays: [2, 3, 4, 5, 6],
    // Orele de ridicare. Sâmbăta se afișează doar cele dinainte de 16:00.
    pickupTimes: ["10:00", "11:30", "13:00", "15:30", "17:00"],
    saturdayLastTime: "16:00",
    // Câte zile înainte trebuie comandat un tort / alte produse.
    cakeLeadDays: 2,
    otherLeadDays: 1,
    // Estimator evenimente: lei per invitat
    perGuest: { "Nuntă": 48, "Botez": 42, "Aniversare": 42, "Corporate": 42 },
    estimateMaxFactor: 1.25,
};

/* ---------- Produse ---------- */
const cakes = [
    { id: 1, name: "Tort Trio Chocolate", description: "Blat cacao, mousse de ciocolată în trei texturi", price: 189, image: "images/cake1.jpg", badge: "Bestseller", weight: "1.2 KG", type: "cake" },
    { id: 2, name: "Tort Vanilla Berry", description: "Vanilie de Madagascar, cremă fină, fructe roșii", price: 179, image: "images/cake2.jpg", badge: "Nou", weight: "1.2 KG", type: "cake" },
    { id: 3, name: "Tort Raspberry Noir", description: "Ciocolată neagră, zmeură, crocant de migdale", price: 198, image: "images/cake3.jpg", weight: "1.4 KG", type: "cake" },
    { id: 4, name: "Tort Pistachio Cloud", description: "Fistic copt, vanilie, blat pufos de migdale", price: 215, image: "images/cake4.jpg", weight: "1.2 KG", type: "cake" },
    { id: 5, name: "Tort Caramel Fleur de Sel", description: "Caramel sărat, ciocolată cu lapte, alune", price: 195, image: "images/cake5.jpg", weight: "1.3 KG", type: "cake" },
    { id: 6, name: "Tort Tiramisu", description: "Mascarpone, cafea de specialitate, cacao", price: 175, image: "images/cake6.jpg", weight: "1.2 KG", type: "cake" },
];

const singles = [
    { id: 11, name: "Ecler Vanilie & Caramel", description: "Cremă de vanilie, caramel sărat", price: 24, image: "images/eclair.jpg", badge: "Proaspăt azi", weight: "1 BUC" },
    { id: 12, name: "Tartă Raspberry", description: "Zmeură, cremă fină de migdale", price: 26, image: "images/tart.jpg", weight: "1 BUC" },
    { id: 13, name: "Cinnamon Roll Fistic", description: "Aluat dospit lent, cremă de fistic", price: 28, image: "images/roll.jpg", badge: "Favoritul casei", weight: "1 BUC" },
    { id: 14, name: "Mini Choux Praliné", description: "Praliné de alune, choux crocant", price: 22, image: "images/choux.jpg", weight: "1 BUC" },
];

const boxes = [
    { id: 21, name: "Cinnamon Rolls Box", description: "6 rulouri: fistic, caramel și vanilie", price: 145, image: "images/box1.jpg", badge: "6 bucăți", weight: "BOX" },
    { id: 22, name: "Mini-Choux Platou", description: "12 mini-choux în patru arome", price: 168, image: "images/box3.jpg", badge: "12 bucăți", weight: "PLATOU" },
    { id: 23, name: "Dulce Discovery Box", description: "Selecția Rominei pentru un cadou special", price: 189, image: "images/box2.jpg", badge: "Gift ready", weight: "BOX" },
];

const allProducts = [...cakes, ...singles, ...boxes];

/* ---------- Utilitare ---------- */
const $ = (sel) => document.querySelector(sel);
const ICON = {
    plus: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12M12 6v12"/></svg>',
    minus: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12"/></svg>',
    trash: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14M9 7V4h6v3M8 7l1 13h6l1-13"/></svg>',
    arrow: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></svg>',
    bag: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
};

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => n.toLocaleString("ro-RO");

function openWhatsApp(message) {
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}

/* ---------- Randare produse ---------- */
function productCard(p, compact) {
    return `
    <article class="product-card${compact ? " compact" : ""}">
      <div class="product-photo">
        <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" />
        ${p.badge ? `<span class="photo-badge">${escapeHtml(p.badge)}</span>` : ""}
        <button class="quick-add" type="button" data-add="${p.id}" aria-label="Adaugă ${escapeHtml(p.name)}">${ICON.plus}</button>
      </div>
      <div class="product-info">
        <div class="product-title-row"><h3>${escapeHtml(p.name)}</h3><span>${escapeHtml(p.weight)}</span></div>
        <p>${escapeHtml(p.description)}</p>
        <div class="buy-row">
          <strong>${p.price} LEI</strong>
          <button type="button" data-add="${p.id}">Adaugă ${ICON.plus}</button>
        </div>
      </div>
    </article>`;
}

function boxCard(p) {
    return `
    <article class="box-card">
      <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" />
      <div>
        <span>${escapeHtml(p.badge)}</span>
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.description)}</p>
        <div><strong>${p.price} LEI</strong><button type="button" data-add="${p.id}">Adaugă în coș ${ICON.plus}</button></div>
      </div>
    </article>`;
}

$("#cakesGrid").innerHTML = cakes.map((p) => productCard(p, false)).join("");
$("#singlesGrid").innerHTML = singles.map((p) => productCard(p, true)).join("");
$("#boxTrack").innerHTML = boxes.map(boxCard).join("");

/* ---------- Coș ---------- */
const STORAGE_KEY = "dulce-cart-v1";
let cart = [];          // [{ id, quantity }]
let orderSent = false;
let selectedDate = null; // "YYYY-MM-DD"
let selectedTime = null;
let customerName = "";

try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { cart = []; }
cart = cart.filter((l) => allProducts.some((p) => p.id === l.id));

const saveCart = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {} };
const lines = () => cart.map((l) => ({ ...allProducts.find((p) => p.id === l.id), quantity: l.quantity }));
const cartCount = () => cart.reduce((s, l) => s + l.quantity, 0);
const cartTotal = () => lines().reduce((s, l) => s + l.price * l.quantity, 0);
const hasCake = () => lines().some((l) => l.type === "cake");

function addToCart(id) {
    const found = cart.find((l) => l.id === id);
    if (found) found.quantity += 1; else cart.push({ id, quantity: 1 });
    orderSent = false;
    saveCart();
    openDrawer();
}

function changeQuantity(id, delta) {
    const line = cart.find((l) => l.id === id);
    if (!line) return;
    line.quantity += delta;
    cart = cart.filter((l) => l.quantity > 0);
    saveCart();
    renderDrawer();
}

function removeLine(id) {
    cart = cart.filter((l) => l.id !== id);
    saveCart();
    renderDrawer();
}

/* ---------- Zile și ore de ridicare ---------- */
function availableDates() {
    const lead = hasCake() ? CONFIG.cakeLeadDays : CONFIG.otherLeadDays;
    const result = [];
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + lead);
    while (result.length < 4) {
        if (CONFIG.openDays.includes(d.getDay())) result.push(new Date(d));
        d.setDate(d.getDate() + 1);
    }
    return result;
}

const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const dayLabel = (d) => d.toLocaleDateString("ro-RO", { weekday: "short" }).replace(".", "");
const monthLabel = (d) => d.toLocaleDateString("ro-RO", { month: "short" }).replace(".", "");
const longDate = (d) => d.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });

function timesFor(dateIso) {
    const d = parseIso(dateIso);
    return d.getDay() === 6 ? CONFIG.pickupTimes.filter((t) => t < CONFIG.saturdayLastTime) : CONFIG.pickupTimes;
}

function ensureSelection() {
    const dates = availableDates().map(isoDate);
    if (!dates.includes(selectedDate)) selectedDate = dates[0];
    const times = timesFor(selectedDate);
    if (!times.includes(selectedTime)) selectedTime = times[0];
}

/* ---------- Drawer ---------- */
const layer = $("#drawerLayer");
const body = $("#drawerBody");

function openDrawer() { layer.hidden = false; document.body.style.overflow = "hidden"; renderDrawer(); }
function closeDrawer() { layer.hidden = true; document.body.style.overflow = ""; }

function renderDrawer() {
    const count = cartCount();
    $("#cartCount").textContent = count;
    $("#drawerCount").textContent = `${count} ${count === 1 ? "produs" : "produse"}`;

    if (orderSent) {
        body.innerHTML = `
      <div class="order-confirmed">
        <span>DR</span>
        <h2>Aproape gata!</h2>
        <p>Am deschis WhatsApp cu comanda ta. Trimite mesajul ca să o primim, iar Romina îți confirmă ridicarea.</p>
        <button type="button" data-close>Continuă cumpărăturile</button>
      </div>`;
        return;
    }

    if (cart.length === 0) {
        body.innerHTML = `
      <div class="empty-cart">${ICON.bag}<h3>Coșul tău este gol</h3><p>Descoperă colecția noastră proaspătă și adaugă ceva dulce.</p><button type="button" data-close>Vezi produsele</button></div>`;
        return;
    }

    ensureSelection();
    const total = cartTotal();

    const linesHtml = lines().map((l) => `
    <article class="cart-line">
      <img src="${l.image}" alt="" />
      <div class="line-details">
        <strong>${escapeHtml(l.name)}</strong>
        <span>${escapeHtml(l.weight)} · ${l.price} lei</span>
        <div class="quantity">
          <button type="button" data-qty="${l.id}" data-delta="-1" aria-label="Scade cantitatea">${ICON.minus}</button>
          <b>${l.quantity}</b>
          <button type="button" data-qty="${l.id}" data-delta="1" aria-label="Crește cantitatea">${ICON.plus}</button>
        </div>
      </div>
      <div class="line-total">
        <strong>${l.price * l.quantity} lei</strong>
        <button type="button" data-remove="${l.id}" aria-label="Șterge">${ICON.trash}</button>
      </div>
    </article>`).join("");

    const datesHtml = availableDates().map((d) => {
        const iso = isoDate(d);
        return `<button type="button" class="${iso === selectedDate ? "active" : ""}" data-date="${iso}"><small>${monthLabel(d)}</small>${dayLabel(d)} ${d.getDate()}</button>`;
    }).join("");

    const timesHtml = timesFor(selectedDate).map((t) =>
        `<button type="button" class="${t === selectedTime ? "active" : ""}" data-time="${t}">${t}</button>`).join("");

    body.innerHTML = `
    <div class="cart-lines">${linesHtml}</div>
    <div class="pickup">
      <div class="pickup-title"><span>1</span><div><strong>Alege ziua ridicării</strong><small>${escapeHtml(CONFIG.address)}${hasCake() ? " · torturile se comandă cu 48h înainte" : ""}</small></div></div>
      <div class="date-picker">${datesHtml}</div>
      <div class="pickup-title"><span>2</span><div><strong>Alege intervalul</strong><small>Comanda va fi gata la ora selectată</small></div></div>
      <div class="time-picker">${timesHtml}</div>
      <label class="pickup-name">Numele tău<input type="text" id="customerName" placeholder="Ex: Maria Popescu" value="${escapeHtml(customerName)}" /></label>
    </div>
    <div class="checkout-summary">
      <p><span>Subtotal</span><strong>${total} lei</strong></p>
      <p><span>Ridicare din atelier</span><strong>Gratuit</strong></p>
      <div><span>Total</span><strong>${total} LEI</strong></div>
      <button type="button" id="sendOrder">Trimite comanda ${ICON.arrow}</button>
      <small>Plata se face la ridicare · Confirmare prin mesaj</small>
    </div>`;
}

function sendOrder() {
    const nameInput = $("#customerName");
    customerName = nameInput ? nameInput.value.trim() : customerName;
    if (!customerName) {
        nameInput.focus();
        nameInput.style.borderColor = "#c0525f";
        return;
    }
    const items = lines().map((l) => `• ${l.quantity} × ${l.name} (${l.weight}) – ${l.price * l.quantity} lei`).join("\n");
    const message =
        `Bună! Aș dori să plasez o comandă (ridicare din atelier):

${items}

Total: ${cartTotal()} lei
Ridicare: ${longDate(parseIso(selectedDate))}, ora ${selectedTime}
Nume: ${customerName}`;

    openWhatsApp(message);
    cart = [];
    saveCart();
    orderSent = true;
    renderDrawer();
}

/* ---------- Evenimente de pe pagină ---------- */
document.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.add) return addToCart(Number(t.dataset.add));
    if (t.dataset.qty) return changeQuantity(Number(t.dataset.qty), Number(t.dataset.delta));
    if (t.dataset.remove) return removeLine(Number(t.dataset.remove));
    if (t.dataset.date) { selectedDate = t.dataset.date; selectedTime = null; return renderDrawer(); }
    if (t.dataset.time) { selectedTime = t.dataset.time; return renderDrawer(); }
    if (t.hasAttribute("data-close")) return closeDrawer();
    if (t.id === "sendOrder") return sendOrder();
});

document.addEventListener("input", (e) => {
    if (e.target.id === "customerName") customerName = e.target.value;
});

$("#openCart").addEventListener("click", openDrawer);
$("#closeCart").addEventListener("click", closeDrawer);
$("#drawerScrim").addEventListener("click", closeDrawer);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !layer.hidden) closeDrawer(); });

$("#boxPrev").addEventListener("click", () => $("#boxTrack").scrollBy({ left: -420, behavior: "smooth" }));
$("#boxNext").addEventListener("click", () => $("#boxTrack").scrollBy({ left: 420, behavior: "smooth" }));

/* ---------- Formular evenimente + estimator ---------- */
const eventType = $("#eventType");
const guests = $("#guests");
const eventFile = $("#eventFile");

function updateEstimate() {
    const n = Number(guests.value) || 0;
    const pct = ((n - Number(guests.min)) / (Number(guests.max) - Number(guests.min))) * 100;
    guests.style.setProperty("--fill", `${pct}%`);
    $("#guestsValue").textContent = `${n} persoane`;
    const base = n * (CONFIG.perGuest[eventType.value] || 42);
    $("#estimateValue").textContent = `${money(base)} — ${money(Math.round(base * CONFIG.estimateMaxFactor))} LEI`;
}
eventType.addEventListener("change", updateEstimate);
guests.addEventListener("input", updateEstimate);
updateEstimate();

// Data minimă a evenimentului: peste 7 zile
const minEvent = new Date(); minEvent.setDate(minEvent.getDate() + 7);
$("#eventDate").min = isoDate(minEvent);

eventFile.addEventListener("change", () => {
    const f = eventFile.files[0];
    if (!f) { $("#uploadTitle").textContent = "Încarcă model foto pentru tort"; $("#uploadHint").textContent = "JPG, PNG · maximum 10 MB"; return; }
    if (f.size > 10 * 1024 * 1024) {
        alert("Fișierul depășește 10 MB. Alege o poză mai mică.");
        eventFile.value = "";
        return;
    }
    $("#uploadTitle").textContent = f.name;
    $("#uploadHint").textContent = "Poza se trimite în conversația WhatsApp";
});

$("#eventForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = $("#eventDate").value;
    const n = Number(guests.value) || 0;
    const base = n * (CONFIG.perGuest[eventType.value] || 42);
    const message =
        `Bună! Aș dori o ofertă pentru un eveniment:

Tip eveniment: ${eventType.value}
Număr invitați: ${n}
Data: ${date ? parseIso(date).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" }) : "încă nedecisă"}
Telefon: ${$("#eventPhone").value}
Estimare orientativă: ${money(base)} – ${money(Math.round(base * CONFIG.estimateMaxFactor))} lei${eventFile.files[0] ? "\nVoi trimite poza modelului de tort în această conversație." : ""}`;
    openWhatsApp(message);
});

/* ---------- Categoria activă în meniu ---------- */
const navLinks = [...document.querySelectorAll(".category-inner a")];
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
        }
    });
}, { rootMargin: "-40% 0px -55% 0px" });
["torturi", "monoportii", "boxuri", "evenimente"].forEach((id) => observer.observe(document.getElementById(id)));

/* ---------- Start ---------- */
$("#cartCount").textContent = cartCount();
