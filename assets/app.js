const API_URL = "https://zipron-api.onrender.com";

const searchEl = document.getElementById("search");
const searchButton = document.getElementById("searchButton");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");


/* =========================
   BASIC HELPERS
========================= */

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (ch) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch];
  });
}


function money(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value));
}


function setStatus(text) {
  if (statusEl) {
    statusEl.textContent = text;
  }
}


/* =========================
   UI STYLES
========================= */

function addZipronStyles() {

  if (document.getElementById("zipron-new-styles")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "zipron-new-styles";

  style.textContent = `

    /* MAIN RESULTS AREA */

    #results {
      width: 100% !important;
      max-width: 1100px !important;
      margin-left: auto !important;
      margin-right: auto !important;
      display: block !important;
    }


    /* COMPARISON HEADER */

    .zipron-comparison-header {
      width: 100%;
      margin: 30px 0 20px;
    }

    .zipron-comparison-count {
      color: #64748b;
      font-size: 14px;
      font-weight: 600;
    }

    .zipron-comparison-header h2 {
      margin: 8px 0 6px;
      font-size: 34px;
      line-height: 1.15;
      color: #0f172a;
    }

    .zipron-comparison-header p {
      margin: 0;
      color: #64748b;
      font-size: 15px;
    }


    /* PRODUCT CARD */

    .zipron-product-card {
      position: relative;
      width: 100%;
      box-sizing: border-box;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
      margin-bottom: 24px;
    }


    .zipron-lowest-badge {
      padding: 10px 26px;
      background: #ecfdf5;
      color: #047857;
      border-bottom: 1px solid #d1fae5;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: .3px;
    }


    .zipron-product-content {
      display: grid;
      grid-template-columns: 170px minmax(0, 1fr) 190px;
      gap: 28px;
      align-items: center;
      padding: 28px;
    }


    /* IMAGE */

    .zipron-product-image {
      width: 170px;
      height: 170px;
      background: #f8fafc;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .zipron-product-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 12px;
      box-sizing: border-box;
    }

    .zipron-placeholder {
      font-size: 48px;
    }


    /* PRODUCT DETAILS */

    .zipron-store {
      display: inline-flex;
      padding: 6px 11px;
      background: #eff6ff;
      color: #2563eb;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 12px;
    }


    .zipron-product-title {
      margin: 0;
      color: #0f172a;
      font-size: 20px;
      line-height: 1.45;
      font-weight: 700;
    }


    .zipron-match {
      margin-top: 14px;
      color: #15803d;
      font-size: 14px;
      font-weight: 700;
    }


    /* PRICE */

    .zipron-price-area {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
    }

    .zipron-current-label {
      color: #64748b;
      font-size: 13px;
      margin-bottom: 4px;
    }

    .zipron-price {
      color: #0f172a;
      font-size: 32px;
      line-height: 1.1;
      font-weight: 800;
      margin-bottom: 17px;
    }


    /* BUY BUTTON */

    .zipron-buy-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 13px 20px;
      background: #0f172a;
      color: #ffffff !important;
      border-radius: 10px;
      text-decoration: none !important;
      font-size: 14px;
      font-weight: 800;
      transition: all .18s ease;
      white-space: nowrap;
    }

    .zipron-buy-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(15, 23, 42, .18);
    }


    /* PRICE HISTORY */

    .zipron-history {
      width: 100%;
      box-sizing: border-box;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      padding: 28px;
      margin: 24px 0 40px;
      box-shadow: 0 8px 30px rgba(15, 23, 42, .07);
    }

    .zipron-history-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      color: #0f172a;
      font-size: 27px;
    }

    .zipron-history-subtitle {
      margin: 7px 0 25px;
      color: #64748b;
      font-size: 14px;
    }


    /* HISTORY BARS */

    .zipron-chart {
      width: 100%;
      height: 240px;
      display: flex;
      align-items: flex-end;
      gap: 12px;
      padding: 20px 10px 0;
      box-sizing: border-box;
      border-bottom: 1px solid #e5e7eb;
      overflow-x: auto;
    }

    .zipron-chart-item {
      min-width: 55px;
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
    }

    .zipron-chart-price {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 7px;
      white-space: nowrap;
    }

    .zipron-chart-bar {
      width: 42px;
      max-width: 80%;
      min-height: 25px;
      border-radius: 8px 8px 0 0;
      background: #0f172a;
    }

    .zipron-chart-date {
      font-size: 10px;
      color: #64748b;
      margin-top: 8px;
      white-space: nowrap;
    }


    /* HISTORY SUMMARY */

    .zipron-history-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 24px;
    }

    .zipron-history-stat {
      background: #f8fafc;
      border-radius: 12px;
      padding: 16px;
    }

    .zipron-history-stat span {
      display: block;
      color: #64748b;
      font-size: 13px;
      margin-bottom: 6px;
    }

    .zipron-history-stat strong {
      display: block;
      color: #0f172a;
      font-size: 23px;
    }


    /* SEARCHING */

    .zipron-searching,
    .zipron-error,
    .zipron-no-results {
      width: 100%;
      box-sizing: border-box;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      padding: 35px;
      text-align: center;
      margin: 30px 0;
    }

    .zipron-searching h2,
    .zipron-error h2,
    .zipron-no-results h2 {
      margin: 0 0 8px;
      color: #0f172a;
    }

    .zipron-searching p,
    .zipron-error p,
    .zipron-no-results p {
      color: #64748b;
    }


    /* MOBILE */

    @media (max-width: 850px) {

      .zipron-product-content {
        grid-template-columns: 130px minmax(0, 1fr);
        gap: 20px;
        padding: 22px;
      }

      .zipron-product-image {
        width: 130px;
        height: 130px;
      }

      .zipron-price-area {
        grid-column: 2;
        align-items: flex-start;
        padding-top: 18px;
        border-top: 1px solid #e5e7eb;
      }

      .zipron-history-summary {
        grid-template-columns: 1fr;
      }

    }


    @media (max-width: 560px) {

      .zipron-product-content {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .zipron-product-image {
        margin: auto;
        width: 150px;
        height: 150px;
      }

      .zipron-price-area {
        grid-column: 1;
        align-items: center;
      }

      .zipron-product-title {
        font-size: 17px;
      }

      .zipron-history {
        padding: 20px;
      }

      .zipron-chart {
        gap: 8px;
      }

    }

  `;

  document.head.appendChild(style);
}


/* =========================
   NO RESULTS
========================= */

function renderNoResults(title, message) {

  if (!resultsEl) return;

  resultsEl.innerHTML = `

    <div class="zipron-no-results">

      <div style="font-size:45px;">🛍️</div>

      <h2>We're preparing your comparison</h2>

      <p>
        We searched for:
        <strong>${esc(title)}</strong>
      </p>

      <p>
        ${esc(
          message ||
          "No verified offers found."
        )}
      </p>

    </div>

  `;
}


/* =========================
   RENDER PRODUCTS
========================= */

function renderOffers(data) {

  const offers =
    Array.isArray(data?.offers)
      ? data.offers
      : [];

  if (!resultsEl) return;

  if (!offers.length) {

    renderNoResults(
      searchEl?.value ||
      "this product",
      data?.message
    );

    return;
  }

  const prices =
    offers
      .filter(o => o.price != null)
      .map(o => Number(o.price))
      .filter(Number.isFinite);

  const lowestPrice =
    prices.length
      ? Math.min(...prices)
      : null;


  resultsEl.innerHTML = `

    <div class="zipron-comparison-header">

      <span class="zipron-comparison-count">
        Found ${offers.length}
        verified matching offer(s)
      </span>

      <h2>
        Verified price comparison
      </h2>

      <p>
        Compare verified prices from available retailers.
      </p>

    </div>


    <div class="zipron-product-list">

      ${offers.map(function (offer) {

        const price =
          Number(offer.price);

        const isLowest =
          lowestPrice !== null &&
          price === lowestPrice;

        const title =
          offer.title ||
          searchEl?.value ||
          "Product";


        const shortTitle =
          title.length > 110
            ? title.substring(0, 110) + "..."
            : title;


        const match =
          Math.round(
            Number(
              offer.matchScore || 0
            ) * 100
          );


        return `

          <article class="zipron-product-card">

            ${
              isLowest
                ? `
                  <div class="zipron-lowest-badge">
                    ✓ LOWEST VERIFIED PRICE
                  </div>
                `
                : ""
            }


            <div class="zipron-product-content">


              <div class="zipron-product-image">

                ${
                  offer.image
                    ? `
                      <img
                        src="${esc(offer.image)}"
                        alt="${esc(title)}"
                        loading="lazy"
                      >
                    `
                    : `
                      <div class="zipron-placeholder">
                        🛍️
                      </div>
                    `
                }

              </div>


              <div class="zipron-product-details">

                <div class="zipron-store">
                  ${esc(
                    offer.store ||
                    "Store"
                  )}
                </div>

                <h3 class="zipron-product-title">
                  ${esc(shortTitle)}
                </h3>

                <div class="zipron-match">
                  ✓ ${match}% Match
                </div>

              </div>


              <div class="zipron-price-area">

                <span class="zipron-current-label">
                  Current price
                </span>

                <div class="zipron-price">
                  ${money(price)}
                </div>

                <a
                  class="zipron-buy-button"
                  href="${esc(
                    offer.affiliateUrl ||
                    offer.url ||
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
}


/* =========================
   PRICE HISTORY
========================= */

async function loadPriceHistory(
  productId,
  store
) {

  if (!resultsEl || !productId) {
    return;
  }


  try {

    const params =
      new URLSearchParams({
        productId: productId,
        store: store || ""
      });


    const response =
      await fetch(
        `${API_URL}/api/history?${params.toString()}`
      );


    if (!response.ok) {
      throw new Error(
        `History HTTP ${response.status}`
      );
    }


    const data =
      await response.json();


    const history =
      Array.isArray(data.history)
        ? data.history
        : [];


    if (!history.length) {
      return;
    }


    const prices =
      history
        .map(item =>
          Number(item.price)
        )
        .filter(Number.isFinite);


    if (!prices.length) {
      return;
    }


    const lowest =
      Math.min(...prices);

    const latest =
      prices[prices.length - 1];

    const highest =
      Math.max(...prices);


    const maxChartPrice =
      highest || 1;


    const chartItems =
      history
        .slice(-12)
        .map(function (item) {

          const price =
            Number(item.price);

          const date =
            new Date(
              item.checked_at
            );


          const dateText =
            Number.isNaN(
              date.getTime()
            )
              ? ""
              : date.toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short"
                  }
                );


          const height =
            Math.max(
              28,
              (price / maxChartPrice) *
                165
            );


          return `

            <div class="zipron-chart-item">

              <div class="zipron-chart-price">
                ₹${Math.round(price)}
              </div>

              <div
                class="zipron-chart-bar"
                style="height:${height}px;"
                title="₹${price}"
              ></div>

              <div class="zipron-chart-date">
                ${esc(dateText)}
              </div>

            </div>

          `;

        })
        .join("");


    const historyHTML = `

      <section class="zipron-history">

        <h2 class="zipron-history-title">
          📈 Price History
        </h2>

        <p class="zipron-history-subtitle">
          Saved Zipron price checks for this product
        </p>


        <div class="zipron-chart">

          ${chartItems}

        </div>


        <div class="zipron-history-summary">


          <div class="zipron-history-stat">

            <span>
              Lowest recorded
            </span>

            <strong>
              ${money(lowest)}
            </strong>

          </div>


          <div class="zipron-history-stat">

            <span>
              Latest price
            </span>

            <strong>
              ${money(latest)}
            </strong>

          </div>


          <div class="zipron-history-stat">

            <span>
              Price checks
            </span>

            <strong>
              ${history.length}
            </strong>

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


/* =========================
   MAIN COMPARISON
========================= */

async function compareProduct() {

  const title =
    searchEl?.value.trim();


  if (!title) {

    setStatus(
      "Enter a product name first."
    );

    return;
  }


  setStatus(
    "Searching verified retailer offers..."
  );


  if (resultsEl) {

    resultsEl.innerHTML = `

      <div class="zipron-searching">

        <div style="font-size:42px;">
          🔎
        </div>

        <h2>
          We're searching...
        </h2>

        <p>
          Checking available retailer connections.
        </p>

      </div>

    `;

  }


  const params =
    new URLSearchParams(
      window.location.search
    );


  const source = {

    title: title,

    price:
      params.get("price")
        ? Number(
            params.get("price")
          )
        : null,

    store:
      params.get("store") ||
      "",

    productId:
      params.get("productId") ||
      "",

    image:
      params.get("image") ||
      "",

    url:
      params.get("url") ||
      "",

    brand:
      params.get("brand") ||
      "",

    sku:
      params.get("sku") ||
      "",

    mpn:
      params.get("mpn") ||
      "",

    gtin:
      params.get("gtin") ||
      ""

  };


  try {

    const response =
      await fetch(
        `${API_URL}/api/compare`,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(source)

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data?.error ||
        `HTTP ${response.status}`
      );

    }


    setStatus(
      data?.message ||
      "Comparison complete."
    );


    renderOffers(data);


    /*
      Load saved price history
    */

    await loadPriceHistory(
      source.productId,
      source.store
    );


  } catch (error) {

    console.error(error);


    setStatus(
      "Comparison failed."
    );


    if (resultsEl) {

      resultsEl.innerHTML = `

        <div class="zipron-error">

          <div style="font-size:42px;">
            ⚠️
          </div>

          <h2>
            Something went wrong
          </h2>

          <p>
            ${esc(error.message)}
          </p>

        </div>

      `;

    }

  }

}


/* =========================
   BUTTON
========================= */

if (searchButton) {

  searchButton.addEventListener(
    "click",
    compareProduct
  );

}


/* =========================
   ENTER KEY
========================= */

if (searchEl) {

  searchEl.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter"
      ) {

        compareProduct();

      }

    }
  );

}


/* =========================
   QUICK SEARCH BUTTONS
========================= */

document
  .querySelectorAll(
    "[data-search]"
  )
  .forEach(function (button) {

    button.addEventListener(
      "click",
      function () {

        if (searchEl) {

          searchEl.value =
            button.dataset.search ||
            button.textContent.trim();

        }

        compareProduct();

      }
    );

  });


/* =========================
   AUTO COMPARE
========================= */

(function autoCompareFromExtension() {

  addZipronStyles();


  const params =
    new URLSearchParams(
      window.location.search
    );


  const title =
    params.get("title");


  if (!title || !searchEl) {
    return;
  }


  searchEl.value =
    title;


  setTimeout(
    compareProduct,
    300
  );

})();
