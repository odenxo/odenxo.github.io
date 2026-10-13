const P = [
  {
    id: 1,
    n: "Adire indigo shirt",
    c: "Wear",
    p: 24000,
    t: "circles",
    k: ["#1B2A6B", "#F1E7D3", "#6F8FD8"],
  },
  {
    id: 2,
    n: "Ankara wrap trousers",
    c: "Wear",
    p: 19500,
    t: "diamonds",
    k: ["#C1521F", "#1B1B4B", "#E3B24B"],
  },
  {
    id: 3,
    n: "Aso-oke clutch",
    c: "Carry",
    p: 16500,
    t: "stripes",
    k: ["#7A1F2B", "#E3B24B", "#F1E7D3"],
  },
  {
    id: 4,
    n: "Ankara tote",
    c: "Carry",
    p: 12000,
    t: "zigzag",
    k: ["#1F6B5C", "#F1E7D3", "#E3B24B"],
  },
  {
    id: 5,
    n: "Raffia market bag",
    c: "Carry",
    p: 14500,
    t: "waves",
    k: ["#C99A4B", "#7A4B1E", "#F1E7D3"],
  },
  {
    id: 6,
    n: "Black soap and shea set",
    c: "Home",
    p: 7500,
    t: "sun",
    k: ["#2A2118", "#E3B24B", "#8C5A2B"],
  },
  {
    id: 7,
    n: "Hand-poured clay candle",
    c: "Home",
    p: 9000,
    t: "circles",
    k: ["#C1521F", "#F1E7D3", "#7A2E12"],
  },
  {
    id: 8,
    n: "Calabash serving bowl",
    c: "Home",
    p: 11000,
    t: "diamonds",
    k: ["#4B3A2A", "#E3B24B", "#C1521F"],
  },
];
const R = (a) => `<rect width="120" height="100" fill="${a}"/>`;
const A = {
  circles: (a, b, c) =>
    R(a) +
    [44, 34, 24, 14, 5]
      .map(
        (r, i) =>
          `<circle cx="60" cy="50" r="${r}" fill="${[b, a, c, a, b][i]}"/>`,
      )
      .join(""),
  diamonds: (a, b, c) => {
    let o = R(a);
    for (let y = 0; y < 5; y++)
      for (let x = 0; x < 7; x++) {
        const cx = x * 20 + (y % 2 ? 10 : 0),
          cy = 10 + y * 20;
        o += `<path d="M${cx} ${cy - 9}l9 9-9 9-9-9z" fill="${(x + y) % 2 ? b : c}"/>`;
      }
    return o;
  },
  stripes: (a, b, c) =>
    R(a) +
    [0, 1, 2, 3, 4, 5, 6, 7]
      .map(
        (i) =>
          `<rect x="${i * 15 + 2}" width="${i % 3 ? 5 : 9}" height="100" fill="${i % 2 ? b : c}"/>`,
      )
      .join(""),
  zigzag: (a, b, c) => {
    let o = R(a);
    for (let r = 0; r < 5; r++) {
      let d = "M0 " + (18 + r * 18);
      for (let x = 15; x <= 120; x += 15)
        d += `L${x} ${(x / 15) % 2 ? 4 + r * 18 : 18 + r * 18}`;
      o += `<path d="${d}" fill="none" stroke="${r % 2 ? b : c}" stroke-width="4"/>`;
    }
    return o;
  },
  waves: (a, b, c) => {
    let o = R(a);
    for (let r = 0; r < 6; r++)
      o += `<path d="M0 ${12 + r * 16}q15-12 30 0t30 0t30 0t30 0" fill="none" stroke="${r % 2 ? b : c}" stroke-width="4"/>`;
    return o;
  },
  sun: (a, b, c) => {
    let o = R(a);
    for (let i = 0; i < 16; i++) {
      const t = (i * Math.PI) / 8,
        f = (d) =>
          `${(60 + 90 * Math.cos(t + d)).toFixed(1)} ${(50 + 90 * Math.sin(t + d)).toFixed(1)}`;
      o += `<path d="M60 50L${f(-0.12)}L${f(0.12)}Z" fill="${i % 2 ? b : c}"/>`;
    }
    return o + `<circle cx="60" cy="50" r="13" fill="${a}"/>`;
  },
};
const art = (p) =>
  `<svg viewBox="0 0 120 100" role="img" aria-label="${p.n}">${A[p.t](...p.k)}</svg>`;
document.getElementById("hero-pat").innerHTML =
  `<svg viewBox="0 0 120 100">${A.circles("#1B2A6B", "#E3B24B", "#C1521F")}</svg>`;
const esc = (t) =>
  t.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (n) => "₦" + n.toLocaleString("en-US");
let cart = {},
  cat = "All",
  sort = "def",
  q = "",
  pin = "";
try {
  cart = JSON.parse(localStorage.getItem("kora-cart") || "{}") || {};
} catch (e) {
  cart = {};
}
const $ = (id) => document.getElementById(id);
function save() {
  try {
    localStorage.setItem("kora-cart", JSON.stringify(cart));
  } catch (e) {}
}
function grid() {
  let l = P.filter(
    (p) => (cat === "All" || p.c === cat) && p.n.toLowerCase().includes(q),
  );
  if (sort === "lo") l = [...l].sort((a, b) => a.p - b.p);
  if (sort === "hi") l = [...l].sort((a, b) => b.p - a.p);
  $("grid").innerHTML = l.length
    ? l
        .map(
          (p) =>
            `<article class="p"><div class="art">${art(p)}<span class="stamp">${money(p.p)}</span></div><div class="pb"><small>${p.c}</small><h3>${p.n}</h3><button class="add" data-add="${p.id}">Add to cart</button></div></article>`,
        )
        .join("")
    : '<p class="empty">No products match your search.</p>';
}
function lines() {
  return Object.keys(cart)
    .map((id) => ({ p: P.find((x) => x.id == id), q: cart[id] }))
    .filter((x) => x.p);
}
function total() {
  return lines().reduce((s, x) => s + x.p.p * x.q, 0);
}
function renderCart() {
  const L = lines();
  $("count").textContent = L.reduce((s, x) => s + x.q, 0);
  $("total").textContent = money(total());
  $("checkout").disabled = !L.length;
  $("items").innerHTML = L.length
    ? L.map(
        (x) =>
          `<div class="it">${art(x.p)}<div><strong>${x.p.n}</strong><div>${money(x.p.p)}</div><div class="qty"><button data-d="${x.p.id}" aria-label="Decrease ${x.p.n}">−</button><span>${x.q}</span><button data-u="${x.p.id}" aria-label="Increase ${x.p.n}">+</button></div></div><button class="rm" data-r="${x.p.id}">Remove</button></div>`,
      ).join("")
    : '<p class="empty">Your cart is empty.</p>';
  save();
}
function show(id, on) {
  $(id).hidden = !on;
}
document.addEventListener("click", (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  const d = t.dataset;
  if (d.add) {
    cart[d.add] = (cart[d.add] || 0) + 1;
    renderCart();
    t.textContent = "Added ✓";
    setTimeout(() => (t.textContent = "Add to cart"), 900);
  }
  if (d.u) {
    cart[d.u]++;
    renderCart();
  }
  if (d.d) {
    cart[d.d]--;
    if (cart[d.d] < 1) delete cart[d.d];
    renderCart();
  }
  if (d.r) {
    delete cart[d.r];
    renderCart();
  }
  if (d.cat) {
    cat = d.cat;
    document
      .querySelectorAll(".chip")
      .forEach((c) => c.setAttribute("aria-pressed", c === t));
    grid();
  }
});
$("cartbtn").onclick = () => show("cartov", true);
$("cartx").onclick = () => show("cartov", false);
$("cox").onclick = () => show("coov", false);
$("sort").onchange = (e) => {
  sort = e.target.value;
  grid();
};
$("q").oninput = (e) => {
  q = e.target.value.trim().toLowerCase();
  grid();
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    show("cartov", false);
    show("coov", false);
  }
});
["cartov", "coov"].forEach((i) =>
  $(i).addEventListener("click", (e) => {
    if (e.target.id === i) show(i, false);
  }),
);
$("checkout").onclick = () => {
  show("cartov", false);
  form();
  show("coov", true);
};
function form() {
  $("cobody").innerHTML =
    `<p>Order total: <strong>${money(total())}</strong></p>
 <form id="f" novalidate>
 <label>Full name<input name="name" autocomplete="name"></label><p class="err" data-e="name"></p>
 <label>Email<input name="email" type="email" autocomplete="email"></label><p class="err" data-e="email"></p>
 <label>Phone<input name="phone" type="tel" autocomplete="tel"></label><p class="err" data-e="phone"></p>
 <label>Delivery address<input name="addr" autocomplete="street-address"></label><p class="err" data-e="addr"></p>
 <button class="chip mt-xs" type="button" id="pin">📍 Share my location</button><p class="note mt-xs" id="pinmsg">Optional: add a map pin so the rider can find you.</p>
 <label>Payment<select name="pay"><option>Pay on delivery</option><option>Card (demo)</option></select></label>
 <button class="go mt-lg" type="submit">Place order</button>
 <div class="note">Demo store: no payment is taken and nothing is shipped.</div></form>`;
  pin = "";
  $("pin").onclick = () => {
    if (!navigator.geolocation) {
      $("pinmsg").textContent =
        "Your browser can't share its location. Type your address instead.";
      return;
    }
    $("pinmsg").textContent = "Asking for your location…";
    navigator.geolocation.getCurrentPosition(
      (p) => {
        pin =
          "https://maps.google.com/?q=" +
          p.coords.latitude.toFixed(5) +
          "," +
          p.coords.longitude.toFixed(5);
        $("pinmsg").textContent =
          "Location pinned ✓. The rider will get a map pin.";
      },
      (e) => {
        $("pinmsg").textContent =
          (e.code === 1
            ? "Location access wasn't allowed. "
            : "Couldn't work out your location. ") +
          "Type your address instead.";
      },
      { timeout: 10000, maximumAge: 600000 },
    );
  };
  $("f").onsubmit = (e) => {
    e.preventDefault();
    const f = e.target,
      v = (n) => f[n].value.trim(),
      er = {};
    if (v("name").length < 2) er.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(v("email")))
      er.email = "Enter a valid email address.";
    if (v("phone").replace(/\D/g, "").length < 10)
      er.phone = "Enter a valid phone number.";
    if (v("addr").length < 6 && !pin)
      er.addr = "Enter your delivery address or share your location.";
    f.querySelectorAll(".err").forEach(
      (p) => (p.textContent = er[p.dataset.e] || ""),
    );
    if (Object.keys(er).length) return;
    const no = "KR-" + Math.floor(100000 + Math.random() * 900000);
    cart = {};
    renderCart();
    $("cobody").innerHTML =
      `<div class="ok"><h2>Thank you, ${esc(v("name").split(" ")[0])}!</h2><p>Your order <strong>${no}</strong> is confirmed.<br>A confirmation would be sent to ${esc(v("email"))}.${pin ? "<br>Your map pin was included for delivery." : ""}</p><button class="go mt-md" id="done">Keep shopping</button></div>`;
    $("done").onclick = () => show("coov", false);
  };
}
grid();
renderCart();
