const API_BASE = window.PARADISO_API_BASE_URL ?? "";
const SESSION_KEY = "paradiso_admin_token";
const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const dateTime = new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short" });

let token = sessionStorage.getItem(SESSION_KEY) || "";
let orders = [];
let ledgerEntries = [];
let pollTimer = null;
let siteDefaults = null;
let siteDraft = null;
let siteUpdatedAt = "";
let siteDirty = false;
let activeSiteTheme = "day";
let activeSiteCategory = "";
let pendingSiteUpload = null;

const ordersBody = document.querySelector("#orders-body");
const emptyState = document.querySelector("#admin-empty");
const ledgerBody = document.querySelector("#ledger-body");
const ledgerEmpty = document.querySelector("#ledger-empty");
const searchInput = document.querySelector("#order-search");
const statusFilter = document.querySelector("#status-filter");
const orderDialog = document.querySelector("#order-dialog");
const loginView = document.querySelector("#admin-login");
const loginForm = document.querySelector("#admin-login-form");
const emailInput = document.querySelector("#admin-email");
const passwordInput = document.querySelector("#admin-password");
const passwordToggle = document.querySelector("#admin-password-toggle");
const loginError = document.querySelector("#admin-login-error");
const adminHeader = document.querySelector("#admin-header");
const adminMain = document.querySelector("#admin-main");
const ledgerForm = document.querySelector("#ledger-form");
const qrForm = document.querySelector("#qr-form");
const qrContent = document.querySelector("#qr-content");
const qrOutput = document.querySelector("#qr-output");
const qrPrintValue = document.querySelector("#qr-print-value");
const qrMessage = document.querySelector("#qr-form-message");
const printQrButton = document.querySelector("#print-qr");
const siteView = document.querySelector("#site-view");
const siteProducts = document.querySelector("#site-products");
const siteCategorySelect = document.querySelector("#site-category");
const siteCategoryLabel = document.querySelector("#site-category-label");
const siteImageUpload = document.querySelector("#site-image-upload");
const saveSiteButton = document.querySelector("#save-site-content");

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const result = await response.json().catch(() => ({}));
  if (response.status === 401 && path !== "/v1/auth/login") {
    lockAdmin("La sessione è scaduta. Accedi di nuovo.");
  }
  if (!response.ok) {
    const error = new Error(result.error?.message || "Operazione non riuscita.");
    error.code = result.error?.code;
    error.status = response.status;
    throw error;
  }
  return result;
}

async function unlockAdmin() {
  loginError.hidden = true;
  passwordInput.removeAttribute("aria-invalid");
  loginView.hidden = true;
  adminHeader.hidden = false;
  adminMain.hidden = false;
  window.scrollTo({ top: 0, behavior: "auto" });
  await refreshAll();
  try {
    await loadSiteEditor();
  } catch (error) {
    showAdminToast(error.message, true);
  }
  clearInterval(pollTimer);
  pollTimer = window.setInterval(() => loadBookings({ quiet: true }), 30000);
  searchInput.focus();
}

function lockAdmin(message = "") {
  clearInterval(pollTimer);
  pollTimer = null;
  token = "";
  sessionStorage.removeItem(SESSION_KEY);
  if (orderDialog.open) orderDialog.close();
  orders = [];
  ledgerEntries = [];
  siteDraft = null;
  siteDirty = false;
  ordersBody.innerHTML = "";
  ledgerBody.innerHTML = "";
  adminHeader.hidden = true;
  adminMain.hidden = true;
  loginView.hidden = false;
  passwordInput.value = "";
  passwordInput.type = "password";
  passwordInput.removeAttribute("aria-invalid");
  loginError.textContent = message || "Accesso non riuscito.";
  loginError.hidden = !message;
  updatePasswordToggle();
  window.scrollTo({ top: 0, behavior: "auto" });
  emailInput.focus();
}

function updatePasswordToggle() {
  const isVisible = passwordInput.type === "text";
  passwordToggle.setAttribute("aria-label", isVisible ? "Nascondi password" : "Mostra password");
  passwordToggle.setAttribute("title", isVisible ? "Nascondi password" : "Mostra password");
  passwordToggle.innerHTML = `<i data-lucide="${isVisible ? "eye-off" : "eye"}"></i>`;
  refreshIcons();
}

async function refreshAll() {
  const button = document.querySelector("#refresh-data");
  button.disabled = true;
  button.querySelector("svg")?.classList.add("is-spinning");
  try {
    await Promise.all([loadBookings(), loadAccounting()]);
  } catch (error) {
    showAdminToast(error.message, true);
  } finally {
    button.disabled = false;
    button.querySelector("svg")?.classList.remove("is-spinning");
  }
}

async function loadBookings({ quiet = false } = {}) {
  try {
    const result = await api("/v1/bookings?limit=300");
    const hadOrders = orders.length;
    orders = result.bookings || [];
    renderOrders();
    if (quiet && hadOrders && orders.filter(order => order.status === "Nuovo").length > ordersBody.dataset.newCount) {
      showAdminToast("È arrivata una nuova prenotazione.");
    }
    ordersBody.dataset.newCount = String(orders.filter(order => order.status === "Nuovo").length);
  } catch (error) {
    if (!quiet) throw error;
  }
}

async function loadAccounting() {
  const from = document.querySelector("#accounting-from").value;
  const to = document.querySelector("#accounting-to").value;
  const query = new URLSearchParams({ from, to });
  const [summary, ledger] = await Promise.all([
    api(`/v1/accounting/summary?${query}`),
    api(`/v1/accounting/entries?${query}`),
  ]);
  ledgerEntries = ledger.entries || [];
  document.querySelector("#accounting-income").textContent = euro.format(summary.income);
  document.querySelector("#accounting-expenses").textContent = euro.format(summary.expenses);
  document.querySelector("#accounting-refunds").textContent = euro.format(summary.refunds);
  document.querySelector("#accounting-net").textContent = euro.format(summary.net);
  document.querySelector("#accounting-net").classList.toggle("negative-value", summary.net < 0);
  renderLedger();
}

function filteredOrders() {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  return orders.filter((order) => {
    const haystack = `${order.code} ${order.customerName} ${order.phone} ${order.email ?? ""}`.toLowerCase();
    return (!query || haystack.includes(query)) && (status === "all" || order.status === status);
  });
}

function renderOrders() {
  const visible = filteredOrders();
  ordersBody.innerHTML = visible.map(orderRow).join("");
  ordersBody.closest("table").hidden = visible.length === 0;
  emptyState.classList.toggle("is-visible", visible.length === 0);
  renderStats();
  refreshIcons();
}

function orderRow(order) {
  const itemCount = order.items.reduce((sum, entry) => sum + entry.quantity, 0);
  return `
    <tr>
      <td><strong>${escapeHtml(order.code)}</strong><span>${formatCreatedAt(order.createdAt)}</span></td>
      <td><strong>${escapeHtml(order.customerName)}</strong><span>${escapeHtml(order.phone)}</span></td>
      <td><strong>${formatDate(order.reservationDate)} · ${escapeHtml(order.reservationTime)}</strong><span>${order.guests} ${order.guests === 1 ? "persona" : "persone"}</span></td>
      <td><strong>${itemCount ? `${itemCount} ${itemCount === 1 ? "prodotto" : "prodotti"}` : "Solo tavolo"}</strong><span>${escapeHtml(order.paymentMethod)}</span></td>
      <td><strong>${euro.format(order.estimatedTotal)}</strong></td>
      <td>
        <select class="table-status" data-status-id="${escapeHtml(order.id)}" aria-label="Stato ${escapeHtml(order.code)}">
          ${["Nuovo", "Confermato", "Completato", "Annullato"].map(status => `<option ${order.status === status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
      </td>
      <td>
        <button class="icon-button row-view" type="button" data-view-id="${escapeHtml(order.id)}" aria-label="Vedi dettagli ${escapeHtml(order.code)}" title="Dettagli">
          <i data-lucide="eye"></i>
        </button>
      </td>
    </tr>
  `;
}

function renderStats() {
  document.querySelector("#stat-total").textContent = orders.length;
  document.querySelector("#stat-new").textContent = orders.filter(order => order.status === "Nuovo").length;
  document.querySelector("#stat-guests").textContent = orders
    .filter(order => order.status !== "Annullato")
    .reduce((sum, order) => sum + order.guests, 0);
  document.querySelector("#stat-revenue").textContent = euro.format(
    orders.filter(order => order.status !== "Annullato").reduce((sum, order) => sum + order.estimatedTotal, 0),
  );
}

function renderLedger() {
  ledgerBody.innerHTML = ledgerEntries.map(entry => {
    const sign = entry.kind === "income" ? "+" : "−";
    const labels = { income: "Incasso", expense: "Spesa", refund: "Rimborso" };
    return `
      <tr>
        <td><strong>${formatDate(entry.occurredOn)}</strong></td>
        <td><span class="ledger-kind ${entry.kind}">${labels[entry.kind]}</span></td>
        <td><strong>${escapeHtml(entry.category)}</strong><span>${escapeHtml(entry.paymentMethod || "—")}</span></td>
        <td><strong>${escapeHtml(entry.description || entry.bookingCode || "—")}</strong>${entry.bookingCode ? `<span>${escapeHtml(entry.bookingCode)}</span>` : ""}</td>
        <td><strong class="ledger-amount ${entry.kind}">${sign}${euro.format(entry.amount)}</strong></td>
      </tr>
    `;
  }).join("");
  ledgerBody.closest("table").hidden = ledgerEntries.length === 0;
  ledgerEmpty.classList.toggle("is-visible", ledgerEntries.length === 0);
  refreshIcons();
}

function showOrder(id) {
  const order = orders.find(entry => entry.id === id);
  if (!order) return;
  const alreadyPaid = ledgerEntries.some(entry => entry.bookingId === order.id && entry.kind === "income");

  document.querySelector("#order-detail").innerHTML = `
    <div class="detail-title">
      <p>${escapeHtml(order.code)} · ${escapeHtml(order.status)}</p>
      <h2>${escapeHtml(order.customerName)}</h2>
    </div>
    <div class="detail-grid">
      <section class="detail-block">
        <h3>Contatti</h3>
        <p><a href="tel:${escapeHtml(order.phone)}">${escapeHtml(order.phone)}</a></p>
        <p><a href="mailto:${escapeHtml(order.email)}">${escapeHtml(order.email || "Email non indicata")}</a></p>
      </section>
      <section class="detail-block">
        <h3>Prenotazione</h3>
        <p>${formatDate(order.reservationDate)} alle ${escapeHtml(order.reservationTime)}</p>
        <p>${order.guests} ${order.guests === 1 ? "persona" : "persone"}</p>
      </section>
      <section class="detail-block full">
        <h3>Ordine</h3>
        ${order.items.length ? `
          <ul class="detail-items">
            ${order.items.map(entry => `<li><span>${entry.quantity} × ${escapeHtml(entry.name)}</span><strong>${euro.format(entry.price * entry.quantity)}</strong></li>`).join("")}
          </ul>
        ` : "<p>Nessun prodotto preordinato.</p>"}
        <div class="detail-total"><span>Totale stimato</span><strong>${euro.format(order.estimatedTotal)}</strong></div>
      </section>
      <section class="detail-block full">
        <h3>Note</h3>
        <p>${escapeHtml(order.notes || "Nessuna nota.")}</p>
      </section>
      <section class="detail-block full income-block">
        <h3>Contabilità</h3>
        ${alreadyPaid ? `
          <p class="income-recorded"><i data-lucide="circle-check"></i> Incasso già registrato nel libro cassa.</p>
        ` : `
          <form id="booking-income-form" data-booking-id="${escapeHtml(order.id)}">
            <div class="form-row three-columns">
              <label>Importo
                <input name="amount" type="number" min="0.01" step="0.01" value="${Number(order.estimatedTotal).toFixed(2)}" required />
              </label>
              <label>Metodo
                <select name="paymentMethod"><option>Contanti</option><option>Carta</option><option>Bonifico</option><option>Altro</option></select>
              </label>
              <label>Data
                <input name="occurredOn" type="date" value="${todayISO()}" required />
              </label>
            </div>
            <p class="form-message" role="status"></p>
            <button class="button primary" type="submit"><i data-lucide="badge-euro"></i><span>Registra incasso</span></button>
          </form>
        `}
      </section>
    </div>
  `;
  orderDialog.showModal();
  refreshIcons();
}

async function updateStatus(select) {
  const order = orders.find(entry => entry.id === select.dataset.statusId);
  if (!order) return;
  const previous = order.status;
  select.disabled = true;
  try {
    await api(`/v1/bookings/${encodeURIComponent(order.id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: select.value }),
    });
    order.status = select.value;
    renderStats();
    showAdminToast(`Stato di ${order.code} aggiornato.`);
  } catch (error) {
    select.value = previous;
    showAdminToast(error.message, true);
  } finally {
    select.disabled = false;
  }
}

async function registerBookingIncome(form) {
  const data = new FormData(form);
  const button = form.querySelector("button[type=submit]");
  const message = form.querySelector(".form-message");
  button.disabled = true;
  message.textContent = "";
  try {
    await api(`/v1/accounting/bookings/${encodeURIComponent(form.dataset.bookingId)}/register-income`, {
      method: "POST",
      body: JSON.stringify({
        amount: Number(data.get("amount")),
        paymentMethod: data.get("paymentMethod"),
        occurredOn: data.get("occurredOn"),
      }),
    });
    message.textContent = "Incasso registrato.";
    await loadAccounting();
    window.setTimeout(() => orderDialog.close(), 500);
  } catch (error) {
    message.textContent = error.message;
    message.classList.add("is-error");
  } finally {
    button.disabled = false;
  }
}

async function createLedgerEntry(event) {
  event.preventDefault();
  const data = new FormData(ledgerForm);
  const button = ledgerForm.querySelector("button[type=submit]");
  const message = document.querySelector("#ledger-form-message");
  button.disabled = true;
  message.textContent = "";
  message.classList.remove("is-error");
  try {
    await api("/v1/accounting/entries", {
      method: "POST",
      body: JSON.stringify({
        occurredOn: data.get("occurredOn"),
        kind: data.get("kind"),
        category: data.get("category"),
        description: data.get("description"),
        paymentMethod: data.get("paymentMethod"),
        amount: Number(data.get("amount")),
      }),
    });
    message.textContent = "Movimento registrato.";
    ledgerForm.reset();
    ledgerForm.elements.occurredOn.value = todayISO();
    await loadAccounting();
  } catch (error) {
    message.textContent = error.message;
    message.classList.add("is-error");
  } finally {
    button.disabled = false;
  }
}

function exportOrdersCsv() {
  const header = ["Codice", "Creato il", "Nome", "Telefono", "Email", "Data", "Ora", "Persone", "Prodotti", "Totale stimato", "Pagamento", "Stato", "Note"];
  const rows = orders.map(order => [
    order.code, formatCreatedAt(order.createdAt), order.customerName, order.phone, order.email,
    formatDate(order.reservationDate), order.reservationTime, order.guests,
    order.items.map(entry => `${entry.quantity}x ${entry.name}`).join(" | "),
    Number(order.estimatedTotal).toFixed(2).replace(".", ","), order.paymentMethod, order.status, order.notes,
  ]);
  downloadCsv(`paradiso-prenotazioni-${todayISO()}.csv`, [header, ...rows]);
}

function exportLedgerCsv() {
  const labels = { income: "Incasso", expense: "Spesa", refund: "Rimborso" };
  const header = ["Data", "Tipo", "Categoria", "Descrizione", "Metodo", "Importo", "Prenotazione"];
  const rows = ledgerEntries.map(entry => [
    formatDate(entry.occurredOn), labels[entry.kind], entry.category, entry.description,
    entry.paymentMethod, Number(entry.amount).toFixed(2).replace(".", ","), entry.bookingCode || "",
  ]);
  downloadCsv(`paradiso-contabilita-${todayISO()}.csv`, [header, ...rows]);
}

function downloadCsv(filename, rows) {
  if (rows.length <= 1) return;
  const csv = rows.map(row => row.map(csvCell).join(";")).join("\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function generateQrCode(event) {
  event.preventDefault();
  const value = qrContent.value.trim();
  qrMessage.textContent = "";
  qrMessage.classList.remove("is-error");

  if (!value) {
    qrMessage.textContent = "Inserisci un sito o una parola.";
    qrMessage.classList.add("is-error");
    qrContent.focus();
    return;
  }

  try {
    const code = window.qrcode(0, "M");
    code.addData(value);
    code.make();
    qrOutput.innerHTML = code.createSvgTag({
      cellSize: 8,
      margin: 32,
      scalable: true,
      title: "QR Code Paradiso",
      alt: `QR Code per ${value}`,
    });
    qrOutput.classList.add("has-qr");
    qrPrintValue.textContent = value;
    printQrButton.disabled = false;
    qrMessage.textContent = "QR Code generato.";
  } catch {
    qrMessage.textContent = "Il testo è troppo lungo per creare il QR Code.";
    qrMessage.classList.add("is-error");
    printQrButton.disabled = true;
  }
}

function clearQrCode() {
  qrForm.reset();
  qrOutput.classList.remove("has-qr");
  qrOutput.innerHTML = '<i data-lucide="scan-line"></i><span>Il QR Code apparirà qui</span>';
  qrPrintValue.textContent = "";
  qrMessage.textContent = "";
  qrMessage.classList.remove("is-error");
  printQrButton.disabled = true;
  refreshIcons();
  qrContent.focus();
}

function cloneSiteContent(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function siteImageSource(value) {
  const source = String(value ?? "").trim();
  if (
    source.startsWith("assets/") ||
    source.startsWith("/media/") ||
    source.startsWith("https://") ||
    source.startsWith("http://")
  ) {
    return source;
  }
  return "assets/images/breakfast.jpg";
}

function siteSlug(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function prepareSiteContent(content) {
  const prepared = cloneSiteContent(content);
  prepared.version = 1;
  for (const theme of ["day", "night"]) {
    const menu = prepared.menus[theme];
    menu.categoryOrder = Array.isArray(menu.categoryOrder)
      ? menu.categoryOrder.filter(key => menu.categories[key])
      : Object.keys(menu.categories);
    Object.keys(menu.categories).forEach(key => {
      if (!menu.categoryOrder.includes(key)) menu.categoryOrder.push(key);
    });
    menu.categoryOrder.forEach(categoryKey => {
      menu.categories[categoryKey].items.forEach((product, index) => {
        product.id ||= `${theme}-${categoryKey}-${siteSlug(product.name) || index + 1}`;
        product.description ||= "";
        product.image ||= "assets/images/breakfast.jpg";
        product.fact ||= "";
      });
    });
  }
  return prepared;
}

async function loadSiteEditor({ confirmDiscard = false } = {}) {
  if (confirmDiscard && siteDirty && !window.confirm("Scartare le modifiche non pubblicate?")) return;
  if (!siteDefaults) {
    const defaultsResponse = await fetch("site-defaults.json", { cache: "no-store" });
    if (!defaultsResponse.ok) throw new Error("Catalogo iniziale non disponibile.");
    siteDefaults = await defaultsResponse.json();
  }
  const current = await api("/v1/site-content");
  siteDraft = prepareSiteContent(current.content || siteDefaults);
  siteUpdatedAt = current.updatedAt || "";
  activeSiteCategory = siteDraft.menus[activeSiteTheme].categoryOrder[0];
  setSiteDirty(false);
  renderSiteEditor();
}

function setSiteDirty(dirty = true) {
  siteDirty = dirty;
  const status = document.querySelector(".site-publish-status");
  status.classList.toggle("is-dirty", dirty);
  document.querySelector("#site-dirty-label").textContent = dirty
    ? "Modifiche non pubblicate"
    : "Nessuna modifica da pubblicare";
  saveSiteButton.disabled = !dirty;
}

function renderSiteEditor() {
  if (!siteDraft) return;
  renderSiteCopy();
  renderSiteMenu();
  const publishLabel = document.querySelector("#site-publish-label");
  publishLabel.textContent = siteUpdatedAt
    ? `Pubblicato ${dateTime.format(new Date(siteUpdatedAt))}`
    : "Catalogo incorporato";
  refreshIcons();
}

function renderSiteCopy() {
  document.querySelectorAll("[data-site-copy-theme]").forEach(panel => {
    const theme = panel.dataset.siteCopyTheme;
    const menu = siteDraft.menus[theme];
    panel.querySelectorAll("[data-site-copy-field]").forEach(input => {
      input.value = menu[input.dataset.siteCopyField] || "";
    });
    const preview = panel.querySelector("[data-site-hero-preview]");
    preview.src = siteImageSource(menu.heroImage);
    preview.alt = menu.heroAlt || "";
  });
}

function activeSiteMenu() {
  return siteDraft.menus[activeSiteTheme];
}

function activeSiteCategoryData() {
  return activeSiteMenu().categories[activeSiteCategory];
}

function renderSiteMenu() {
  if (!siteDraft) return;
  const menu = activeSiteMenu();
  if (!menu.categories[activeSiteCategory]) {
    activeSiteCategory = menu.categoryOrder[0];
  }
  document.querySelectorAll("[data-site-menu-theme]").forEach(button => {
    const active = button.dataset.siteMenuTheme === activeSiteTheme;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  siteCategorySelect.innerHTML = menu.categoryOrder
    .map(key => `<option value="${escapeHtml(key)}">${escapeHtml(menu.categories[key].label)}</option>`)
    .join("");
  siteCategorySelect.value = activeSiteCategory;
  const category = activeSiteCategoryData();
  siteCategoryLabel.value = category.label;
  document.querySelector("#site-products-title").textContent = category.label;
  document.querySelector("#site-products-count").textContent =
    `${category.items.length} ${category.items.length === 1 ? "prodotto" : "prodotti"}`;
  const categoryIndex = menu.categoryOrder.indexOf(activeSiteCategory);
  document.querySelector("#move-category-up").disabled = categoryIndex <= 0;
  document.querySelector("#move-category-down").disabled = categoryIndex >= menu.categoryOrder.length - 1;
  document.querySelector("#delete-site-category").disabled = menu.categoryOrder.length <= 1;
  renderSiteProducts();
  refreshIcons();
}

function renderSiteProducts() {
  const products = activeSiteCategoryData().items;
  if (!products.length) {
    siteProducts.innerHTML = '<div class="site-products-empty">Nessun prodotto in questa categoria</div>';
    return;
  }
  siteProducts.innerHTML = products.map((product, index) => `
    <article class="site-product-editor" data-site-product="${escapeHtml(product.id)}">
      <div class="site-product-media">
        <img
          class="${product.imageFit === "contain" ? "contain" : ""}"
          src="${escapeHtml(siteImageSource(product.image))}"
          alt=""
        />
        <button
          class="icon-button"
          type="button"
          data-upload-product="${escapeHtml(product.id)}"
          aria-label="Carica immagine per ${escapeHtml(product.name)}"
          title="Carica immagine"
        ><i data-lucide="upload"></i></button>
      </div>
      <div class="site-product-fields">
        <label>Nome
          <input type="text" maxlength="140" value="${escapeHtml(product.name)}" data-site-product-field="name" />
        </label>
        <label>Prezzo
          <input type="number" min="0" max="100000" step="0.01" value="${escapeHtml(product.price)}" data-site-product-field="price" />
        </label>
        <label class="site-product-description">Descrizione
          <textarea rows="3" maxlength="2000" data-site-product-field="description">${escapeHtml(product.description)}</textarea>
        </label>
        <label class="site-product-description">Contenuto aggiuntivo
          <textarea rows="2" maxlength="1500" data-site-product-field="fact">${escapeHtml(product.fact || "")}</textarea>
        </label>
        <label class="site-product-image">Immagine
          <span class="site-product-image-row">
            <input type="text" maxlength="600" value="${escapeHtml(product.image)}" data-site-product-field="image" />
            <span class="site-fit-toggle">
              <input type="checkbox" data-site-product-field="imageFit" ${product.imageFit === "contain" ? "checked" : ""} />
              Mostra immagine intera
            </span>
          </span>
        </label>
      </div>
      <div class="site-product-actions">
        <button class="icon-button" type="button" data-site-product-action="up" ${index === 0 ? "disabled" : ""} aria-label="Sposta ${escapeHtml(product.name)} in alto" title="Sposta in alto">
          <i data-lucide="arrow-up"></i>
        </button>
        <button class="icon-button" type="button" data-site-product-action="down" ${index === products.length - 1 ? "disabled" : ""} aria-label="Sposta ${escapeHtml(product.name)} in basso" title="Sposta in basso">
          <i data-lucide="arrow-down"></i>
        </button>
        <button class="icon-button danger-button" type="button" data-site-product-action="delete" aria-label="Elimina ${escapeHtml(product.name)}" title="Elimina">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </article>
  `).join("");
}

function switchSiteEditorMode(mode) {
  document.querySelectorAll("[data-site-editor-mode]").forEach(button => {
    const active = button.dataset.siteEditorMode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll("[data-site-editor-panel]").forEach(panel => {
    panel.hidden = panel.dataset.siteEditorPanel !== mode;
  });
}

function setSiteMenuTheme(theme) {
  activeSiteTheme = theme;
  activeSiteCategory = activeSiteMenu().categoryOrder[0];
  renderSiteMenu();
}

function addSiteProduct() {
  const category = activeSiteCategoryData();
  const id = `custom-${crypto.randomUUID()}`;
  category.items.push({
    id,
    name: "Nuovo prodotto",
    price: 1,
    description: "",
    image: activeSiteTheme === "day" ? "assets/images/breakfast.jpg" : "assets/images/negroni.jpg",
    fact: "",
  });
  setSiteDirty();
  renderSiteMenu();
  siteProducts.querySelector(`[data-site-product="${CSS.escape(id)}"] input`)?.focus();
}

function addSiteCategory() {
  const menu = activeSiteMenu();
  let suffix = menu.categoryOrder.length + 1;
  let key = `categoria-${suffix}`;
  while (menu.categories[key]) {
    suffix += 1;
    key = `categoria-${suffix}`;
  }
  menu.categories[key] = { label: "Nuova categoria", items: [] };
  menu.categoryOrder.push(key);
  activeSiteCategory = key;
  setSiteDirty();
  renderSiteMenu();
  siteCategoryLabel.select();
}

function moveSiteCategory(direction) {
  const order = activeSiteMenu().categoryOrder;
  const index = order.indexOf(activeSiteCategory);
  const target = index + direction;
  if (target < 0 || target >= order.length) return;
  [order[index], order[target]] = [order[target], order[index]];
  setSiteDirty();
  renderSiteMenu();
}

function deleteSiteCategory() {
  const menu = activeSiteMenu();
  if (menu.categoryOrder.length <= 1) return;
  const category = activeSiteCategoryData();
  if (!window.confirm(`Eliminare la categoria “${category.label}” e tutti i suoi prodotti?`)) return;
  const index = menu.categoryOrder.indexOf(activeSiteCategory);
  delete menu.categories[activeSiteCategory];
  menu.categoryOrder.splice(index, 1);
  activeSiteCategory = menu.categoryOrder[Math.max(0, index - 1)];
  setSiteDirty();
  renderSiteMenu();
}

function updateSiteProduct(input) {
  const editor = input.closest("[data-site-product]");
  const product = activeSiteCategoryData().items.find(entry => entry.id === editor?.dataset.siteProduct);
  if (!product) return;
  const field = input.dataset.siteProductField;
  if (field === "price") {
    product.price = input.value === "" ? 0 : Number(input.value);
  } else if (field === "imageFit") {
    product.imageFit = input.checked ? "contain" : "";
    editor.querySelector("img").classList.toggle("contain", input.checked);
  } else {
    product[field] = input.value;
  }
  if (field === "image") editor.querySelector("img").src = siteImageSource(input.value);
  setSiteDirty();
}

function handleSiteProductAction(button) {
  const editor = button.closest("[data-site-product]");
  const products = activeSiteCategoryData().items;
  const index = products.findIndex(entry => entry.id === editor?.dataset.siteProduct);
  if (index < 0) return;
  const action = button.dataset.siteProductAction;
  if (action === "delete") {
    if (!window.confirm(`Eliminare “${products[index].name}”?`)) return;
    products.splice(index, 1);
  } else {
    const target = action === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= products.length) return;
    [products[index], products[target]] = [products[target], products[index]];
  }
  setSiteDirty();
  renderSiteMenu();
}

async function saveSiteContent() {
  saveSiteButton.disabled = true;
  try {
    const result = await api("/v1/site-content", {
      method: "PUT",
      body: JSON.stringify(siteDraft),
    });
    siteDraft = prepareSiteContent(result.content);
    siteUpdatedAt = result.updatedAt;
    setSiteDirty(false);
    renderSiteEditor();
    showAdminToast("Modifiche pubblicate sul sito.");
  } catch (error) {
    setSiteDirty(true);
    showAdminToast(error.message, true);
  }
}

function requestSiteUpload(target) {
  pendingSiteUpload = target;
  siteImageUpload.value = "";
  siteImageUpload.click();
}

async function uploadSiteImage(file) {
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) {
    showAdminToast("L'immagine supera 8 MB.", true);
    return;
  }
  const form = new FormData();
  form.append("file", file);
  const result = await api("/v1/site-media", { method: "POST", body: form });
  if (pendingSiteUpload?.type === "hero") {
    siteDraft.menus[pendingSiteUpload.theme].heroImage = result.url;
    renderSiteCopy();
  } else if (pendingSiteUpload?.type === "product") {
    const { theme, category, id } = pendingSiteUpload;
    const product = siteDraft.menus[theme].categories[category].items.find(entry => entry.id === id);
    if (product) product.image = result.url;
    renderSiteMenu();
  }
  setSiteDirty();
  showAdminToast("Immagine caricata.");
}

function switchView(name) {
  document.querySelectorAll("[data-admin-view]").forEach(button => {
    const active = button.dataset.adminView === name;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll("[data-view-panel]").forEach(panel => {
    panel.hidden = panel.dataset.viewPanel !== name;
  });
  document.querySelector("#export-orders").hidden = name !== "bookings";
  document.querySelector("#refresh-data").hidden = name === "qr" || name === "site";
  if (name === "accounting") loadAccounting().catch(error => showAdminToast(error.message, true));
  if (name === "qr") qrContent.focus();
  if (name === "site" && !siteDraft) loadSiteEditor().catch(error => showAdminToast(error.message, true));
}

function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatCreatedAt(value) {
  return dateTime.format(new Date(value));
}

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

function refreshIcons() {
  window.lucide?.createIcons({ attrs: { "aria-hidden": "true" } });
}

function showAdminToast(message, isError = false) {
  document.querySelector(".admin-toast")?.remove();
  const toast = document.createElement("div");
  toast.className = `admin-toast${isError ? " is-error" : ""}`;
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.append(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 250);
  }, 2500);
}

ordersBody.addEventListener("change", event => {
  const select = event.target.closest("[data-status-id]");
  if (select) updateStatus(select);
});

ordersBody.addEventListener("click", event => {
  const button = event.target.closest("[data-view-id]");
  if (button) showOrder(button.dataset.viewId);
});

document.querySelector("#order-detail").addEventListener("submit", event => {
  const form = event.target.closest("#booking-income-form");
  if (!form) return;
  event.preventDefault();
  registerBookingIncome(form);
});

searchInput.addEventListener("input", renderOrders);
statusFilter.addEventListener("change", renderOrders);
document.querySelector("#export-orders").addEventListener("click", exportOrdersCsv);
document.querySelector("#export-ledger").addEventListener("click", exportLedgerCsv);
document.querySelector("#refresh-data").addEventListener("click", refreshAll);
document.querySelectorAll("[data-admin-view]").forEach(button => button.addEventListener("click", () => switchView(button.dataset.adminView)));
document.querySelectorAll("#accounting-from, #accounting-to").forEach(input => input.addEventListener("change", () => loadAccounting().catch(error => showAdminToast(error.message, true))));
ledgerForm.addEventListener("submit", createLedgerEntry);
qrForm.addEventListener("submit", generateQrCode);
document.querySelector("#clear-qr").addEventListener("click", clearQrCode);
printQrButton.addEventListener("click", () => window.print());
document.querySelector(".order-dialog-close").addEventListener("click", () => orderDialog.close());

siteView.addEventListener("input", event => {
  const copyInput = event.target.closest("[data-site-copy-field]");
  if (copyInput) {
    const theme = copyInput.closest("[data-site-copy-theme]").dataset.siteCopyTheme;
    siteDraft.menus[theme][copyInput.dataset.siteCopyField] = copyInput.value;
    if (copyInput.dataset.siteCopyField === "heroImage") {
      document.querySelector(`[data-site-hero-preview="${theme}"]`).src = siteImageSource(copyInput.value);
    }
    setSiteDirty();
    return;
  }
  if (event.target === siteCategoryLabel) {
    activeSiteCategoryData().label = siteCategoryLabel.value;
    siteCategorySelect.selectedOptions[0].textContent = siteCategoryLabel.value || "Categoria";
    document.querySelector("#site-products-title").textContent = siteCategoryLabel.value || "Categoria";
    setSiteDirty();
    return;
  }
  const productInput = event.target.closest("[data-site-product-field]");
  if (productInput) updateSiteProduct(productInput);
});

siteView.addEventListener("click", event => {
  const modeButton = event.target.closest("[data-site-editor-mode]");
  if (modeButton) {
    switchSiteEditorMode(modeButton.dataset.siteEditorMode);
    return;
  }
  const themeButton = event.target.closest("[data-site-menu-theme]");
  if (themeButton) {
    setSiteMenuTheme(themeButton.dataset.siteMenuTheme);
    return;
  }
  const heroUpload = event.target.closest("[data-upload-hero]");
  if (heroUpload) {
    requestSiteUpload({ type: "hero", theme: heroUpload.dataset.uploadHero });
    return;
  }
  const productUpload = event.target.closest("[data-upload-product]");
  if (productUpload) {
    requestSiteUpload({
      type: "product",
      theme: activeSiteTheme,
      category: activeSiteCategory,
      id: productUpload.dataset.uploadProduct,
    });
    return;
  }
  const productAction = event.target.closest("[data-site-product-action]");
  if (productAction) handleSiteProductAction(productAction);
});

siteCategorySelect.addEventListener("change", () => {
  activeSiteCategory = siteCategorySelect.value;
  renderSiteMenu();
});
document.querySelector("#add-site-product").addEventListener("click", addSiteProduct);
document.querySelector("#add-site-category").addEventListener("click", addSiteCategory);
document.querySelector("#delete-site-category").addEventListener("click", deleteSiteCategory);
document.querySelector("#move-category-up").addEventListener("click", () => moveSiteCategory(-1));
document.querySelector("#move-category-down").addEventListener("click", () => moveSiteCategory(1));
document.querySelector("#reload-site-content").addEventListener("click", () => {
  loadSiteEditor({ confirmDiscard: true }).catch(error => showAdminToast(error.message, true));
});
saveSiteButton.addEventListener("click", saveSiteContent);
siteImageUpload.addEventListener("change", async () => {
  try {
    await uploadSiteImage(siteImageUpload.files[0]);
  } catch (error) {
    showAdminToast(error.message, true);
  } finally {
    pendingSiteUpload = null;
    siteImageUpload.value = "";
  }
});

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = loginForm.querySelector("button[type=submit]");
  button.disabled = true;
  loginError.hidden = true;
  try {
    const result = await api("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: emailInput.value, password: passwordInput.value }),
    });
    token = result.token;
    sessionStorage.setItem(SESSION_KEY, token);
    await unlockAdmin();
  } catch (error) {
    loginError.textContent = error.message;
    loginError.hidden = false;
    passwordInput.setAttribute("aria-invalid", "true");
    passwordInput.select();
  } finally {
    button.disabled = false;
  }
});

passwordInput.addEventListener("input", () => {
  loginError.hidden = true;
  passwordInput.removeAttribute("aria-invalid");
});
passwordToggle.addEventListener("click", () => {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  updatePasswordToggle();
  passwordInput.focus();
});
document.querySelector("#lock-admin").addEventListener("click", () => lockAdmin());

const now = new Date();
document.querySelector("#accounting-from").value = new Date(now.getFullYear(), now.getMonth(), 1, 12).toISOString().slice(0, 10);
document.querySelector("#accounting-to").value = todayISO();
ledgerForm.elements.occurredOn.value = todayISO();
refreshIcons();

if (token) {
  api("/v1/me").then(unlockAdmin).catch(() => lockAdmin("La sessione è scaduta. Accedi di nuovo."));
}
