const $ = (id) => document.getElementById(id);
const esc = (t) =>
  String(t).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const W = (c) =>
  c === 0
    ? ["Clear sky", "clear", "☀️"]
    : c <= 2
      ? ["Partly cloudy", "cloud", "⛅"]
      : c === 3
        ? ["Overcast", "cloud", "☁️"]
        : c <= 48
          ? ["Fog", "fog", "🌫️"]
          : c <= 57
            ? ["Drizzle", "rain", "🌦️"]
            : c <= 67
              ? ["Rain", "rain", "🌧️"]
              : c <= 77
                ? ["Snow", "snow", "❄️"]
                : c <= 82
                  ? ["Rain showers", "rain", "🌦️"]
                  : c <= 86
                    ? ["Snow showers", "snow", "❄️"]
                    : ["Thunderstorm", "storm", "⛈️"];
let place = {
    name: "Port Harcourt",
    country: "Nigeria",
    lat: 4.8156,
    lon: 7.0498,
  },
  data = null,
  unit = "c",
  demo = false;
let saved = false;
try {
  const s = JSON.parse(localStorage.getItem("harm-place") || "null");
  if (s && s.lat) {
    place = s;
    saved = true;
  }
  if (localStorage.getItem("harm-unit") === "f") unit = "f";
} catch (e) {}
const T = (v) =>
  unit === "c" ? Math.round(v) + "°" : Math.round((v * 9) / 5 + 32) + "°";
const S = (v) =>
  unit === "c" ? Math.round(v) + " km/h" : Math.round(v / 1.609) + " mph";
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) =>
  d.getFullYear() +
  "-" +
  pad(d.getMonth() + 1) +
  "-" +
  pad(d.getDate()) +
  "T" +
  pad(d.getHours()) +
  ":00";
function sample() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const hourly = { time: [], temperature_2m: [], weather_code: [] };
  for (let i = 0; i < 48; i++) {
    const d = new Date(now.getTime() + i * 36e5),
      h = d.getHours();
    hourly.time.push(iso(d));
    hourly.temperature_2m.push(27 + 4 * Math.sin(((h - 9) / 24) * 2 * Math.PI));
    hourly.weather_code.push(
      h >= 15 && h <= 18 ? 95 : h >= 19 && h <= 22 ? 61 : 2,
    );
  }
  const daily = {
    time: [],
    weather_code: [2, 61, 95, 2, 3, 61, 0],
    temperature_2m_max: [31, 29, 28, 31, 30, 29, 32],
    temperature_2m_min: [24, 23, 23, 24, 24, 23, 24],
    precipitation_probability_max: [20, 70, 85, 25, 35, 65, 10],
  };
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getTime() + i * 864e5);
    daily.time.push(
      d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()),
    );
  }
  return {
    current: {
      time: iso(now),
      temperature_2m: 29,
      apparent_temperature: 33,
      relative_humidity_2m: 78,
      wind_speed_10m: 12,
      weather_code: 2,
    },
    hourly,
    daily,
  };
}
async function getJSON(url) {
  const c = new AbortController(),
    t = setTimeout(() => c.abort(), 8000);
  try {
    const r = await fetch(url, { signal: c.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}
async function load() {
  $("status").className = "";
  $("status").textContent = "Loading weather for " + place.name + "…";
  try {
    data = await getJSON(
      "https://api.open-meteo.com/v1/forecast?latitude=" +
        place.lat +
        "&longitude=" +
        place.lon +
        "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7",
    );
    demo = false;
    $("status").textContent = "Updated just now.";
  } catch (e) {
    data = sample();
    demo = true;
    $("status").className = "err";
    $("status").textContent =
      "Live weather is unavailable here, so this is demo data for " +
      place.name +
      ". Host the page on your own site for live data.";
  }
  render();
}
function render() {
  if (!data) return;
  const c = data.current,
    w = W(c.weather_code),
    d = data.daily;
  let i0 = data.hourly.time.findIndex((t) => t >= c.time.slice(0, 13));
  if (i0 < 0) i0 = 0;
  const hrs = data.hourly.time
    .slice(i0, i0 + 24)
    .map((t, k) => {
      const j = i0 + k,
        h = W(data.hourly.weather_code[j]);
      return `<div class="h"><small>${k === 0 ? "Now" : t.slice(11, 13) + ":00"}</small><span aria-hidden="true">${h[2]}</span><strong>${T(data.hourly.temperature_2m[j])}</strong><small class="sr" hidden>${h[0]}</small></div>`;
    })
    .join("");
  const lo = Math.min(...d.temperature_2m_min),
    hi = Math.max(...d.temperature_2m_max),
    sp = hi - lo || 1;
  const days = d.time
    .map((t, k) => {
      const x = W(d.weather_code[k]),
        a = ((d.temperature_2m_min[k] - lo) / sp) * 100,
        b = ((d.temperature_2m_max[k] - lo) / sp) * 100,
        n =
          k === 0
            ? "Today"
            : new Date(t + "T00:00").toLocaleDateString("en-GB", {
                weekday: "short",
              });
      return `<li class="d"><strong>${n}</strong><span class="ic" role="img" aria-label="${x[0]}">${x[2]}</span><span class="rain">${d.precipitation_probability_max[k] ?? 0}%</span><div class="rng"><em>${T(d.temperature_2m_min[k])}</em><i><b style="left:${a}%;width:${Math.max(b - a, 6)}%"></b></i><em>${T(d.temperature_2m_max[k])}</em></div></li>`;
    })
    .join("");
  $("out").innerHTML =
    `<section class="hero ${w[1]}"><h2>${esc(place.name)}${place.country ? ", " + esc(place.country) : ""}</h2>
 <div class="big"><b>${T(c.temperature_2m)}</b><span aria-hidden="true">${w[2]}</span></div><div class="cond">${w[0]}</div>
 <div class="det"><div><small>Feels like</small><strong>${T(c.apparent_temperature)}</strong></div><div><small>Humidity</small><strong>${Math.round(c.relative_humidity_2m)}%</strong></div><div><small>Wind</small><strong>${S(c.wind_speed_10m)}</strong></div><div><small>Rain today</small><strong>${d.precipitation_probability_max[0] ?? 0}%</strong></div></div></section>
 <h3 class="sec">Next 24 hours</h3><div class="hours">${hrs}</div>
 <h3 class="sec">7-day forecast</h3><ul class="days">${days}</ul>`;
}
$("sf").onsubmit = async (e) => {
  e.preventDefault();
  const q = $("city").value.trim();
  if (!q) return;
  $("pick").innerHTML = "";
  $("status").className = "";
  $("status").textContent = "Searching…";
  try {
    const r = await getJSON(
      "https://geocoding-api.open-meteo.com/v1/search?count=5&name=" +
        encodeURIComponent(q),
    );
    if (!r.results || !r.results.length) {
      $("status").className = "err";
      $("status").textContent =
        "No place found for “" + q + "”. Try another spelling.";
      return;
    }
    if (r.results.length === 1) choose(r.results[0]);
    else {
      $("status").textContent = "Choose the right place:";
      $("pick").innerHTML = r.results
        .map(
          (p, k) =>
            `<button data-k="${k}">${esc(p.name)}${p.admin1 ? ", " + esc(p.admin1) : ""}, ${esc(p.country || "")}</button>`,
        )
        .join("");
      window._r = r.results;
    }
  } catch (err) {
    $("status").className = "err";
    $("status").textContent =
      "Search needs a connection to the weather service, which isn't available here.";
  }
};
function choose(p) {
  place = {
    name: p.name,
    country: p.country || "",
    lat: p.latitude,
    lon: p.longitude,
  };
  try {
    localStorage.setItem("harm-place", JSON.stringify(place));
  } catch (e) {}
  $("pick").innerHTML = "";
  load();
}
$("pick").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (b) choose(window._r[+b.dataset.k]);
});
document.querySelectorAll(".units button").forEach((b) => {
  b.setAttribute("aria-pressed", b.dataset.u === unit);
  b.onclick = () => {
    unit = b.dataset.u;
    try {
      localStorage.setItem("harm-unit", unit);
    } catch (e) {}
    document
      .querySelectorAll(".units button")
      .forEach((x) => x.setAttribute("aria-pressed", x === b));
    render();
  };
});
function locate(auto) {
  if (!navigator.geolocation) {
    $("status").className = "err";
    $("status").textContent =
      "Your browser can't share its location. Search for a city instead.";
    if (auto) load();
    return;
  }
  $("status").className = "";
  $("status").textContent = "Asking for your location…";
  navigator.geolocation.getCurrentPosition(
    (p) => {
      place = {
        name: "Your location",
        country: "",
        lat: +p.coords.latitude.toFixed(3),
        lon: +p.coords.longitude.toFixed(3),
      };
      $("pick").innerHTML = "";
      load();
    },
    (e) => {
      const m =
        (e.code === 1
          ? "Location access wasn't allowed. "
          : "Couldn't work out your location. ") +
        "Showing " +
        place.name +
        ". You can search for a city instead.";
      load().then(() => {
        $("status").className = "err";
        $("status").textContent =
          m +
          " " +
          ($("status").className === "err" && demo
            ? $("status").textContent
            : "");
      });
    },
    { timeout: 10000, maximumAge: 600000 },
  );
}
$("loc").onclick = () => locate(false);
if (saved) load();
else locate(true);
