
const PRODUCTS=[
{name:"Everyday Power Bank",category:"Electronics",icon:"🔋",price:1299},
{name:"Budget Smartwatch",category:"Wearables",icon:"⌚",price:1999},
{name:"Wireless Earbuds",category:"Audio",icon:"🎧",price:1499},
{name:"Cotton T-Shirt",category:"Fashion",icon:"👕",price:599},
{name:"Phone Protection Case",category:"Accessories",icon:"📱",price:399},
{name:"Ergonomic Office Chair",category:"Home & Office",icon:"🪑",price:6999}
];
function render(list){const el=document.getElementById("products");if(!el)return;if(!list.length){el.innerHTML="<div class='notice'>No products found.</div>";return}el.innerHTML=list.map(p=>`<article class="product"><div class="product-img">${p.icon}</div><div class="product-body"><span class="tag">${p.category}</span><h3>${p.name}</h3><div class="price">₹${p.price.toLocaleString("en-IN")}</div><p class="small">DEMO DATA — replace with verified retailer data before publishing.</p><a class="btn secondary" href="contact.html">Request comparison</a></div></article>`).join("")}
function initCompare(){const s=document.getElementById("search");if(!s)return;render(PRODUCTS);s.oninput=()=>{const q=s.value.toLowerCase();render(PRODUCTS.filter(p=>(p.name+" "+p.category).toLowerCase().includes(q)))};document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");const c=b.dataset.cat;render(c==="All"?PRODUCTS:PRODUCTS.filter(p=>p.category===c))})}
function initContact(){const f=document.getElementById("contactForm"),s=document.getElementById("status");if(!f)return;f.onsubmit=e=>{e.preventDefault();s.textContent="Form tested successfully. Connect a live form/email service before publishing.";f.reset()}}
document.addEventListener("DOMContentLoaded",()=>{initCompare();initContact()});

