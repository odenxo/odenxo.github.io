// Portfolio behaviour: theme, menu, typing text, filters, panels, contact form, background.
(function () {
  var $ = function (i) {
      return document.getElementById(i);
    },
    root = document.documentElement;
  // ----- Theme (follows the device setting) -----
  var mq = window.matchMedia("(prefers-color-scheme:light)");
  function eff() {
    return root.getAttribute("data-theme") || (mq.matches ? "light" : "dark");
  }
  function icon() {
    $("theme").textContent = eff() === "light" ? "☾" : "☀";
  }
  icon();
  $("theme").onclick = function () {
    root.setAttribute("data-theme", eff() === "light" ? "dark" : "light");
    icon();
  };
  if (mq.addEventListener) mq.addEventListener("change", icon);
  else if (mq.addListener) mq.addListener(icon);
  addEventListener("focus", icon);
  document.addEventListener("visibilitychange", icon);
  // ----- Mobile menu -----
  $("menu").onclick = function () {
    var o = $("mnav").classList.toggle("open");
    this.setAttribute("aria-expanded", o);
  };
  document.querySelectorAll("#mnav a").forEach(function (a) {
    a.addEventListener("click", function () {
      $("mnav").classList.remove("open");
    });
  });
  // ----- Typing effect -----
  var roles = [
      "Copy and Content Writer",
      "Social Media Manager",
      "AI Video Creator",
      "QA Tester",
    ],
    ri = 0,
    ci = 0,
    del = false,
    t = $("typed");
  if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
    t.textContent = roles.join(" · ");
  } else {
    (function tick() {
      var r = roles[ri];
      ci += del ? -1 : 1;
      t.textContent = r.slice(0, ci);
      var s = del ? 40 : 80;
      if (!del && ci === r.length) {
        s = 1800;
        del = true;
      } else if (del && ci === 0) {
        del = false;
        ri = (ri + 1) % roles.length;
        s = 400;
      }
      setTimeout(tick, s);
    })();
  }
  // ----- Work filters -----
  var fb = document.querySelectorAll(".fb"),
    tiles = document.querySelectorAll("#wgrid [data-cat]");
  fb.forEach(function (b) {
    b.onclick = function () {
      fb.forEach(function (x) {
        x.setAttribute("aria-pressed", x === b);
      });
      var f = b.dataset.f;
      tiles.forEach(function (c) {
        c.style.display = f === "all" || c.dataset.cat === f ? "" : "none";
      });
    };
  });
  // ----- Full-screen panels -----
  function closeAll() {
    document.querySelectorAll(".dlg").forEach(function (d) {
      d.hidden = true;
      d.querySelectorAll("video").forEach(function (v) {
        v.pause();
      });
    });
    document.body.style.overflow = "";
  }
  function openD(id) {
    closeAll();
    var d = $(id);
    if (d) {
      d.hidden = false;
      d.scrollTop = 0;
      document.body.style.overflow = "hidden";
    }
  }
  // ----- Pop-ups and click handling -----
  var hm = $("hm");
  function hire() {
    hm.hidden = false;
    hm.querySelector("a").focus();
  }
  function unhire() {
    hm.hidden = true;
  }
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open]"),
      c = e.target.closest("[data-close]"),
      h = e.target.closest("[data-hire]");
    if (o) openD(o.getAttribute("data-open"));
    if (c) closeAll();
    if (h) {
      $("mnav").classList.remove("open");
      closeAll();
      hire();
    }
    if (e.target === hm || e.target.id === "hmx") unhire();
    if (e.target.id === "sentm" || e.target.id === "sentx")
      $("sentm").hidden = true;
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!$("sentm").hidden) $("sentm").hidden = true;
      else if (!hm.hidden) unhire();
      else closeAll();
    }
  });
  // ----- Contact form -----
  function compose() {
    var n = $("cn").value.trim(),
      s = $("cs").value.trim() || "Hello Abode",
      m = $("cm").value.trim();
    if (!m) {
      $("cerr").textContent = "Write a short message first.";
      $("cm").focus();
      return null;
    }
    $("cerr").textContent = "";
    return { s: s, b: (n ? "From: " + n + "\n\n" : "") + m };
  }
  function sent() {
    $("cf").reset();
    $("sentm").hidden = false;
    $("sentx").focus();
  }
  $("sendmail").onclick = function () {
    var c = compose();
    if (c) {
      window.open(
        "mailto:abodefelix77@gmail.com?subject=" +
          encodeURIComponent(c.s) +
          "&body=" +
          encodeURIComponent(c.b),
        "_blank",
      );
      sent();
    }
  };
  $("sendwa").onclick = function () {
    var c = compose();
    if (c) {
      window.open(
        "https://wa.me/2349061241315?text=" +
          encodeURIComponent(c.s + "\n\n" + c.b),
        "_blank",
      );
      sent();
    }
  };
  // ----- Particle background -----
  var cv2 = $("bg"),
    x = cv2.getContext("2d"),
    P = [],
    still = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  function size() {
    cv2.width = innerWidth;
    cv2.height = innerHeight;
    P = [];
    var n = innerWidth < 600 ? 28 : 55;
    for (var i = 0; i < n; i++)
      P.push({
        x: Math.random() * cv2.width,
        y: Math.random() * cv2.height,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        c: Math.random() > 0.5 ? "6,182,212" : "139,92,246",
        a: Math.random() * 0.5 + 0.2,
      });
  }
  function draw() {
    x.clearRect(0, 0, cv2.width, cv2.height);
    var light = eff() === "light",
      k = light ? 0.5 : 1;
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      if (!still) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > cv2.width) p.x = 0;
        if (p.x < 0) p.x = cv2.width;
        if (p.y > cv2.height) p.y = 0;
        if (p.y < 0) p.y = cv2.height;
      }
      x.fillStyle = "rgba(" + p.c + "," + p.a * k + ")";
      x.beginPath();
      x.arc(p.x, p.y, p.r, 0, 6.283);
      x.fill();
      for (var j = i + 1; j < P.length; j++) {
        var q = P[j],
          dx = p.x - q.x,
          dy = p.y - q.y,
          d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          x.strokeStyle = "rgba(100,116,139," + (0.12 - d / 1000) * k + ")";
          x.lineWidth = 0.5;
          x.beginPath();
          x.moveTo(p.x, p.y);
          x.lineTo(q.x, q.y);
          x.stroke();
        }
      }
    }
    if (!still) requestAnimationFrame(draw);
  }
  size();
  draw();
  addEventListener("resize", function () {
    size();
    if (still) draw();
  });
})();
