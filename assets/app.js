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
  const offers = Array.isArray(data?.offers)
    ? data.offers
    : [];

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
    .map(o => Number(o.price))
    .filter(Number.isFinite);

  const min = prices.length
    ? Math.min(...prices)
    : null;

  resultsEl.innerHTML = `
    <div class="comparison-header">
      <div>
        <span class="comparison-count">
          Found ${offers.length} verified matching offer(s)
        </span>

        <h2>Verified price comparison</h2>

        <p>
          Compare verified prices from available retailers.
        </p>
      </div>
    </div>

    <div class="comparison-list">

      ${offers.map(o => {

        const lowest =
          min !== null &&
          o.price != null &&
          Number(o.price) === min;

        const productTitle =
          o.title ||
          searchEl?.value ||
          "Product";

        const shortTitle =
          productTitle.length > 95
            ? productTitle.substring(0, 95) + "..."
            : productTitle;

        return `
          <article class="zipron-product-card">

            ${
              lowest
                ? `
                  <div class="lowest-badge">
                    ✓ LOWEST VERIFIED PRICE
                  </div>
                `
                : ""
            }

            <div class="product-card-content">

              <div class="product-image-box">

                ${
                  o.image
                    ? `
                      <img
                        src="${esc(o.image)}"
                        alt="${esc(productTitle)}"
                        loading="lazy"
                      >
                    `
                    : `
                      <div class="product-image-placeholder">
                        🛍️
                      </div>
                    `
                }

              </div>

              <div class="product-details">

                <div class="store-label">
                  ${esc(o.store || "Store")}
                </div>

                <h3>
                  ${esc(shortTitle)}
                </h3>

                <div class="match-label">
                  ✓ ${Math.round(
                    Number(o.matchScore || 0) * 100
                  )}% Match
                </div>

              </div>

              <div class="product-price-area">

                <span class="price-label">
                  Current price
                </span>

                <div class="product-price">
                  ${money(o.price)}
                </div>

                <a
                  class="buy-button"
                  href="${esc(
                    o.affiliateUrl ||
                    o.url ||
                    "#"
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Offer →
                </a>

              </div>

            </div>

          </article>
        `;

      }).join("")}

    </div>
  `;

  addProductCardStyles();
}
function addProductCardStyles() {

  if (document.getElementById("zipron-product-styles")) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "zipron-product-styles";

  style.textContent = `

    .comparison-header {
      width: 100%;
      margin-bottom: 24px;
    }

    .comparison-count {
      color: #64748b;
      font-size: 14px;
    }

    .comparison-header h2 {
      margin: 8px 0 5px;
      font-size: 32px;
      line-height: 1.15;
    }

    .comparison-header p {
      margin: 0;
      color: #64748b;
    }

    .comparison-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .zipron-product-card {
      position: relative;
      width: 100%;
      box-sizing: border-box;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(15, 23, 42, 0.07);
    }

    .product-card-content {
      display: grid;
      grid-template-columns: 150px minmax(0, 1fr) 180px;
      gap: 26px;
      align-items: center;
      padding: 26px;
    }

    .product-image-box {
      width: 150px;
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      border-radius: 14px;
      overflow: hidden;
    }

    .product-image-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 10px;
      box-sizing: border-box;
    }

    .product-image-placeholder {
      font-size: 42px;
    }

    .store-label {
      display: inline-flex;
      align-items: center;
      padding: 5px 10px;
      background: #eff6ff;
      color: #2563eb;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .product-details h3 {
      margin: 0;
      font-size: 19px;
      line-height: 1.45;
      color: #0f172a;
      font-weight: 700;
    }

    .match-label {
      margin-top: 12px;
      color: #15803d;
      font-size: 14px;
      font-weight: 600;
    }

    .product-price-area {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
    }

    .price-label {
      color: #64748b;
      font-size: 13px;
      margin-bottom: 3px;
    }

    .product-price {
      font-size: 30px;
      line-height: 1.1;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 16px;
    }

    .buy-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 18px;
      background: #0f172a;
      color: #ffffff !important;
      text-decoration: none !important;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      transition: transform .15s ease;
    }

    .buy-button:hover {
      transform: translateY(-2px);
    }

    .lowest-badge {
      padding: 9px 26px;
      background: #ecfdf5;
      color: #047857;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: .3px;
      border-bottom: 1px solid #d1fae5;
    }

    @media (max-width: 800px) {

      .product-card-content {
        grid-template-columns: 110px minmax(0, 1fr);
        gap: 18px;
      }

      .product-image-box {
        width: 110px;
        height: 110px;
      }

      .product-price-area {
        grid-column: 2;
        align-items: flex-start;
        border-top: 1px solid #e5e7eb;
        padding-top: 16px;
      }

      .product-price {
        font-size: 26px;
      }

    }

    @media (max-width: 520px) {

      .product-card-content {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .product-image-box {
        margin: auto;
      }

      .product-price-area {
        grid-column: 1;
        align-items: center;
      }

      .product-details h3 {
        font-size: 17px;
      }

    }

  `;

  document.head.appendChild(style);
}
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
async function loadPriceHistory(productId, store) {
  if (!resultsEl || !productId) return;

  try {
    const params = new URLSearchParams({
      productId: productId,
      store: store || ""
    });

    const response = await fetch(
      `${API_URL}/api/history?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`History HTTP ${response.status}`);
    }

    const data = await response.json();
    const history = Array.isArray(data.history)
      ? data.history
      : [];

    if (!history.length) return;

    const prices = history
      .map(item => Number(item.price))
      .filter(price => Number.isFinite(price));

    if (!prices.length) return;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const historyHTML = `
      <section
        class="zipron-price-history"
        style="
          margin-top:30px;
          padding:24px;
          background:#fff;
          border-radius:18px;
          box-shadow:0 8px 30px rgba(0,0,0,.08);
        "
      >

        <h2 style="margin:0 0 6px;">
          📈 Price History
        </h2>

        <p style="margin:0 0 20px;color:#666;">
          Saved Zipron price checks for this product
        </p>

        <div
          style="
            display:flex;
            align-items:flex-end;
            gap:10px;
            height:220px;
            padding:20px 10px 0;
            border-bottom:1px solid #ddd;
          "
        >

          ${history.map((item, index) => {

            const price = Number(item.price);

            let height = 30;

            if (maxPrice > 0) {
              height =
                Math.max(
                  30,
                  (price / maxPrice) * 160
                );
            }

            const date = new Date(
              item.checked_at
            );

            const label =
              Number.isNaN(date.getTime())
                ? ""
                : date.toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short"
                    }
                  );

            return `
              <div
                style="
                  flex:1;
                  min-width:45px;
                  display:flex;
                  flex-direction:column;
                  align-items:center;
                  justify-content:flex-end;
                  height:100%;
                "
              >

                <div
                  style="
                    font-size:12px;
                    font-weight:700;
                    margin-bottom:6px;
                  "
                >
                  ₹${Math.round(price)}
                </div>

                <div
                  title="₹${price}"
                  style="
                    width:70%;
                    max-width:55px;
                    height:${height}px;
                    background:#111827;
                    border-radius:7px 7px 0 0;
                  "
                ></div>

                <div
                  style="
                    font-size:11px;
                    color:#777;
                    margin-top:7px;
                  "
                >
                  ${label}
                </div>

              </div>
            `;
          }).join("")}

        </div>

        <div
          style="
            display:flex;
            gap:30px;
            margin-top:20px;
            flex-wrap:wrap;
          "
        >

          <div>
            <small>Lowest recorded</small>
            <div
              style="
                font-size:22px;
                font-weight:700;
              "
            >
              ₹${Math.round(minPrice)}
            </div>
          </div>

          <div>
            <small>Latest price</small>
            <div
              style="
                font-size:22px;
                font-weight:700;
              "
            >
              ₹${Math.round(prices[prices.length - 1])}
            </div>
          </div>

          <div>
            <small>Price checks</small>
            <div
              style="
                font-size:22px;
                font-weight:700;
              "
            >
              ${history.length}
            </div>
          </div>

        </div>

      </section>
    `;

    resultsEl.insertAdjacentHTML(
      "beforeend",
      historyHTML
    );

  } catch (error) {

    console.error(
      "Price history error:",
      error
    );

  }
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
loadPriceHistory(
  source.productId,
  source.store
);
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
