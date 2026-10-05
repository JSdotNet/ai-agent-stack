// 027-procedures-in-devbook against the stamp layouts it meets: the procedures' entry after
// devbook's, before it, and with no devbook entry at all — each moved with every hash kept,
// every other byte left alone, and a second run that changes nothing.
//
//   node --test plugins/devbook/migrations/027-procedures-in-devbook/migrate.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), "migrate.mjs");

const devbook = {
    pluginVersion: "1.16.0",
    contractVersion: 26,
    adopted: ["arc42", "design"],
    materialized: {
        ".agents/rules/devbook-arc42.md": { from: "1.16.0", hash: "sha256:aaa", managed: true },
    },
    migrations: [{ id: "021-no-review-triad", applied: "2026-10-01" }],
};
const procedures = {
    pluginVersion: "1.16.0",
    adopted: ["run", "capture"],
    materialized: {
        ".agents/skills/capture.md": { from: "1.15.0", hash: "sha256:ccc", managed: false },
        ".github/skills/run/SKILL.md": { from: "1.16.0", hash: "sha256:rrr", managed: true },
    },
};

function repo(components, { crlf = false } = {}) {
    const root = mkdtempSync(path.join(tmpdir(), "procedures-in-devbook-"));
    mkdirSync(path.join(root, ".devbook"));
    const text = JSON.stringify({ id: "x", components, gates: [] }, null, 2) + "\n";
    writeFileSync(path.join(root, ".devbook/config.json"), crlf ? text.replace(/\n/g, "\r\n") : text);
    return root;
}
const run = (root, ...flags) => spawnSync(process.execPath, [SCRIPT, "--root", root, ...flags], { encoding: "utf8" });
const read = (root) => readFileSync(path.join(root, ".devbook/config.json"), "utf8");

function assertMoved(root) {
    const stamp = JSON.parse(read(root));
    assert.equal(stamp.components["devbook-procedures"], undefined);
    assert.deepEqual(stamp.components.devbook.procedures, { adopted: ["run", "capture"] });
    for (const [p, entry] of Object.entries(procedures.materialized)) {
        assert.deepEqual(stamp.components.devbook.materialized[p], entry, p);
    }
    assert.deepEqual(stamp.gates, []);
    assert.equal(stamp.id, "x");
    return stamp;
}

for (const [label, components] of [
    ["after devbook's entry", { devbook, "devbook-procedures": procedures, delivery: { pluginVersion: "1.16.0" } }],
    ["before devbook's entry", { "devbook-procedures": procedures, devbook }],
    ["as the last entry", { devbook, "devbook-procedures": procedures }],
]) {
    test(`moves the procedures' entry ${label}, keeping every hash`, () => {
        const root = repo(components);
        try {
            assert.equal(run(root, "--check").status, 1);
            assert.equal(run(root).status, 0);
            const stamp = assertMoved(root);
            assert.deepEqual(stamp.components.devbook.adopted, devbook.adopted);
            assert.deepEqual(stamp.components.devbook.migrations, devbook.migrations);
            assert.deepEqual(stamp.components.devbook.materialized[".agents/rules/devbook-arc42.md"], devbook.materialized[".agents/rules/devbook-arc42.md"]);
            if (components.delivery) assert.deepEqual(stamp.components.delivery, components.delivery);
            const once = read(root);
            assert.equal(run(root, "--check").status, 0);
            assert.equal(run(root).status, 0);
            assert.equal(read(root), once, "a second run changes nothing");
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });
}

test("creates devbook's entry from the procedures' alone, and keeps CRLF", () => {
    const root = repo({ "devbook-procedures": procedures }, { crlf: true });
    try {
        assert.equal(run(root).status, 0);
        const stamp = assertMoved(root);
        assert.deepEqual(Object.keys(stamp.components), ["devbook"]);
        assert.doesNotMatch(read(root).replace(/\r\n/g, ""), /\n/);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});

test("devbook's own record of a path wins, and nothing to do without the old entry", () => {
    const mine = { from: "1.16.0", hash: "sha256:mine", managed: true };
    const root = repo({ devbook: { ...devbook, materialized: { ".agents/skills/capture.md": mine } }, "devbook-procedures": procedures });
    try {
        assert.equal(run(root).status, 0);
        assert.deepEqual(JSON.parse(read(root)).components.devbook.materialized[".agents/skills/capture.md"], mine);
        const bare = repo({ devbook });
        try {
            const before = read(bare);
            assert.equal(run(bare, "--check").status, 0);
            assert.match(run(bare).stdout, /nothing to do/);
            assert.equal(read(bare), before);
        } finally {
            rmSync(bare, { recursive: true, force: true });
        }
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});
