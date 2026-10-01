/* =========================================================
   SHOPEASE — products.js
   Runs ONLY on products.html. Depends on functions defined in
   app.js (getAllProducts, buildProductCardHTML, wireProductActions,
   showToast, CATEGORY_LABELS) — make sure app.js is loaded first.
   ========================================================= */

// Everything the page currently knows, kept in one place so every
// function reads/writes the same source of truth instead of
// passing values around individually.
let allProducts = [];
let filters = {
  category: "all",
  search: "",
  min: null,
  max: null,
  sort: "default",
};
let searchDebounceId = null;

// Cache the elements we touch more than once.
const productsGrid = document.getElementById("productsGrid");
const resultCountEl = document.getElementById("resultCount");
const pageHeading = document.getElementById("pageHeading");
const categoryListEl = document.getElementById("categoryList");
const searchInput = document.getElementById("pageSearchInput");
const sortSelect = document.getElementById("sortSelect");
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");
const applyPriceBtn = document.getElementById("applyPriceBtn");
const resetPriceBtn = document.getElementById("resetFiltersBtn");
const filterToggle = document.getElementById("filterToggle");
const filtersSidebar = document.getElementById("filtersSidebar");

document.addEventListener("DOMContentLoaded", init);

async function init() {
  readFiltersFromURL();
  syncControlsToFilters();
  renderCategoryList();
  wireControls();
  wireProductActions(productsGrid); // event delegation, defined in app.js

  try {
    allProducts = await getAllProducts();
    if (!apiAvailable) {
      showToast("Our full catalog is temporarily unavailable — showing local products only.");
    }
    applyFiltersAndRender();
  } catch (error) {
    console.error("Failed to load products:", error);
    productsGrid.innerHTML = `<p class="state-message is-error">Couldn't load products right now. Please check your connection and refresh the page.</p>`;
    resultCountEl.textContent = "";
  }
}

/** Reads category / search / min / max / sort straight out of the URL. */
function readFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  filters.category = params.get("category") || "all";
  filters.search = params.get("search") || "";
  filters.min = params.has("min") ? Number(params.get("min")) : null;
  filters.max = params.has("max") ? Number(params.get("max")) : null;
  filters.sort = params.get("sort") || "default";
}

/**
 * Writes the current filters back into the URL (without a full
 * page reload) so the page can be bookmarked or shared, and so
 * homepage category links like products.html?category=men work
 * as an entry point into this same filtering logic.
 */
function updateURL() {
  const params = new URLSearchParams();
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.min !== null) params.set("min", filters.min);
  if (filters.max !== null) params.set("max", filters.max);
  if (filters.sort !== "default") params.set("sort", filters.sort);

  const queryString = params.toString();
  const newURL = `${window.location.pathname}${queryString ? "?" + queryString : ""}`;
  window.history.replaceState({}, "", newURL);
}

/** Builds the "All products / Men / Women / ..." list in the sidebar. */
function renderCategoryList() {
  const categoryKeys = ["all", ...Object.keys(CATEGORY_LABELS)];

  categoryListEl.innerHTML = categoryKeys
    .map((key) => {
      const label = key === "all" ? "All products" : CATEGORY_LABELS[key];
      const activeClass = filters.category === key ? "is-active" : "";
      return `<li><button type="button" class="filter-pill ${activeClass}" data-category="${key}">${label}</button></li>`;
    })
    .join("");

  categoryListEl.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      filters.category = button.dataset.category;
      renderCategoryList();
      updateURL();
      applyFiltersAndRender();
      // On mobile, close the filter panel once a choice is made.
      if (window.innerWidth <= 900) filtersSidebar.classList.remove("is-open");
    });
  });
}

/** Makes the search box, sort dropdown, and price fields match `filters`. */
function syncControlsToFilters() {
  searchInput.value = filters.search;
  sortSelect.value = filters.sort;
  minPriceInput.value = filters.min !== null ? filters.min : "";
  maxPriceInput.value = filters.max !== null ? filters.max : "";
}

function wireControls() {
  // Debounced so filtering runs after typing pauses, not on every keystroke.
  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounceId);
    searchDebounceId = setTimeout(() => {
      filters.search = searchInput.value.trim();
      updateURL();
      applyFiltersAndRender();
    }, 300);
  });

  sortSelect.addEventListener("change", () => {
    filters.sort = sortSelect.value;
    updateURL();
    applyFiltersAndRender();
  });

  applyPriceBtn.addEventListener("click", () => {
    const minValue = minPriceInput.value.trim() === "" ? null : Number(minPriceInput.value);
    const maxValue = maxPriceInput.value.trim() === "" ? null : Number(maxPriceInput.value);

    if (minValue !== null && (Number.isNaN(minValue) || minValue < 0)) {
      showToast("Enter a valid minimum price.");
      return;
    }
    if (maxValue !== null && (Number.isNaN(maxValue) || maxValue < 0)) {
      showToast("Enter a valid maximum price.");
      return;
    }
    if (minValue !== null && maxValue !== null && minValue > maxValue) {
      showToast("Minimum price can't be higher than maximum price.");
      return;
    }

    filters.min = minValue;
    filters.max = maxValue;
    updateURL();
    applyFiltersAndRender();
  });

  resetPriceBtn.addEventListener("click", () => {
    filters.min = null;
    filters.max = null;
    minPriceInput.value = "";
    maxPriceInput.value = "";
    updateURL();
    applyFiltersAndRender();
  });

  if (filterToggle) {
    filterToggle.addEventListener("click", () => {
      filtersSidebar.classList.toggle("is-open");
    });
  }
}

/** Filters + sorts allProducts based on the current `filters`, then renders. */
function applyFiltersAndRender() {
  let list = [...allProducts];

  if (filters.category !== "all") {
    list = list.filter((product) => product.category === filters.category);
  }

  if (filters.search) {
    const query = filters.search.toLowerCase();
    list = list.filter((product) => {
      const categoryLabel = (CATEGORY_LABELS[product.category] || product.category).toLowerCase();
      return (
        product.title.toLowerCase().includes(query) ||
        categoryLabel.includes(query)
      );
    });
  }

  if (filters.min !== null) list = list.filter((product) => product.price >= filters.min);
  if (filters.max !== null) list = list.filter((product) => product.price <= filters.max);

  list = sortProducts(list, filters.sort);

  renderHeading();
  renderGrid(list);
}

function sortProducts(list, sortKey) {
  const sorted = [...list];
  switch (sortKey) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating-desc":
      return sorted.sort((a, b) => b.rating.rate - a.rating.rate);
    case "name-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted; // "default" = whatever order the API/fallback data returned
  }
}

function renderHeading() {
  if (filters.search) {
    pageHeading.textContent = `Search results for "${filters.search}"`;
  } else if (filters.category !== "all") {
    pageHeading.textContent = CATEGORY_LABELS[filters.category] || "Products";
  } else {
    pageHeading.textContent = "All products";
  }
}

function renderGrid(list) {
  if (list.length === 0) {
    productsGrid.innerHTML = `
      <div class="state-message">
        No products match your filters.
        <br />
        <button type="button" id="clearFiltersBtn" class="btn btn-ghost" style="margin-top:14px;">
          Clear all filters
        </button>
      </div>
    `;
    resultCountEl.textContent = "0 products found";

    const clearButton = document.getElementById("clearFiltersBtn");
    if (clearButton) clearButton.addEventListener("click", clearAllFilters);
    return;
  }

  productsGrid.innerHTML = list.map(buildProductCardHTML).join("");
  resultCountEl.textContent = `${list.length} product${list.length === 1 ? "" : "s"} found`;
}

function clearAllFilters() {
  filters = { category: "all", search: "", min: null, max: null, sort: "default" };
  syncControlsToFilters();
  renderCategoryList();
  updateURL();
  applyFiltersAndRender();
}
