const products = [
  { id: "toilet-cleaner", name: "Toilet Cleaner", category: "Toilet Care", size: "500 ml", price: 149, oldPrice: 179, badge: "Bestseller", image: "toilet-cleaner.png", alt: "Navy toilet cleaner bottle on a pale blue studio set", description: "A dependable essential for a fresh bathroom." },
  { id: "dish-wash", name: "Dish Wash", category: "Dish Care", size: "750 ml", price: 129, oldPrice: 159, badge: "Everyday favourite", image: "dish-wash.png", alt: "Golden dish wash bottle with lemon and green leaves", description: "A bright, citrusy clean for the kitchen sink." },
  { id: "floor-cleaner", name: "Floor Cleaner", category: "Floor Care", size: "1 L", price: 199, oldPrice: 239, badge: "Family size", image: "floor-cleaner.png", alt: "White floor cleaner bottle with a leaf-green cap", description: "A fresh finish for the floors you live on." },
  { id: "multipurpose-cleaner", name: "Multipurpose Cleaner", category: "Multipurpose", size: "500 ml", price: 179, oldPrice: 219, badge: "", image: "multi-surface-cleaner.png", alt: "Pale aqua multipurpose spray bottle with lavender", description: "One handy spray for everyday surfaces." },
  { id: "white-phenyl", name: "White Phenyl", category: "More solutions", size: "1 L", price: 119, oldPrice: 149, badge: "Value", image: "white-phenyl.png", alt: "White phenyl bottle with green cap and pine sprig", description: "A classic floor-care choice with a clean pine feel." },
  { id: "glass-surface-cleaner", name: "Glass & Surface Cleaner", category: "More solutions", size: "500 ml", price: 159, oldPrice: 0, badge: "", image: "multi-surface-cleaner.png", alt: "Pale aqua spray bottle for household surfaces", description: "For a quick refresh across glass and hard surfaces." },
  { id: "bathroom-cleaner", name: "Bathroom Cleaner", category: "More solutions", size: "500 ml", price: 169, oldPrice: 199, badge: "", image: "toilet-cleaner.png", alt: "Blue bathroom cleaning bottle on a clean studio set", description: "A simple addition to your bathroom routine." },
  { id: "hand-wash", name: "Hand Wash", category: "More solutions", size: "250 ml", price: 139, oldPrice: 169, badge: "New", image: "hand-wash.png", alt: "Hand wash dispenser with aloe leaves", description: "A fresh pump bottle for the wash basin." },
  { id: "starter-kit", name: "Neo Clean Starter Kit", category: "More solutions", size: "6-piece kit", price: 549, oldPrice: 729, badge: "Best value", image: "hero-clean-home.png", alt: "A collection of refillable cleaning bottles in a bright home", description: "A considered start to your everyday home-care shelf." }
];

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const imagePath = function (file) { return "./assets/images/" + file; };
const productGrid = document.getElementById("product-grid");
const resultCount = document.getElementById("result-count");
const noResults = document.getElementById("no-results");
const filterList = document.getElementById("filter-list");
const catalogSearch = document.getElementById("catalog-search-input");
const headerSearch = document.getElementById("header-search-input");
const cartBackdrop = document.getElementById("cart-backdrop");
const cartLines = document.getElementById("cart-lines");
const cartEmpty = document.getElementById("cart-empty");
const drawerBottom = document.getElementById("drawer-bottom");
const cartTrigger = document.getElementById("cart-trigger");
const toast = document.getElementById("toast");
let activeFilter = "All";
let toastTimer;
let cart = readCart();

function productById(id) {
  return products.find(function (product) { return product.id === id; });
}

function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem("neoclean-demo-cart") || "{}");
    return Object.fromEntries(Object.entries(stored).filter(function (entry) {
      return productById(entry[0]) && Number.isInteger(entry[1]) && entry[1] > 0 && entry[1] <= 10;
    }));
  } catch {
    return {};
  }
}

function subtotalFor(items) {
  return Object.keys(items).reduce(function (sum, id) {
    const product = productById(id);
    return sum + (product ? product.price * items[id] : 0);
  }, 0);
}

console.assert(subtotalFor({ "dish-wash": 2 }) === 258, "Cart subtotal should use the listed product price.");

function saveCart() {
  try {
    localStorage.setItem("neoclean-demo-cart", JSON.stringify(cart));
  } catch {
    // The in-memory bag still works when browser storage is unavailable.
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(function () { toast.classList.remove("is-visible"); }, 2200);
}

function matchesFilter(product) {
  if (activeFilter === "All") return true;
  if (activeFilter === "More") return product.category === "More solutions";
  return product.category === activeFilter;
}

function renderProducts() {
  const query = catalogSearch.value.trim().toLowerCase();
  const visible = products.filter(function (product) {
    return matchesFilter(product) && (product.name + " " + product.category + " " + product.description).toLowerCase().includes(query);
  });

  productGrid.innerHTML = visible.map(function (product) {
    const badge = product.badge ? '<span class="product-badge">' + product.badge + '</span>' : "";
    const oldPrice = product.oldPrice ? '<span class="product-old-price">' + currency.format(product.oldPrice) + '</span>' : "";
    return '<article class="product-card">' +
      '<div class="product-image-wrap"><img class="product-image" src="' + imagePath(product.image) + '" alt="' + product.alt + '" loading="lazy">' + badge + '</div>' +
      '<div class="product-info"><p class="product-category">' + product.category + '</p>' +
      '<div class="product-name-row"><h3 class="product-name">' + product.name + '</h3><span class="product-size">' + product.size + '</span></div>' +
      '<p class="product-description">' + product.description + '</p>' +
      '<div class="product-buy-row"><span class="product-price">' + currency.format(product.price) + oldPrice + '</span>' +
      '<button class="add-button" type="button" data-add="' + product.id + '" aria-label="Add ' + product.name + ' to your bag"><span aria-hidden="true">+</span> Add</button></div></div></article>';
  }).join("");

  resultCount.textContent = "Showing " + visible.length + (visible.length === 1 ? " product" : " products");
  noResults.hidden = visible.length > 0;
}

function updateFilter(filter) {
  activeFilter = filter;
  filterList.querySelectorAll("[data-filter]").forEach(function (button) {
    const active = button.dataset.filter === filter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderProducts();
}

function renderCart() {
  const ids = Object.keys(cart).filter(function (id) { return productById(id); });
  const itemCount = ids.reduce(function (sum, id) { return sum + cart[id]; }, 0);
  const subtotal = subtotalFor(cart);
  document.getElementById("cart-count").textContent = String(itemCount);
  document.getElementById("drawer-count").textContent = itemCount ? "(" + itemCount + ")" : "";
  document.getElementById("cart-subtotal").textContent = currency.format(subtotal);
  cartTrigger.setAttribute("aria-label", "Open shopping bag, " + itemCount + (itemCount === 1 ? " item" : " items"));
  cartEmpty.hidden = ids.length > 0;
  drawerBottom.hidden = ids.length === 0;
  cartLines.hidden = ids.length === 0;

  cartLines.innerHTML = ids.map(function (id) {
    const product = productById(id);
    return '<article class="cart-line"><img src="' + imagePath(product.image) + '" alt="" loading="lazy">' +
      '<div><h3>' + product.name + '</h3><small>' + product.size + ' · ' + currency.format(product.price) + ' each</small>' +
      '<div class="qty-controls"><button type="button" data-qty="' + id + '" data-delta="-1" aria-label="Decrease ' + product.name + ' quantity">−</button><span>' + cart[id] + '</span><button type="button" data-qty="' + id + '" data-delta="1" aria-label="Increase ' + product.name + ' quantity">+</button><button type="button" data-remove="' + id + '" aria-label="Remove ' + product.name + '" title="Remove item">×</button></div></div>' +
      '<span class="cart-line-price">' + currency.format(product.price * cart[id]) + '</span></article>';
  }).join("");

  const body = ids.map(function (id) {
    const product = productById(id);
    return product.name + " (" + product.size + ") × " + cart[id] + " — " + currency.format(product.price * cart[id]);
  }).join("\n");
  const subject = encodeURIComponent("Neo Clean product enquiry");
  const message = encodeURIComponent("Hello Neo Clean,\n\nI would like to enquire about:\n" + body + "\n\nSubtotal: " + currency.format(subtotal) + "\n\nPlease contact me with availability and delivery details.");
  document.getElementById("order-email").href = "mailto:neoclean015@gmail.com?subject=" + subject + "&body=" + message;
}

function openCart() {
  cartBackdrop.hidden = false;
  cartTrigger.setAttribute("aria-expanded", "true");
  document.body.classList.add("no-scroll");
  document.getElementById("close-cart").focus();
}
function closeCart() {
  cartBackdrop.hidden = true;
  cartTrigger.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
  cartTrigger.focus();
}
function addToCart(id) {
  const quantity = cart[id] || 0;
  if (!productById(id) || quantity >= 10) {
    showToast("You can add up to 10 of each product.");
    return;
  }
  cart[id] = quantity + 1;
  saveCart();
  renderCart();
  showToast(productById(id).name + " added to your bag.");
}

filterList.addEventListener("click", function (event) {
  const button = event.target.closest("[data-filter]");
  if (button) updateFilter(button.dataset.filter);
});
document.querySelectorAll("[data-category-link]").forEach(function (link) {
  link.addEventListener("click", function () { updateFilter(link.dataset.categoryLink); });
});
catalogSearch.addEventListener("input", function () {
  if (headerSearch.value !== catalogSearch.value) headerSearch.value = catalogSearch.value;
  renderProducts();
});
headerSearch.addEventListener("input", function () {
  catalogSearch.value = headerSearch.value;
  renderProducts();
});
document.querySelector(".header-search").addEventListener("click", function () {
  if (window.matchMedia("(max-width: 760px)").matches) {
    catalogSearch.focus();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  }
});
document.addEventListener("click", function (event) {
  const add = event.target.closest("[data-add]");
  const quantity = event.target.closest("[data-qty]");
  const remove = event.target.closest("[data-remove]");
  if (add) addToCart(add.dataset.add);
  if (quantity) {
    const id = quantity.dataset.qty;
    cart[id] = Math.max(1, Math.min(10, (cart[id] || 1) + Number(quantity.dataset.delta)));
    saveCart();
    renderCart();
  }
  if (remove) {
    delete cart[remove.dataset.remove];
    saveCart();
    renderCart();
  }
});
cartTrigger.addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
document.getElementById("empty-shop").addEventListener("click", function () {
  closeCart();
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
});
cartBackdrop.addEventListener("click", function (event) {
  if (event.target === cartBackdrop) closeCart();
});
document.getElementById("menu-trigger").addEventListener("click", function (event) {
  const button = event.currentTarget;
  const open = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  document.getElementById("main-nav").classList.toggle("is-open", open);
});
document.querySelectorAll("#main-nav a").forEach(function (link) {
  link.addEventListener("click", function () {
    document.getElementById("main-nav").classList.remove("is-open");
    document.getElementById("menu-trigger").setAttribute("aria-expanded", "false");
    document.getElementById("menu-trigger").setAttribute("aria-label", "Open navigation");
  });
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !cartBackdrop.hidden) closeCart();
});
document.getElementById("year").textContent = String(new Date().getFullYear());
renderProducts();
renderCart();
