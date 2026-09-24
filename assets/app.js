const API_URL = "https://zipron-api.onrender.com";

const searchEl = document.getElementById("search");
const searchButton = document.getElementById("searchButton");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function money(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function setStatus(message) {
  if (!statusEl) return;

  statusEl.innerHTML = `
    <div class="notice">
      ${message}
    </div>
  `;
}

function getStoreClass(store) {
  return String(store || "retailer")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function savePriceHistory(title, offers) {

  if (!offers.length) return;

  try {

    const history =
      JSON.parse(
        localStorage.getItem("zipronPriceHistory") || "{}"
      );

    if (!history[title]) {
      history[title] = [];
    }

    offers.forEach(offer => {

      if (offer.price == null) return;

      history[title].push({
        store: offer.store || "Retailer",
        price: Number(offer.price),
        date: new Date().toISOString()
      });

    });

    // Keep the browser history manageable.
    history[title] =
      history[title].slice(-100);

    localStorage.setItem(
      "zipronPriceHistory",
      JSON.stringify(history)
    );

  } catch (error) {

    console.warn(
      "Price history could not be saved.",
      error
    );

  }
}

function getHistory(title) {

  try {

    const history =
      JSON.parse(
        localStorage.getItem("zipronPriceHistory") || "{}"
      );

    return history[title] || [];

  } catch {

    return [];

  }
}

async function compareProduct() {

  const title = searchEl.value.trim();

  if (!title) {

    setStatus(`
      <h2>What are you looking for?</h2>

      <p>
        Enter a product name above to start comparing.
      </p>
    `);

    searchEl.focus();

    return;
  }

  resultsEl.innerHTML = "";

  setStatus(`
    <div class="searching-box">

      <div class="loading-icon">
        🔎
      </div>

      <h2>
        Searching for your product...
      </h2>

      <p>
        Checking available retailer data for
        <strong>${escapeHtml(title)}</strong>
      </p>

    </div>
  `);

  searchButton.disabled = true;
  searchButton.innerHTML = "⏳ Searching...";

  try {

    const response = await fetch(
      `${API_URL}/api/compare`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          title: title
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(
        data.error ||
        "Unable to compare prices."
      );

    }

    showResults(title, data);

  } catch (error) {

    setStatus(`
      <div class="error-box">

        <h2>
          Something went wrong
        </h2>

        <p>
          We couldn't complete the comparison right now.
        </p>

        <small>
          ${escapeHtml(error.message)}
        </small>

      </div>
    `);

  } finally {

    searchButton.disabled = false;
    searchButton.innerHTML =
      "🔍 Compare Prices";

  }
}

function showResults(title, data) {

  const offers = data.offers || [];

  if (!offers.length) {

    setStatus(`

      <div class="no-results">

        <div class="no-results-icon">
          🛍️
        </div>

        <h2>
          We're preparing your comparison
        </h2>

        <p>
          We searched for
          <strong>${escapeHtml(title)}</strong>.
        </p>

        <p>
          Retailer connections for this product
          are not available yet.
        </p>

        <div class="retailer-status">

          <div>
            <span>Amazon</span>
            <b>Coming soon</b>
          </div>

          <div>
            <span>Flipkart</span>
            <b>Coming soon</b>
          </div>

        </div>

        <p class="small-note">
          Zipron is continuously adding retailer connections.
        </p>

      </div>

    `);

    resultsEl.innerHTML = "";

    return;
  }

  // Store verified prices locally.
  savePriceHistory(title, offers);

  const history = getHistory(title);

  setStatus(`

    <div class="results-heading">

      <div>

        <span class="results-label">
          PRICE COMPARISON
        </span>

        <h2>
          ${escapeHtml(title)}
        </h2>

      </div>

      <span class="offer-count">
        ${offers.length}
        ${offers.length === 1 ? "offer" : "offers"}
      </span>

    </div>

  `);

  resultsEl.innerHTML = `

    <div class="comparison-grid">

      ${offers.map((offer, index) => {

        const store =
          escapeHtml(
            offer.store || "Retailer"
          );

        const offerTitle =
          escapeHtml(
            offer.title || title
          );

        const price =
          money(offer.price);

        const score =
          Math.round(
            Number(
              offer.matchScore || 0
            ) * 100
          );

        const link =
          offer.affiliateUrl ||
          offer.url ||
          "";

        const image =
          offer.image || "";

        const storeClass =
          getStoreClass(
            offer.store
          );

        return `

          <article class="
            comparison-card
            ${index === 0 ? "lowest-card" : ""}
          ">

            ${
              index === 0
                ? `
                  <div class="lowest-banner">
                    💰 LOWEST VERIFIED PRICE
                  </div>
                `
                : ""
            }

            <div class="comparison-card-inner">

              <div class="retailer-logo ${storeClass}">
                ${store}
              </div>

              <div class="comparison-image">

                ${
                  image
                    ? `
                      <img
                        src="${escapeAttr(image)}"
                        alt="${offerTitle}"
                        loading="lazy"
                      >
                    `
                    : `
                      <div class="image-placeholder">
                        🛍️
                      </div>
                    `
                }

              </div>

              <div class="comparison-info">

                <h2>
                  ${offerTitle}
                </h2>

                <div class="comparison-price">
                  ${price}
                </div>

                <div class="match-bar">

                  <div
                    class="match-fill"
                    style="width:${score}%"
                  ></div>

                </div>

                <p class="match-text">
                  ${score}% product match
                </p>

                ${
                  link
                    ? `
                      <a
                        class="buy-button"
                        href="${escapeAttr(link)}"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🛒 View Offer
                      </a>
                    `
                    : `
                      <button
                        class="buy-button"
                        disabled
                      >
                        Offer unavailable
                      </button>
                    `
                }

              </div>

            </div>

          </article>

        `;

      }).join("")}

    </div>

    <div class="price-history-box">

      <div class="history-icon">
        📈
      </div>

      <div>

        <h2>
          Price History
        </h2>

        ${
          history.length > 1
            ? `
              <p>
                Zipron has recorded
                <strong>${history.length}</strong>
                verified price observations for this search
                in this browser.
              </p>
            `
            : `
              <p>
                Zipron will build price history as
                verified prices are collected over time.
              </p>
            `
        }

        <small>
          Historical prices are shown only when
          verified retailer data is available.
        </small>

      </div>

    </div>

  `;
}

searchButton?.addEventListener(
  "click",
  compareProduct
);

searchEl?.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      compareProduct();
    }

  }
);

document
  .querySelectorAll(".example-search")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const value =
          button.dataset.search;

        searchEl.value = value;

        compareProduct();

      }
    );

  });
// Automatically start comparison when opened from Zipron extension
(function autoCompareFromExtension() {
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");

  if (!title || !searchEl) return;

  searchEl.value = title;

  setTimeout(() => {
    compareProduct();
  }, 150);
})();
(function autoCompareFromExtension() {
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");

  if (!title || !searchEl) return;

  searchEl.value = title;

  setTimeout(() => {
    compareProduct();
  }, 500);
})();
(function autoCompareFromExtension() {
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");

  if (!title || !searchEl) return;

  searchEl.value = title;

  setTimeout(() => {
    compareProduct();
  }, 500);
})();
