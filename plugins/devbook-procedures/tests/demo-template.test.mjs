// The demo template and the sample demo built on it: the managed region's hash is the one its
// begin marker carries, the sample holds that region byte for byte, and every screen, anchor,
// and walkthrough step in the sample resolves against its demo-model.
//
//   node --test plugins/devbook-procedures/tests/demo-template.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const asset = (p) => readFileSync(fileURLToPath(new URL(`../assets/${p}`, import.meta.url)), "utf8").replace(/\r\n/g, "\n");
const template = asset("demo-template.html");
const sample = asset("demo-sample/features.demo.html");

const BEGIN = /<!-- template:begin hash=(\S+) -->/g;
const END = "<!-- template:end -->";

// The region is everything between the begin marker and the end marker, over LF; its hash is
// sha256 over that text, spelled as the reconcile protocol spells a file's hash.
function region(html) {
  const begins = [...html.matchAll(BEGIN)];
  assert.equal(begins.length, 1, "exactly one template:begin marker");
  const from = begins[0].index + begins[0][0].length;
  const to = html.indexOf(END, from);
  assert.ok(to > 0 && html.indexOf(END, to + 1) < 0, "exactly one template:end marker, after the begin marker");
  const text = html.slice(from, to);
  return { declared: begins[0][1], text, hash: `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`, outside: html.slice(0, begins[0].index) + html.slice(to + END.length) };
}

// Both read the demo's own parts only: the region's comment names the same tags.
function model(html) {
  html = region(html).outside;
  const m = /<script type="application\/json" id="demo-model">([\s\S]*?)<\/script>/.exec(html);
  assert.ok(m, "a demo-model script");
  return JSON.parse(m[1]);
}

// Each section[data-screen] with the data-anchor values inside it, read from the markup.
function screens(html) {
  html = region(html).outside;
  const main = /<main data-demo-app>([\s\S]*)<\/main>/.exec(html)[1];
  const out = new Map();
  for (const s of main.split(/(?=<section id=")/).slice(1)) {
    const id = /^<section id="([^"]+)"[^>]*\bdata-screen\b/.exec(s)[1];
    assert.ok(!out.has(id), `screen ${id} appears once`);
    out.set(id, [...s.matchAll(/data-anchor="([^"]+)"/g)].map((a) => a[1]));
  }
  return out;
}

test("the template's begin marker carries the hash of its region", () => {
  const r = region(template);
  assert.equal(r.declared, r.hash);
});

test("the sample carries the template's region byte for byte", () => {
  const t = region(template), s = region(sample);
  assert.equal(s.declared, t.declared);
  assert.equal(s.text, t.text);
});

for (const [name, html] of [["template", template], ["sample", sample]]) {
  test(`the ${name} has no script outside the region but its two JSON parts, and fetches nothing`, () => {
    const { outside } = region(html);
    const scripts = [...outside.matchAll(/<script\b([^>]*)>/g)].map((m) => m[1]);
    assert.deepEqual(scripts.map((a) => /id="([^"]+)"/.exec(a)?.[1]).sort(), ["demo-meta", "demo-model"]);
    assert.ok(scripts.every((a) => /type="application\/json"/.test(a)));
    assert.doesNotMatch(html, /\b(?:src|href)="(?:https?:)?\/\//);
    assert.doesNotMatch(html, /<link\b|@import|\bfetch\(|XMLHttpRequest/);
  });

  test(`the ${name}'s demo-model and its screens list each other exactly`, () => {
    const m = model(html), found = screens(html);
    assert.deepEqual(m.screens.map((s) => s.id).sort(), [...found.keys()].sort());
    for (const s of m.screens) {
      assert.equal(new Set(s.anchors).size, s.anchors.length, `${s.id}: no anchor listed twice`);
      assert.deepEqual([...s.anchors].sort(), [...found.get(s.id)].sort(), `${s.id}: anchors`);
      if (s.of) assert.ok(found.has(s.of), `${s.id}: of names a screen`);
    }
    assert.ok(found.has(m.app.home), "app.home names a screen");
  });
}

test("the sample has one walkthrough, and each step resolves", () => {
  const m = model(sample), found = screens(sample);
  assert.equal(m.walkthroughs.length, 1);
  assert.deepEqual(m.variants, [], "a demo bound for domain/ carries one variant");
  for (const w of m.walkthroughs) for (const st of w.steps) {
    assert.ok(found.has(st.screen), `${w.id}: ${st.screen}`);
    if (st.anchor) assert.ok(found.get(st.screen).includes(st.anchor), `${w.id}: ${st.screen}/${st.anchor}`);
    if (st.role) assert.ok(m.roles.some((r) => r.key === st.role), `${w.id}: role ${st.role}`);
    assert.ok(st.text, `${w.id}: every step says its scenario line`);
  }
});
