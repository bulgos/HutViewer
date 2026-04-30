const URL = "https://www.suissealpine.sac-cas.ch/api/1/poi/search?lang=en&output_lang=en&type=hut&limit=200";

let huts = [];
const filterIds = [
  "selfCookYes",
  "selfCookNo",
  "cateredYes",
  "cateredNo"
];

fetch(URL)
  .then(res => res.json())
  .then(data => {
    huts = data.results;
    render();
  });

filterIds.forEach(id => {
  document.getElementById(id).addEventListener("change", render);
});

function render() {
  const container = document.getElementById("huts");
  container.innerHTML = "";

  const filters = {
    selfCookYes: document.getElementById("selfCookYes").checked,
    selfCookNo: document.getElementById("selfCookNo").checked,
    cateredYes: document.getElementById("cateredYes").checked,
    cateredNo: document.getElementById("cateredNo").checked
  };

  huts
    .filter(h => matchesFilters(h, filters))
    .forEach(renderHut);
}

function matchesFilters(hut, filters) {
  return matchesBooleanFilter(
    hut.services.cooking_non_catered,
    filters.selfCookYes,
    filters.selfCookNo
  ) && matchesBooleanFilter(
    hut.services.cooking_catered,
    filters.cateredYes,
    filters.cateredNo
  );
}

function matchesBooleanFilter(value, includeTrue, includeFalse) {
  if (value) {
    return includeTrue;
  }

  return includeFalse;
}

function renderHut(hut) {
  const div = document.createElement("div");
  div.className = "hut";

  div.innerHTML = `
    <div class="title">${hut.display_name}</div>
    <div class="meta">⛰️ ${hut.altitude} m · 🛏️ ${hut.sleeps} beds</div>
    <div class="meta">
      🍳 ${hut.services.cooking_non_catered ? "self-cook" : "no self-cook"} ·
      🍲 ${hut.services.cooking_catered ? "catered" : "not catered"}
    </div>
    <div class="opening">${openingSummary(hut.opening)}</div>
  `;

  document.getElementById("huts").appendChild(div);
}

function openingSummary(opening) {
  const months = Object.entries(opening)
    .map(([k, v]) => ({ m: parseInt(k.split("_")[1]), v }))
    .sort((a, b) => a.m - b.m);

  const open = months.filter(x => x.v === 2).map(x => x.m);

  if (open.length === 0) return "❄️ Closed or self-service only";

  const month = m =>
    new Date(0, m - 1).toLocaleString("en", { month: "short" });

  return `🍲 Staffed: ${month(open[0])} – ${month(open[open.length - 1])}`;
}
