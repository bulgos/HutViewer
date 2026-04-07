const URL = "https://www.suissealpine.sac-cas.ch/api/1/poi/search?lang=en&output_lang=en&type=hut&limit=200";

let huts = [];

fetch(URL)
  .then(res => res.json())
  .then(data => {
    huts = data.results;
    render();
  });

document.getElementById("noSelfCook").addEventListener("change", render);

function render() {
  const container = document.getElementById("huts");
  container.innerHTML = "";

  const hideSelfCook = document.getElementById("noSelfCook").checked;

  huts
    .filter(h => !hideSelfCook || !h.services.cooking_non_catered)
    .forEach(renderHut);
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
