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

  searchButton.innerHTML =
    "⏳ Searching...";


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

  }


  finally {

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
        ${offers.length} offer${offers.length === 1 ? "" : "s"}
      </span>

    </div>

  `);


  resultsEl.innerHTML = offers.map(
    (offer, index) => {

      const store =
        escapeHtml(
          offer.store ||
          "Retailer"
        );


      const offerTitle =
        escapeHtml(
          offer.title ||
          title
        );


      const price =
        money(
          offer.price
        );


      const score =
        Math.round(
          Number(
            offer.matchScore ||
            0
          ) * 100
        );


      const link =
        offer.affiliateUrl ||
        offer.url ||
        "";


      return `

        <article class="product-card">

          <div class="product-body">

            <div class="store-name">
              ${store}
            </div>

            <h2>
              ${offerTitle}
            </h2>

            <div class="price">
              ${price}
            </div>

            <p class="match-score">
              Match confidence:
              <strong>${score}%</strong>
            </p>

            ${
              index === 0
                ? `
                  <div class="lowest-price">
                    💰 Lowest verified price
                  </div>
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

    }
  ).join("");

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

        searchEl.value =
          value;

        compareProduct();

      }
    );

  });
