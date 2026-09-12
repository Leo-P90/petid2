import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
function run(file, context, names) {
  const source = read("src/ui/" + file)
    .replace(/import[\s\S]*?;\s*/g, "")
    .replace(/export\s*\{[\s\S]*?\};?/g, "")
    .replace(/export /g, "");
  vm.runInNewContext(
    source + "\n globalThis.api={" + names.join(",") + "};",
    context,
  );
  return context.api;
}
function fixture() {
  const values = new Map();
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id))
      elements.set(id, {
        textContent: "",
        innerHTML: "",
        value: "",
        hidden: false,
        hasAttribute: () => true,
        style: {},
        classList: {
          add() {},
          remove() {},
          toggle() {},
          contains() {
            return false;
          },
        },
      });
    return elements.get(id);
  };
  return {
    localStorage: {
      getItem: (k) => values.get(k) || null,
      setItem: (k, v) => values.set(k, v),
    },
    document: { getElementById: element, querySelectorAll: () => [] },
    petData: [
      { ad: "Boncuk", tur: "kedi", fotolar: ["data:a", "data:b"] },
      { ad: "Zeytin", tur: "kopek", fotolar: ["data:c"] },
    ],
    appState: { curPet: 0, session: null },
    pID: (id, v) => (element(id).textContent = v),
    petEmoji: () => "",
    yas: () => "",
    saveAll: async () => {},
    addPet: async () => {},
    updateBigFoto() {},
    fotoPrevGoster() {},
    photoState: { temp: undefined },
    updateMatchBadge() {},
    renderTimeline() {},
    escapeHtml: (s) => s,
    toast() {},
    L: { divIcon: () => ({}) },
    go() {},
    confirm: () => true,
    Date,
    Intl,
    crypto: { randomUUID: () => "actor" },
    setTimeout: () => {},
    requestAnimationFrame: (f) => f(),
  };
}
test("single authored entry; deferred screens, controls and imports absent", () => {
  const h = read("index.html"),
    main = read("src/main.js");
  assert.equal((h.match(/<script/g) || []).length, 1);
  assert.match(h, /src="\/src\/main.js"/);
  for (const name of [
    "egitim",
    "ai",
    "topluluk",
    "market",
    "urun",
    "sepet",
    "oyun",
  ])
    assert.ok(!h.includes('id="scr-' + name + '"'));
  assert.ok(
    !/pixelCreateModal|createPixelPet|Google ile|Apple ile|aiHealthSummary/.test(
      h,
    ),
  );
  assert.ok(
    !/premium-upgrade\.js|game\/|ui\/(training|chat|home-ai|market|cart|hero-pet)/.test(
      main,
    ),
  );
});
test("profile switch renders only selected pet photos and identity", () => {
  const c = fixture(),
    a = run("profile.js", c, ["setPet", "saveEdit"]);
  a.setPet(1);
  assert.equal(c.appState.curPet, 1);
  assert.equal(c.document.getElementById("pName").textContent, "Zeytin");
  assert.match(c.document.getElementById("petPhotos").innerHTML, /data:c/);
  assert.doesNotMatch(
    c.document.getElementById("petPhotos").innerHTML,
    /data:a/,
  );
});
test("multiple-photo edit and remove persist only selected pet", async () => {
  const c = fixture(),
    a = run("profile.js", c, ["saveEdit"]);
  c.photoState.temp = ["data:x", "data:y"];
  await a.saveEdit();
  assert.deepEqual(Array.from(c.petData[0].fotolar), ["data:x", "data:y"]);
  assert.deepEqual(c.petData[1].fotolar, ["data:c"]);
  c.photoState.temp = [];
  await a.saveEdit();
  assert.equal(c.petData[0].foto, "");
  assert.equal(c.petData[0].fotolar.length, 0);
});
test("report owner approval archives; non-owner cannot close or review", async () => {
  const c = fixture(),
    a = run("reports.js", c, ["closeOwnReport", "reviewSighting"]);
  c.confirmArchive = async () => true;
  const report = {
    id: 1,
    ownerId: "other",
    type: "kayip",
    status: "pending",
    petName: "Demo",
    petType: "kedi",
    createdAt: new Date().toISOString(),
    flags: [],
    sightings: [{ id: 2, status: "pending" }],
  };
  c.localStorage.setItem("patidostReports", JSON.stringify([report]));
  await a.closeOwnReport(1);
  await a.reviewSighting(1, 2, "confirm");
  assert.equal(
    JSON.parse(c.localStorage.getItem("patidostReports"))[0].status,
    "pending",
  );
  c.appState.session = { user: { id: "other" } };
  await a.reviewSighting(1, 2, "confirm");
  const result = JSON.parse(c.localStorage.getItem("patidostReports"))[0];
  assert.equal(result.status, "closed");
  assert.equal(result.sightings[0].status, "confirmed");
});
test("health prototype records are pet-scoped and never gain vet trust", () => {
  const c = fixture(),
    a = run("health-records.js", c, ["loadRecords", "saveRecords"]);
  a.saveRecords([{ id: 1, trust: "vet" }]);
  c.appState.curPet = 1;
  assert.equal(a.loadRecords().length, 0);
  a.saveRecords([{ id: 2 }]);
  c.appState.curPet = 0;
  assert.equal(a.loadRecords()[0].id, 1);
  assert.equal(a.loadRecords()[0].trust, "user");
});
test("health tabs expose one panel and ignore unknown targets", () => {
  const c = fixture();
  const panels = [
    c.document.getElementById("careTracking"),
    c.document.getElementById("vetRecords"),
  ];
  c.document.querySelectorAll = () => panels;
  const a = run("health.js", c, ["sagJump"]);
  a.sagJump("vetRecords");
  assert.equal(panels[0].hidden, true);
  assert.equal(panels[1].hidden, false);
});
test("theme toggle updates all buttons and survives initialization", () => {
  const c = fixture();
  let dark = false;
  const phone = {
      classList: { contains: () => dark, toggle: (k, v) => (dark = v) },
    },
    buttons = [{}, {}];
  c.document.querySelector = () => phone;
  c.document.querySelectorAll = (s) => (s === ".theme-btn" ? buttons : []);
  const a = run("theme.js", c, ["toggleTheme", "initTheme"]);
  a.toggleTheme();
  assert.equal(dark, true);
  assert.equal(c.localStorage.getItem("patidostTheme"), "1");
  assert.ok(buttons.every((b) => b.textContent === "☀️"));
  dark = false;
  a.initTheme();
  assert.equal(dark, true);
});

test("sighting stays pending until the owner reviews it; archive cancellation is inert", async () => {
  const c = fixture();
  const map = {
    setView() {
      return this;
    },
    on() {
      return this;
    },
    invalidateSize() {},
  };
  const marker = {
    addTo() {
      return this;
    },
    on() {},
    setLatLng() {
      return this;
    },
  };
  c.L = {
    divIcon: () => ({}),
    map: () => map,
    tileLayer: () => ({ addTo() {} }),
    marker: () => marker,
  };
  c.confirmArchive = async () => false;
  const a = run("reports.js", c, [
    "startSighting",
    "submitSighting",
    "closeOwnReport",
  ]);
  c.localStorage.setItem(
    "patidostReports",
    JSON.stringify([
      {
        id: 1,
        ownerId: "owner",
        type: "kayip",
        status: "active",
        lat: 41,
        lng: 29,
        createdAt: new Date().toISOString(),
        sightings: [],
        flags: [],
      },
    ]),
  );
  a.startSighting(1);
  c.document.getElementById("sightingDetail").value = "QA: parkta gördüm";
  await a.submitSighting();
  let report = JSON.parse(c.localStorage.getItem("patidostReports"))[0];
  assert.equal(report.status, "pending");
  assert.equal(report.sightings[0].status, "pending");
  c.appState.session = { user: { id: "owner" } };
  await a.closeOwnReport(1);
  assert.equal(
    JSON.parse(c.localStorage.getItem("patidostReports"))[0].status,
    "pending",
  );
  c.confirmArchive = async () => true;
  await a.closeOwnReport(1);
  assert.equal(
    JSON.parse(c.localStorage.getItem("patidostReports"))[0].status,
    "closed",
  );
});

test("file selection caps at five; unreadable photos do not overwrite the previous selection", async () => {
  const c = fixture();
  let serial = 0;
  c.document.createElement = () => ({
    width: 0,
    height: 0,
    getContext: () => ({ drawImage() {} }),
    toDataURL: () => `data:qa-${serial++}`,
  });
  c.FileReader = class {
    readAsDataURL(file) {
      this.result = file.bad ? "bad" : "good";
      this.onload();
    }
  };
  c.Image = class {
    width = 80;
    height = 80;
    set src(value) {
      if (value === "bad") this.onerror();
      else this.onload();
    }
  };
  c.DEFAULT_FOTO = {};
  const a = run("photo.js", c, ["fotoSec", "photoState"]);
  await a.fotoSec({ files: Array.from({ length: 6 }, () => ({})) });
  assert.equal(a.photoState.temp.length, 5);
  const previous = a.photoState.temp;
  await a.fotoSec({ files: [{ bad: true }] });
  assert.equal(a.photoState.temp, previous);
  assert.equal(c.document.getElementById("editSaveBtn").disabled, false);
});

test("production source graph excludes deferred runtime modules", () => {
  const visited = new Set();
  function visit(path) {
    if (visited.has(path)) return;
    visited.add(path);
    const source = read(path);
    assert.doesNotMatch(
      source,
      /generativelanguage|VITE_GEMINI|game\/engine|game\/flappy/,
    );
    for (const match of source.matchAll(
      /(?:import[\s\S]*?from\s*|import\s*)["']([^"']+)["']/g,
    )) {
      if (!match[1].startsWith(".") || !match[1].endsWith(".js")) continue;
      const resolved = new URL(
        match[1],
        new URL("../" + path, import.meta.url),
      );
      const relative = resolved.pathname.split("/app/")[1];
      visit(relative);
    }
  }
  visit("src/main.js");
  for (const path of visited)
    assert.ok(
      !/\/(game|training|chat|home-ai|market|cart)\//.test(path) &&
        !/(training|home-ai|market|cart)\.js$/.test(path),
      path,
    );
});
