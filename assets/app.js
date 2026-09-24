const API_URL = "https://zipron-api.onrender.com";

const searchEl = document.getElementById("search");
const searchButton = document.getElementById("searchButton");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

const money = value => {
  if (value == null || value === "" || Number.isNaN(Number(value))) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value));
};

const esc = value =>
  String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function renderNoResults(
  title,
  message = "Retailer connections for this product are not available yet."
) {
  if (!resultsEl) return;

  resultsEl.innerHTML = `
    <div class="zipron-no-results">
      <div class="zipron-no-results-icon">🛍️</div>
      <h2>We're preparing your comparison</h2>
      <p>We searched for <b>${esc(title)}</b></p>
      <p>${esc(message)}</p>

      <div class="retailer-status">
        <span>Amazon</span>
        <b>Coming soon</b>
      </div>

      <div class="retailer-status">
        <span>Flipkart</span>
        <b>Coming soon</b>
      </div>

      <p class="small">
        Zipron is continuously adding retailer connections.
      </p>
    </div>`;
}

function renderOffers(data) {
  const offers = Array.isArray(data?.offers) ? data.offers : [];

  if (!resultsEl) return;

  if (!offers.length) {
    renderNoResults(
      searchEl?.value || "this product",
      data?.message || "No verified offers found."
    );
    return;
  }

  const prices = offers
    .filter(o => o.price != null)
    .map(o => Number(o.price));

  const min = prices.length ? Math.min(...prices) : null;

  resultsEl.innerHTML = `
    <div class="comparison-summary">
      <h2>Verified price comparison</h2>
      <p>${offers.length} verified offer(s) found.</p>
    </div>

    ${offers.map(o => {
      const lowest =
        min !== null &&
        o.price != null &&
        Number(o.price) === min;

      return `
        <article class="comparison-card ${lowest ? "lowest" : ""}">

          ${
            lowest
              ? '<div class="lowest-price-banner">LOWEST VERIFIED PRICE</div>'
              : ""
          }

          <div class="comparison-main">

            <div class="comparison-image">
              ${
                o.image
                  ? `<img src="${esc(o.image)}"
                       alt="${esc(o.title || o.store)}">`
                  : "🛍️"
              }
            </div>

            <div class="comparison-info">

              <div class="store-name">
                ${esc(o.store || "Store")}
              </div>

              <h3>
                ${esc(o.title || searchEl?.value || "Product")}
              </h3>

              <div class="comparison-price">
                ${money(o.price)}
              </div>

              <div class="match-score">
                Match confidence:
                ${Math.round(Number(o.matchScore || 0) * 100)}%
              </div>

            </div>

            <div class="comparison-action">

              <a
                class="buy-button"
                href="${esc(o.affiliateUrl || o.url || "#")}"
                target="_blank"
                rel="noopener">
                View Offer
              </a>

            </div>

          </div>

        </article>`;
    }).join("")}
  `;
}

async function compareProduct() {

  const title = searchEl?.value.trim();

  if (!title) {
    setStatus("Enter a product name first.");
    return;
  }

  setStatus("Searching verified retailer offers...");

  if (resultsEl) {
    resultsEl.innerHTML = `
      <div class="zipron-searching">
        <h2>We're searching...</h2>
        <p>Checking available retailer connections.</p>
      </div>`;
  }

  const params = new URLSearchParams(window.location.search);

  const source = {
    title,

    price: params.get("price")
      ? Number(params.get("price"))
      : null,

    store: params.get("store") || "",

    productId: params.get("productId") || "",

    image: params.get("image") || "",

    url: params.get("url") || "",

    brand: params.get("brand") || "",

    sku: params.get("sku") || "",

    mpn: params.get("mpn") || "",

    gtin: params.get("gtin") || ""
  };

  try {

    const response = await fetch(
      `${API_URL}/api/compare`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(source)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error || `HTTP ${response.status}`
      );
    }

    setStatus(
      data?.message || "Comparison complete."
    );

    renderOffers(data);

  } catch (error) {

    console.error(error);

    setStatus("Comparison failed.");

    if (resultsEl) {
      resultsEl.innerHTML = `
        <div class="zipron-error">
          <h2>Something went wrong</h2>
          <p>${esc(error.message)}</p>
        </div>`;
    }
  }
}

if (searchButton) {
  searchButton.addEventListener(
    "click",
    compareProduct
  );
}

if (searchEl) {
  searchEl.addEventListener(
    "keydown",
    e => {
      if (e.key === "Enter") {
        compareProduct();
      }
    }
  );
}

document
  .querySelectorAll("[data-search]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        if (searchEl) {
          searchEl.value =
            button.dataset.search ||
            button.textContent.trim();
        }

        compareProduct();
      }
    );

  });

(function autoCompareFromExtension() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const title = params.get("title");

  if (!title || !searchEl) return;

  searchEl.value = title;

  setTimeout(
    compareProduct,
    400
  );

})();
