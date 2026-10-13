const $ = (id) => document.getElementById(id);
const esc = (t) =>
  t.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const KEY = "plumb-tasks",
  L = { high: "High", med: "Medium", low: "Low" },
  O = { high: 0, med: 1, low: 2 };
const seed = () => [
  {
    id: 3,
    t: "Test the checkout on a phone",
    pr: "high",
    due: "",
    done: false,
  },
  { id: 2, t: "Write the About section copy", pr: "med", due: "", done: false },
  { id: 1, t: "Publish the portfolio", pr: "low", due: "", done: true },
];
let T,
  filter = "all",
  sort = "new",
  q = "",
  editing = null,
  last = null,
  timer;
try {
  const r = localStorage.getItem(KEY);
  T = r ? JSON.parse(r) : seed();
} catch (e) {
  T = seed();
}
if (!Array.isArray(T)) T = seed();
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(T));
  } catch (e) {}
};
const today = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};
$("today").textContent = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
function render() {
  const td = today(),
    done = T.filter((t) => t.done).length,
    pc = T.length ? Math.round((done / T.length) * 100) : 0;
  $("pct").textContent = pc + "%";
  $("arc").setAttribute(
    "stroke-dashoffset",
    (163.4 * (1 - pc / 100)).toFixed(1),
  );
  $("n-all").textContent = T.length;
  $("n-active").textContent = T.length - done;
  $("n-done").textContent = done;
  let l = T.filter(
    (t) =>
      (filter === "all" || (filter === "done") === t.done) &&
      t.t.toLowerCase().includes(q),
  );
  if (sort === "due")
    l.sort((a, b) => ((a.due || "9") > (b.due || "9") ? 1 : -1));
  else if (sort === "pri") l.sort((a, b) => O[a.pr] - O[b.pr]);
  else l.sort((a, b) => b.id - a.id);
  $("list").innerHTML = l.length
    ? l
        .map((t) => {
          const od = !t.done && t.due && t.due < td;
          const dd = t.due
            ? new Date(t.due + "T00:00").toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })
            : "";
          return `<li class="t ${t.pr} ${t.done ? "done" : ""}" data-id="${t.id}"><input type="checkbox" id="c${t.id}" data-tog ${t.done ? "checked" : ""}>
  <div class="tb">${editing === t.id ? `<input class="ed" id="ed" value="${esc(t.t)}" maxlength="120" aria-label="Edit task">` : `<label for="c${t.id}">${esc(t.t)}</label>`}
  <div class="meta"><span class="pri ${t.pr}">${L[t.pr]}</span>${dd ? `<span class="${od ? "od" : ""}">Due ${dd}${od ? " (overdue)" : ""}</span>` : ""}</div></div>
  <div class="ac">${editing === t.id ? "<button data-save>Save</button>" : "<button data-edit>Edit</button>"}<button data-del>Delete</button></div></li>`;
        })
        .join("")
    : '<li class="empty">' +
      (T.length
        ? "Nothing matches."
        : "No tasks yet. Add your first one above.") +
      "</li>";
  $("left").textContent =
    T.length - done + (T.length - done === 1 ? " task" : " tasks") + " left";
  $("clear").hidden = !done;
  if (editing !== null) {
    const e = $("ed");
    if (e) {
      e.focus();
      e.setSelectionRange(e.value.length, e.value.length);
    }
  }
  save();
}
function toast(m) {
  $("tmsg").textContent = m;
  $("toast").hidden = false;
  clearTimeout(timer);
  timer = setTimeout(() => ($("toast").hidden = true), 5000);
}
$("f").onsubmit = (e) => {
  e.preventDefault();
  const t = $("title").value.trim();
  if (!t) {
    $("msg").textContent = "Give the task a name first.";
    $("title").focus();
    return;
  }
  $("msg").textContent = "";
  T.push({
    id: Date.now(),
    t,
    pr: $("pr").value,
    due: $("due").value,
    done: false,
  });
  $("title").value = "";
  $("due").value = "";
  render();
};
function commit(id) {
  const e = $("ed"),
    t = T.find((x) => x.id === id);
  if (e && t && e.value.trim()) t.t = e.value.trim();
  editing = null;
  render();
}
$("list").addEventListener("click", (e) => {
  const li = e.target.closest("li[data-id]");
  if (!li) return;
  const id = +li.dataset.id,
    t = T.find((x) => x.id === id);
  if (e.target.matches("[data-tog]")) {
    t.done = e.target.checked;
    render();
  }
  if (e.target.matches("[data-edit]")) {
    editing = id;
    render();
  }
  if (e.target.matches("[data-save]")) commit(id);
  if (e.target.matches("[data-del]")) {
    last = { t, i: T.indexOf(t) };
    T = T.filter((x) => x.id !== id);
    render();
    toast("Task deleted");
  }
});
$("list").addEventListener("keydown", (e) => {
  if (e.target.id !== "ed") return;
  const id = editing;
  if (e.key === "Enter") commit(id);
  if (e.key === "Escape") {
    editing = null;
    render();
  }
});
$("undo").onclick = () => {
  if (last) {
    T.splice(last.i, 0, last.t);
    last = null;
    render();
  }
  $("toast").hidden = true;
};
$("clear").onclick = () => {
  T = T.filter((t) => !t.done);
  render();
};
document.querySelectorAll(".tab").forEach(
  (b) =>
    (b.onclick = () => {
      filter = b.dataset.f;
      document
        .querySelectorAll(".tab")
        .forEach((x) => x.setAttribute("aria-pressed", x === b));
      render();
    }),
);
$("q").oninput = (e) => {
  q = e.target.value.trim().toLowerCase();
  render();
};
$("sort").onchange = (e) => {
  sort = e.target.value;
  render();
};
render();
