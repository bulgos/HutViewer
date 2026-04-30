const URL = "https://www.suissealpine.sac-cas.ch/api/1/poi/search?lang=en&output_lang=en&type=hut&limit=200";

type OpeningType = 'closed' | 'open' | 'serviced';

type ServiceMap = Partial<{
        "drinks": boolean,
        "internet": boolean,
        "not_paid": boolean,
        "css_rebate": boolean,
        "half_board": boolean,
        "plain_meals": boolean,
        "family_rooms": boolean,
        "payment_mobile": boolean,
        "cooking_catered": boolean,
        "dogs_on_request": boolean,
        "payment_creditcard": boolean,
        "cooking_non_catered": boolean,
        "separable_group_rooms": boolean
      }>

type SuitabilityMap = Partial<{
        "family": boolean,
        "climbing": boolean,
        "alpine_tour": boolean,
        "via_ferrata": boolean,
        "climbing_kids": boolean,
        "mountain_hiking": boolean,
        "ski_snowboard_tour": boolean
      }>;

type HutType = {
    location: [number, number],
    geographical_name: string,
    sleeps: number,
    id: number,
    is_private: boolean,
    openings: OpeningType[] // should have 12 of them
}

"display_name": "Aarbiwak SAC",
      "en_translation_ok": true,
      "fr_translation_ok": true,
      "geographical_name": "Aarbiwak SAC",
      "geom": {
        "type": "Point",
        "coordinates": [2654722, 1156279]
      },
      "gis_geometry_ok": false,
      "id": 2147000001,
      "is_private": false,
      "it_translation_ok": true,
      "main_lang": "en",
      "nvp_ok": false,
      "orig_status": null,
      "fax": null,
      "tel": null,
      "url": "http://www.sac-pilatus.ch",
      "email": "k.brefin@livenet.ch",
      "owner": "SAC PILATUS",
      "hrs_id": 603,
      "sac_id": 1,
      "sleeps": 17,
      "opening": {
        "month_01": 0,
        "month_02": 0,
        "month_03": 0,
        "month_04": 0,
        "month_05": 0,
        "month_06": 0,
        "month_07": 0,
        "month_08": 0,
        "month_09": 0,
        "month_10": 0,
        "month_11": 0,
        "month_12": 0
      },
      "catering": {
        "month_01": 2,
        "month_02": 2,
        "month_03": 2,
        "month_04": 2,
        "month_05": 2,
        "month_06": 2,
        "month_07": 2,
        "month_08": 2,
        "month_09": 2,
        "month_10": 2,
        "month_11": 2,
        "month_12": 2
      },
      "opentext": {
        "de": "Kein Mobiltelefonempfang, nur Notfunkanlage",
        "en": null,
        "fr": "Pas de connexion téléphonique, uniquement réseau d'urgence",
        "it": null
      },
      "services": {
        "drinks": true,
        "internet": false,
        "not_paid": false,
        "css_rebate": false,
        "half_board": false,
        "plain_meals": false,
        "family_rooms": false,
        "payment_mobile": false,
        "cooking_catered": true,
        "dogs_on_request": false,
        "payment_creditcard": false,
        "cooking_non_catered": true,
        "separable_group_rooms": false
      },
      "suitable": {
        "family": false,
        "climbing": false,
        "alpine_tour": false,
        "via_ferrata": false,
        "climbing_kids": false,
        "mountain_hiking": true,
        "ski_snowboard_tour": true
      },

const fetchAllInformation = async (): HutType[]

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