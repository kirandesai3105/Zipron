const API_URL = "https://zipron-api.onrender.com";

const demoProducts = [
  {
    category: "Electronics",
    title: "10000mAh Power Bank",
    price: 1299,
    icon: "🔋"
  },
  {
    category: "Wearables",
    title: "Smart Watch",
    price: 1999,
    icon: "⌚"
  },
  {
    category: "Audio",
    title: "Wireless Earbuds",
    price: 1499,
    icon: "🎧"
  },
  {
    category: "Fashion",
    title: "Cotton T-Shirt",
    price: 599,
    icon: "👕"
  },
  {
    category: "Accessories",
    title: "Phone Protection Case",
    price: 399,
    icon: "📱"
  },
  {
    category: "Home & Office",
    title: "Ergonomic Office Chair",
    price: 6999,
    icon: "🪑"
  }
];

const productsEl = document.getElementById("products");
const searchEl = document.getElementById("search");
const filters = document.querySelectorAll(".filter");

let activeCategory = "All";

function money(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function renderProducts(list) {
  if (!productsEl) return;

  if (!list.length) {
    productsEl.innerHTML = `
      <div class="notice">
        No products found. Try another search.
      </div>
    `;
    return;
  }

  productsEl.innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-image">
        <span style="font-size:60px">${product.icon || "🛍️"}</span>
      </div>

      <div class="product-body">
        <div class="category">${product.category || "Product"}</div>

        <h2>${escapeHtml(product.title)}</h2>

        <div class="price">
          ${money(product.price)}
        </div>

        <p class="demo-label">
          Search this product for verified retailer prices.
        </p>

        <button
          class="compare-button"
          data-title="${escapeAttr(product.title)}"
        >
          Compare prices
        </button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".compare-button").forEach(button => {
    button.addEventListener("click", () => {
      compareProduct(button.dataset.title);
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function getFilteredProducts() {
  const search = (searchEl?.value || "").toLowerCase().trim();

  return demoProducts.filter(product => {
    const categoryOK =
      activeCategory === "All" ||
      product.category === activeCategory;

    const searchOK =
      !search ||
      product.title.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);

    return categoryOK && searchOK;
  });
}

function render() {
  renderProducts(getFilteredProducts());
}

async function compareProduct(title) {
  if (!productsEl) return;

  productsEl.innerHTML = `
    <div class="notice">
      <b>Searching verified prices...</b><br>
      Please wait.
    </div>
  `;

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
      throw new Error(data.error || "Comparison failed.");
    }

    showComparison(title, data);

  } catch (error) {
    productsEl.innerHTML = `
      <div class="notice">
        <b>Unable to compare right now.</b>
        <br><br>
        ${escapeHtml(error.message)}
      </div>
    `;
  }
}

function showComparison(title, data) {
  const offers = data.offers || [];

  if (!offers.length) {
    productsEl.innerHTML = `
      <div class="notice">
        <h2>No verified offers found</h2>
        <p>${escapeHtml(data.message || "No matching offers were found.")}</p>
      </div>
    `;
    return;
  }

  productsEl.innerHTML = `
    <div style="grid-column:1/-1">
      <button id="backToProducts" class="compare-button">
        ← Back to products
      </button>

      <h2 style="margin-top:25px">
        Price comparison
      </h2>

      <p>
        Results for:
        <b>${escapeHtml(title)}</b>
      </p>

      <div class="products">
        ${offers.map((offer, index) => `
          <article class="product-card">
            <div class="product-body">
              <div class="category">
                ${escapeHtml(offer.store || "Retailer")}
              </div>

              <h2>
                ${escapeHtml(offer.title || title)}
              </h2>

              <div class="price">
                ${money(offer.price)}
              </div>

              <p>
                Match confidence:
                <b>${Math.round((offer.matchScore || 0) * 100)}%</b>
              </p>

              ${
                index === 0
                  ? `<p><b>Lowest verified price</b></p>`
                  : ""
              }

              ${
                offer.affiliateUrl || offer.url
                  ? `
                    <a
                      class="compare-button"
                      href="${escapeAttr(offer.affiliateUrl || offer.url)}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View offer
                    </a>
                  `
                  : ""
              }
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;

  document
    .getElementById("backToProducts")
    ?.addEventListener("click", render);
}

searchEl?.addEventListener("input", render);

filters.forEach(button => {
  button.addEventListener("click", () => {
    filters.forEach(b => b.classList.remove("active"));

    button.classList.add("active");

    activeCategory = button.dataset.cat || "All";

    render();
  });
});

render();
