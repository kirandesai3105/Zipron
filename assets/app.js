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

async function compareProduct() {

  const title = searchEl.value.trim();

  if (!title) {
    setStatus("<b>Please enter a product name.</b>");
    searchEl.focus();
    return;
  }

  resultsEl.innerHTML = "";

  setStatus(`
    <b>🔎 Searching...</b><br>
    Checking available retailer data for:
    <strong>${escapeHtml(title)}</strong>
  `);

  searchButton.disabled = true;
  searchButton.textContent = "Searching...";

  try {

    const response = await fetch(`${API_URL}/api/compare`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        title: title
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to compare prices."
      );
    }

    showResults(title, data);

  } catch (error) {

    setStatus(`
      <b>❌ Comparison failed</b><br><br>
      ${escapeHtml(error.message)}
    `);

  } finally {

    searchButton.disabled = false;
    searchButton.textContent = "🔍 Compare Prices";
  }
}

function showResults(title, data) {

  const offers = data.offers || [];

  if (!offers.length) {

    setStatus(`
      <h2>No verified offers found</h2>

      <p>
        We searched for:
        <strong>${escapeHtml(title)}</strong>
      </p>

      <p>
        ${escapeHtml(
          data.message ||
          "No verified retailer offers are available yet."
        )}
      </p>

      <p>
        <b>Zipron API connection is working.</b>
        Retailer API access still needs to be activated.
      </p>
    `);

    resultsEl.innerHTML = "";
    return;
  }

  setStatus(`
    <h2>Price Comparison</h2>

    <p>
      Results for:
      <strong>${escapeHtml(title)}</strong>
    </p>

    <p>
      Found <strong>${offers.length}</strong>
      verified offer(s).
    </p>
  `);

  resultsEl.innerHTML = offers.map((offer, index) => {

    const store = escapeHtml(
      offer.store || "Retailer"
    );

    const offerTitle = escapeHtml(
      offer.title || title
    );

    const price = money(offer.price);

    const score = Math.round(
      Number(offer.matchScore || 0) * 100
    );

    const link =
      offer.affiliateUrl ||
      offer.url ||
      "";

    return `
      <article class="product-card">

        <div class="product-body">

          <div class="category">
            ${store}
          </div>

          <h2>
            ${offerTitle}
          </h2>

          <div class="price">
            ${price}
          </div>

          <p>
            Match confidence:
            <strong>${score}%</strong>
          </p>

          ${
            index === 0
              ? `
                <p>
                  <strong>💰 Lowest verified price</strong>
                </p>
              `
              : ""
          }

          ${
            link
              ? `
                <a
                  class="compare-button"
                  href="${escapeAttr(link)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Offer →
                </a>
              `
              : ""
          }

        </div>

      </article>
    `;

  }).join("");
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
