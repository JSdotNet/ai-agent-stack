// metadata.mjs — parsing and validation for the chapter/file `meta` YAML
// blocks defined in knowledge-chapter-metadata.instructions.md.
//
// The schema used across .domain/.arc42/.tech/.design/.ai is intentionally small and
// flat (single-line scalars, null, or bracket lists), so we parse it with a
// tiny hand-written reader instead of pulling in a YAML dependency.

// The approval gate's rung, sitting on top of every folder's own ladder. A
// chapter reaches it when a person has approved the content — the decision the
// flow layer's gate makes before a chapter becomes work. It is deliberately one
// rung shared by every folder rather than a per-folder word: what is being
// approved is the chapter, and the ladder underneath it says what kind of thing
// the chapter is.
//
// It is never a resting value. A chapter states `approved` while the approval
// stands, and drops back to its ordinary rung the moment the content changes —
// an approval is of what was read, not of the heading.
const APPROVED_STATUS = "approved";

const STATUS_BY_FOLDER = {
    domain: ["draft", "proposed", "active", "deprecated", APPROVED_STATUS],
    arc42: ["draft", "proposed", "active", "deprecated", APPROVED_STATUS],
    tech: ["candidate", "trial", "adopted", "hold", "retired", APPROVED_STATUS],
    design: ["draft", "active", "deprecated", APPROVED_STATUS],
    // `.ai` deliberately reuses `.tech`'s ladder: a reader learns one
    // adoption vocabulary. What is on the ladder differs — `.tech` rates a
    // technology, `.ai` rates a way of working with one.
    ai: ["candidate", "trial", "adopted", "hold", "retired", APPROVED_STATUS],
};

// Who approved, and on what day. The gate writes both; they exist so the
// decision travels with the content and lands in the git history, rather than
// living in flow configuration or in someone's memory.
const APPROVAL_FIELDS = ["approved-by", "approved-at"];

// The value a folder's content settles on, which is therefore *omitted* rather
// than written. A folder listed here makes `status` optional: absence means the
// resting value, and writing it out restates what absence already says.
//
// Only the three editorial folders have such a value. In `.domain`, `.arc42`,
// and `.design` `status` records how settled the writing is, and `active` — "no
// longer in transition" — is the state most chapters sit in forever. The other
// two folders have no resting value to omit: in `.tech` and `.ai` the value is
// a *rating* whose whole purpose is to be stated, so an absent status would be
// indistinguishable from `candidate` ("nobody has rated this") and a radar built
// from omissions renders blank.
//
// Note what is *not* resting: `deprecated` is a standing warning and stays
// written, as do `draft` and `proposed`, which say the content is in transition.
const RESTING_STATUS_BY_FOLDER = {
    domain: "active",
    arc42: "active",
    design: "active",
};

// Allowed `type` values per folder, split by block level. `type` records *what
// kind of thing* a chapter or file is — the classification that used to be
// written as a heading prefix (`## Aggregate: Order`). Heading text now carries
// the name alone, so anchors are slugs of the bare name.
//
// A folder whose lists are empty defines no kind distinction of its own: in
// `.arc42` and `.design` the only such distinction (chapter vs section) is
// already carried by heading level, so inventing
// values there would restate the document structure. `type` is omitted in those
// folders and reported when used.
const TYPE_BY_FOLDER = {
    domain: {
        chapter: [
            "aggregate",
            "entity",
            "value-object",
            "enum",
            "shared-value-objects",
            "shared-enums",
            "domain-service",
            "domain-event",
            "feature",
            "sub-feature",
            "term",
        ],
        file: ["context-map", "domain", "features", "model", "flow", "dependencies", "naming"],
    },
    tech: {
        chapter: [
            "language",
            "runtime",
            "framework",
            "library",
            "package",
            "tool",
            "service",
            "platform",
            "protocol",
            "format",
        ],
        file: [],
    },
    ai: {
        chapter: [
            "practice",
            "agent",
            "skill",
            "plugin",
            "mcp-server",
            "hook",
            "workflow",
            "model",
            "concept",
            "guardrail",
        ],
        file: ["adoption-map", "stage", "concepts"],
    },
    arc42: { chapter: [], file: [] },
    design: { chapter: [], file: [] },
};

// `.tech` spelled this concept `kind` before `type` was unified across folders.
// The old name keeps working so an existing repository is not broken by a
// generator sync, but it lints as a warning and is not documented any more.
const LEGACY_TYPE_FIELD_BY_FOLDER = { tech: "kind" };

// The extension namespace. A plugin layered on top of devbook — devbook-
// collaboration is the first — persists its own state on a chapter under `ext`,
// and this schema deliberately says nothing about what it holds: the generator
// carries every `ext` key through untouched, validates none of it, and produces
// no edges from it. That is the whole point. Without it, every extension would
// force a devbook schema bump and a migration in every consuming repository.
//
// The block grammar is flat single-line scalars, so the namespace is spelled
// with dotted keys — `ext.<plugin>.<key>: <value>` — rather than by nesting.
// Namespacing by the owning plugin is a convention this file states and does
// not enforce; enforcing it would be validating the one field that must not be
// validated.
const EXT_FIELD = "ext";
const EXT_PREFIX = "ext.";

/** Whether a metadata key belongs to the opaque extension namespace. */
export function isExtensionField(key) {
    return key === EXT_FIELD || key.startsWith(EXT_PREFIX);
}

// Fields every folder's chapter/file block may carry, plus folder-specific
// extras layered in below.
const COMMON_OPTIONAL_FIELDS = [
    "type",
    "related",
    "issue",
    "effort",
    "roadmap",
    "date",
    "tests",
    ...APPROVAL_FIELDS,
];

// `roadmap` entries are lowercase kebab-case tag slugs, not chapter references.
const ROADMAP_TAG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// `tests` links a chapter or file to the test cases that assert what it claims.
// Entries are `<level>:<runner>:<selector>` — coarse to fine, so a consumer can
// group by level, pick a command from the runner, and hand the selector to that
// runner verbatim.
//
// The level vocabulary is deliberately tiny and about *reach*, not about which
// tool ran it: a unit test pins a rule inside one unit, an integration test
// crosses a process or a store, an end-to-end test drives the product the way a
// user does. That is the distinction a reader of a chapter wants ("is this
// covered end to end?") and the one a runner cannot supply, since the same
// runner routinely hosts all three.
const TEST_LEVELS = ["unit", "integration", "e2e"];

// How each known runner turns a selector into an argv.
//
// This mapping is the reason a test reference carries a runner rather than a
// bare path: a consumer that knows the runner can *run* the test. That is also
// what makes this field admissible where a `code-path` field is not — see
// "Why a test link and not a code link" in
// knowledge-chapter-metadata.instructions.md. A selector that stops resolving
// fails a run out loud; a source path in a metadata block rots in silence.
//
// Selectors are runner-native, because a runner-native selector is exactly what
// a person pastes into a terminal. Where a runner needs a file *and* a title,
// the two are joined with `#`, matching the `<path>#<slug>` shape this schema
// already uses for chapter references.
const TEST_RUNNERS = {
    dotnet: {
        selector: "fully-qualified test class or method name",
        argv: (selector) => ["dotnet", "test", "--filter", `FullyQualifiedName~${selector}`],
    },
    playwright: {
        selector: "<spec path>, optionally #<test title>",
        argv: (selector) => {
            const [spec, title] = splitSpecAndTitle(selector);
            return ["npx", "playwright", "test", spec, ...(title ? ["-g", title] : [])];
        },
    },
    vitest: {
        selector: "<spec path>, optionally #<test name>",
        argv: (selector) => {
            const [spec, title] = splitSpecAndTitle(selector);
            return ["npx", "vitest", "run", spec, ...(title ? ["-t", title] : [])];
        },
    },
    jest: {
        selector: "<spec path>, optionally #<test name>",
        argv: (selector) => {
            const [spec, title] = splitSpecAndTitle(selector);
            return ["npx", "jest", spec, ...(title ? ["-t", title] : [])];
        },
    },
    pytest: {
        selector: "pytest node id",
        argv: (selector) => ["pytest", selector],
    },
};

// A `tests` entry that starts like a knowledge path is a chapter reference
// pasted into a field that takes test identifiers. Worth its own message,
// because the author's intent is obvious and the fix is to move it to `related`.
const KNOWLEDGE_PATH_PREFIX = /^\.(?:domain|arc42|tech|design|ai)\//;

// Fields that steer how this document appears in the generated outline, and so
// describe the document's place in its directory rather than a chapter inside
// it. Valid on the file-level block only.
const FILE_ONLY_FIELDS = ["index", "number"];

// What `index` may say. `root` makes this document its directory's entry point;
// `exclude` keeps it out of the outline. Absent means an ordinary listed
// document, which is the case for nearly every file.
const INDEX_VALUES = ["root", "exclude"];

// `date` is a calendar date, deliberately not a timestamp: it records when the
// thing the document describes was decided or logged, which is a fact about the
// content, not about the last time someone touched the file.
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const NUMBER_PATTERN = /^\d+$/;

// A leading number in a filename, with an optional label before it, so
// `01-introduction.md`, `0007-use-postgres.md`, and `ADR-0007-use-postgres.md`
// all yield their number. The separator is required, so `2024-review.md` reads
// as number 2024 but `introduction.md` yields nothing.
const FILENAME_NUMBER_PATTERN = /^(?:[A-Za-z]+[-_ ])?(\d+)(?:[-_. ]|$)/;

// Fields the schema once defined and no longer does. Reported by name rather
// than as a generic unrecognized field, because a repository that adopted the
// convention earlier still carries them and the author needs to be told what
// replaced them, not just that the field is unknown.
const REMOVED_FIELDS = {
    order:
        "reading order is generated from the folder convention plus what each " +
        "document says about itself. Delete the field; where the generated order is " +
        "not what you want, give the documents a `number` or mark the directory's " +
        "entry point with `index: root`. See " +
        "knowledge-chapter-metadata.instructions.md.",
};

const FOLDER_EXTRA_FIELDS = {
    domain: ["depends-on", "aliases", "feature-flag"],
    arc42: [],
    tech: ["kind", "version", "depends-on", "alternatives"],
    design: [],
    ai: ["depends-on", "stage"],
};

/** Determine which knowledge folder a repo-relative path belongs to. */
export function folderKindForPath(relPath) {
    const normalized = relPath.replace(/\\/g, "/");
    if (normalized.startsWith(".domain/")) return "domain";
    if (normalized.startsWith(".arc42/")) return "arc42";
    if (normalized.startsWith(".tech/")) return "tech";
    if (normalized.startsWith(".design/")) return "design";
    if (normalized.startsWith(".ai/")) return "ai";
    return null;
}

/**
 * The status a folder's content rests at and therefore omits, or null when the
 * folder has none and every block must state its status.
 */
export function restingStatusFor(folder) {
    return RESTING_STATUS_BY_FOLDER[folder] ?? null;
}

/**
 * The effective status of a block, and whether the file actually said it.
 *
 * Every consumer resolves through here rather than reading `meta.status`, so
 * "at rest" and "nobody said" stay distinguishable: an omitted status in an
 * editorial folder resolves to that folder's resting value with
 * `declared: false`, while an omitted status anywhere else stays null — which
 * validateDocument reports as an error, and no viewer should paper over.
 */
export function resolveStatus(folder, meta) {
    const declared = meta?.status ?? null;
    if (declared !== null) return { status: declared, declared: true };
    return { status: restingStatusFor(folder), declared: false };
}

/**
 * The `type` values a folder allows on a block at this level, or `[]` when the
 * folder defines no kind distinction. `level` is "file" for the level-1 block
 * and "chapter" for every other heading.
 */
export function typeValuesFor(folder, level) {
    return TYPE_BY_FOLDER[folder]?.[level] ?? [];
}

/**
 * The effective `type` of a block, falling back to the folder's legacy field
 * name where one exists. Returns null when the block declares no type.
 */
export function resolveType(folder, meta) {
    if (!meta) return null;
    if (meta.type !== undefined && meta.type !== null && meta.type !== "") return meta.type;
    const legacy = LEGACY_TYPE_FIELD_BY_FOLDER[folder];
    const value = legacy ? meta[legacy] : null;
    return value === undefined || value === "" ? null : value;
}

function parseScalar(raw) {
    const value = raw.trim();
    if (value === "null" || value === "") return null;
    if (value.startsWith("[") && value.endsWith("]")) {
        const inner = value.slice(1, -1).trim();
        if (inner === "") return [];
        return inner
            .split(",")
            .map((entry) => stripQuotes(entry.trim()))
            .filter((entry) => entry.length > 0);
    }
    return stripQuotes(value);
}

function stripQuotes(value) {
    if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        return value.slice(1, -1);
    }
    return value;
}

/** Normalize a scalar-or-list metadata value to a list. */
function toList(value) {
    if (value === null || value === undefined) return [];
    return Array.isArray(value) ? value : [value];
}

/** Parse the body of a fenced ```meta block (without the fences) into an object. */
export function parseMetaBody(body) {
    const result = {};
    for (const line of body.split("\n")) {
        if (!line.trim()) continue;
        const idx = line.indexOf(":");
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1);
        result[key] = parseScalar(value);
    }
    return result;
}

/**
 * Split a markdown document into its headings and, for each heading, the
 * immediately-following `meta` block (if present).
 *
 * Returns `{ fileMeta, fileTitle, chapters }` where `chapters` covers every
 * `#`/`##`/`###` heading found (level 1 is also exposed as `fileMeta` /
 * `fileTitle` for convenience, matching the "file-level block sits under the
 * top-level heading" convention).
 */
export function parseDocument(markdown) {
    const lines = markdown.split(/\r?\n/);
    const chapters = [];
    let fileTitle = null;
    let fileMeta = null;

    for (let i = 0; i < lines.length; i++) {
        const headingMatch = /^(#{1,6})\s+(.*)$/.exec(lines[i]);
        if (!headingMatch) continue;

        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        const slug = slugify(text);

        // Look ahead past blank lines for a ```meta fence.
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === "") j++;

        let meta = null;
        let metaRaw = null;
        if (j < lines.length && /^```meta\s*$/.test(lines[j].trim())) {
            const bodyLines = [];
            let k = j + 1;
            while (k < lines.length && lines[k].trim() !== "```") {
                bodyLines.push(lines[k]);
                k++;
            }
            metaRaw = bodyLines.join("\n");
            meta = parseMetaBody(metaRaw);
        }

        const entry = { level, text, slug, line: i + 1, meta, metaRaw };
        chapters.push(entry);

        if (level === 1 && fileTitle === null) {
            fileTitle = text;
            fileMeta = meta;
        }
    }

    return { fileTitle, fileMeta, chapters };
}

// GitHub's anchor algorithm lowercases, strips punctuation, then replaces each
// remaining whitespace character with a hyphen — it does *not* collapse runs.
// "Organizational & Process Constraints" therefore anchors as
// "organizational--process-constraints" (double hyphen where the & was).
export function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s/g, "-");
}

const SUMMARY_MAX_LENGTH = 300;

/** Reduce a Markdown run to the plain text a list view can show on one line. */
function toPlainText(markdown) {
    return markdown
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // image → its alt text
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // link → its label
        .replace(/`([^`]+)`/g, "$1") // code span → its content
        .replace(/(\*\*|__|\*|_)(?=\S)(.+?)(?<=\S)\1/g, "$2") // emphasis markers
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * The document's lede and how many diagrams it embeds — the two things a
 * viewer needs to render a folder's list view, and the two things it would
 * otherwise have to open every file to learn.
 *
 * Both are by-products of a parse the generator is doing anyway, so carrying
 * them on the derived index is what lets a consumer list a knowledge folder
 * without reading a single Markdown file.
 *
 * `summary` is the blockquote that
 * `knowledge-chapter-metadata.instructions.md` places directly after the
 * file-level `meta` block, falling back to the first paragraph of prose when
 * the file has no blockquote. Either way it is the text *before* the first
 * `##`, reduced to plain text and capped at ~300 characters on a word
 * boundary. `null` when the document opens straight into a chapter.
 *
 * `diagrams` counts embedded diagrams across the whole document: fenced
 * ```mermaid blocks plus Markdown image embeds. Both are diagrams to a reader,
 * and the knowledge folders use images for nothing else.
 */
export function documentDigest(markdown) {
    const lines = markdown.split(/\r?\n/);

    let diagrams = 0;
    let inFence = false;
    let fenceChar = null;

    // The lede lives before the first `##`; `blockquote` wins over `paragraph`
    // whichever order they appear in, per the metadata convention.
    let seenTitle = false;
    let ledeDone = false;
    const blockquote = [];
    const paragraph = [];
    let collecting = null;

    for (const line of lines) {
        const fence = line.match(/^\s*(`{3,}|~{3,})\s*([^\s`~]*)/);
        if (fence) {
            if (!inFence) {
                inFence = true;
                fenceChar = fence[1][0];
                if (fence[2].toLowerCase() === "mermaid") diagrams++;
            } else if (fence[1][0] === fenceChar) {
                inFence = false;
                fenceChar = null;
            }
            collecting = null;
            continue;
        }
        if (inFence) continue;

        for (const _ of line.matchAll(/!\[[^\]]*\]\([^)]*\)/g)) diagrams++;

        if (ledeDone) continue;

        const heading = /^(#{1,6})\s+/.exec(line);
        if (heading) {
            // The first `#` opens the lede region; anything deeper closes it.
            if (heading[1].length === 1 && !seenTitle) seenTitle = true;
            else if (seenTitle) ledeDone = true;
            collecting = null;
            continue;
        }
        if (!seenTitle) continue;

        if (line.trim() === "") {
            collecting = null;
            continue;
        }
        if (/^\s*>/.test(line)) {
            if (collecting !== "blockquote" && blockquote.length) continue; // keep the first only
            collecting = "blockquote";
            blockquote.push(line.replace(/^\s*>\s?/, ""));
        } else {
            if (collecting !== "paragraph" && paragraph.length) continue;
            collecting = "paragraph";
            paragraph.push(line);
        }
    }

    const source = blockquote.length ? blockquote : paragraph;
    let summary = source.length ? toPlainText(source.join(" ")) : null;
    if (summary && summary.length > SUMMARY_MAX_LENGTH) {
        const clipped = summary.slice(0, SUMMARY_MAX_LENGTH);
        const lastSpace = clipped.lastIndexOf(" ");
        summary = `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).replace(/[.,;:—-]$/, "")}…`;
    }

    return { summary: summary || null, diagrams };
}

/**
 * Validate one block's `type` against its folder's vocabulary.
 *
 * Messages are sentence fragments beginning with a verb, so each caller can
 * prefix its own subject. Shared by the document lint and by graph
 * construction, so the canvas, the CLI, and CI all report the same thing.
 */
export function typeIssues(folder, blockLevel, meta) {
    const issues = [];
    if (!meta) return issues;

    const allowed = typeValuesFor(folder, blockLevel);
    const declared = resolveType(folder, meta);
    if (allowed.length) {
        if (declared === null) {
            issues.push({
                severity: "error",
                message: `is missing required \`type\`. Expected one of: ${allowed.join(", ")}.`,
            });
        } else if (!allowed.includes(declared)) {
            issues.push({
                severity: "error",
                message: `has type "${declared}", expected one of: ${allowed.join(", ")}.`,
            });
        }
    } else if (declared !== null) {
        issues.push({
            severity: "warning",
            message: `sets \`type\` to "${declared}", but the ${folder} folder defines no \`type\` value set at ${blockLevel} level — heading level already carries that distinction. Omit the field.`,
        });
    }

    const legacy = LEGACY_TYPE_FIELD_BY_FOLDER[folder];
    if (legacy && meta[legacy] != null) {
        issues.push({
            severity: "warning",
            message: `uses \`${legacy}\`, which has been renamed to \`type\`. Rename the field; \`${legacy}\` still works but is no longer documented.`,
        });
    }

    return issues;
}

/** Split a `<spec>#<title>` selector; title is null when the entry has none. */
function splitSpecAndTitle(selector) {
    const idx = selector.indexOf("#");
    if (idx === -1) return [selector, null];
    return [selector.slice(0, idx).trim(), selector.slice(idx + 1).trim() || null];
}

/** Every test level this schema defines, in reach order. */
export const testLevels = () => [...TEST_LEVELS];

/**
 * Every runner the tooling can build a command for, each with the selector shape
 * it expects — what a viewer needs to explain the field to whoever is filling it
 * in.
 */
export const testRunners = () =>
    Object.entries(TEST_RUNNERS).map(([runner, { selector }]) => ({ runner, selector }));

/**
 * Split one `tests` entry into `{ level, runner, selector }`, or null when it is
 * not in `<level>:<runner>:<selector>` form.
 *
 * Only the first two colons delimit: a selector routinely contains its own
 * (`pytest` node ids, a `file:line`), and everything after the runner belongs to
 * the runner.
 */
export function parseTestReference(ref) {
    const raw = String(ref ?? "").trim();
    const first = raw.indexOf(":");
    if (first <= 0) return null;
    const second = raw.indexOf(":", first + 1);
    if (second <= first + 1) return null;
    const selector = raw.slice(second + 1).trim();
    if (!selector) return null;
    return { level: raw.slice(0, first).trim(), runner: raw.slice(first + 1, second).trim(), selector };
}

/**
 * The command that runs one `tests` entry, as `{ level, runner, selector,
 * command }` with `command` an argv array — or null when the entry is malformed
 * or names a runner this tooling has no mapping for.
 *
 * The argv is meant to be run from the repository root. A repository whose
 * runner needs a different working directory, a project path, or a config flag
 * wraps this rather than reshaping the reference: the reference identifies the
 * test, and how this repository invokes its runners is a property of the
 * repository.
 *
 * This is the seam a UI "run this test" affordance sits on. It is deliberately
 * a pure function that returns an argv and executes nothing.
 */
export function testCommand(ref) {
    const parsed = parseTestReference(ref);
    if (!parsed) return null;
    const runner = TEST_RUNNERS[parsed.runner];
    if (!runner) return null;
    return { ...parsed, command: runner.argv(parsed.selector) };
}

/**
 * Validate a block's `tests` entries.
 *
 * Messages are sentence fragments beginning with a verb, matching `typeIssues`,
 * so the document lint, the graph build, and the canvas all report the same
 * thing with their own subject prefixed.
 *
 * An unknown runner is a warning rather than an error: the level and the
 * selector still say what covers this chapter, and a repository on a stack this
 * tooling has never heard of should not be blocked from recording that. What it
 * loses is the run command, which the message says.
 */
export function testIssues(meta) {
    const issues = [];
    if (!meta || meta.tests == null) return issues;

    for (const entry of toList(meta.tests)) {
        if (KNOWLEDGE_PATH_PREFIX.test(entry)) {
            issues.push({
                severity: "error",
                message: `has \`tests\` entry "${entry}", which is a chapter reference — \`tests\` holds \`<level>:<runner>:<selector>\` test identifiers. A link to another chapter belongs in \`related\`.`,
            });
            continue;
        }

        const parsed = parseTestReference(entry);
        if (!parsed) {
            issues.push({
                severity: "error",
                message: `has \`tests\` entry "${entry}", which is not \`<level>:<runner>:<selector>\` — e.g. \`unit:dotnet:Ordering.Domain.Tests.OrderTests\`. Entries cannot contain a comma, since that separates the list.`,
            });
            continue;
        }

        if (!TEST_LEVELS.includes(parsed.level)) {
            issues.push({
                severity: "error",
                message: `has \`tests\` entry "${entry}" with level "${parsed.level}", expected one of: ${TEST_LEVELS.join(", ")}.`,
            });
        }

        if (!(parsed.runner in TEST_RUNNERS)) {
            issues.push({
                severity: "warning",
                message: `has \`tests\` entry "${entry}" naming runner "${parsed.runner}", which this tooling has no command mapping for (known: ${Object.keys(TEST_RUNNERS).join(", ")}), so nothing can offer to run it. The entry is kept as written.`,
            });
        }
    }

    return issues;
}

/**
 * Flag literal escape sequences sitting in Markdown body text.
 *
 * An agent writing a file through a shell can emit the escape itself rather
 * than the newline it stands for — a PowerShell here-string that was single-
 * quoted when it needed interpolation, say. The failure is silent and
 * disproportionate: a `## Heading` glued onto the end of the previous line
 * stops being a heading, so the chapter disappears from the outline, from the
 * graph, and from every check that reasons about headings. Nothing else here
 * can catch it, because by the time those checks run the heading is prose.
 *
 * Warning rather than error: a document legitimately discussing escape
 * sequences would otherwise have no way to say so. Only newline escapes are
 * matched — `\t` was deliberately left out, because it breaks no structure and
 * collides with unformatted Windows paths. A bare `C:\temp\new` written
 * outside backticks is still a known false positive; formatting paths as code
 * avoids it.
 */
export function escapeSequenceIssues(markdown) {
    const issues = [];
    let inFence = false;
    let fenceChar = null;

    markdown.split(/\r?\n/).forEach((line, index) => {
        const fence = line.match(/^\s*(`{3,}|~{3,})/);
        if (fence) {
            if (!inFence) {
                inFence = true;
                fenceChar = fence[1][0];
            } else if (fence[1][0] === fenceChar) {
                inFence = false;
                fenceChar = null;
            }
            return;
        }
        if (inFence) return;

        // The PowerShell escape is checked against the line with double-backtick
        // code spans removed: that is how Markdown quotes a run containing
        // backticks, so a doubly-quoted occurrence is a document *describing*
        // the escape rather than one corrupted by it. Single-backtick spans are
        // left in place, because those backticks are part of the corrupted
        // token itself. The C-style escapes drop single-backtick spans too,
        // since a backticked \n is ordinary documentation.
        const quoted = line.replace(/``.+?``/g, "");
        const found = new Set();
        if (quoted.includes("`r`n")) found.add("`r`n");
        for (const match of quoted.replace(/`[^`]*`/g, "").matchAll(/\\r\\n|\\n/g)) {
            found.add(match[0]);
        }
        if (!found.size) return;

        const glued = /(?:`r`n|\\r\\n|\\n)\s*#{1,6}\s/.test(quoted);
        issues.push({
            severity: "warning",
            line: index + 1,
            message:
                `has a literal ${[...found].map((s) => `"${s}"`).join(" and ")} ` +
                `escape sequence in body text on line ${index + 1}` +
                (glued
                    ? ", with a heading immediately after it — that heading does not start a line, so it is not being parsed as a heading."
                    : ". If a line break was intended, the escape was not interpreted.")
        });
    });

    return issues;
}

/**
 * The number in a file or directory name, or `null` when it carries none.
 *
 * Takes the basename, so it works for `01-introduction.md` and for a numbered
 * subdirectory alike.
 */
export function fileNumberFromPath(relPath) {
    const name = relPath.replace(/\\/g, "/").split("/").pop() ?? "";
    const match = FILENAME_NUMBER_PATTERN.exec(name);
    return match ? Number(match[1]) : null;
}

/**
 * This document's number, from its `number` field if it declares one and from
 * its filename otherwise.
 *
 * The authored field wins, so a document can be renumbered without renaming the
 * file — and a file whose name already carries the number needs no field at
 * all. `numberIssues` reports the two disagreeing.
 */
export function documentNumber(relPath, meta) {
    const declared = meta?.number;
    if (typeof declared === "string" && NUMBER_PATTERN.test(declared)) return Number(declared);
    return fileNumberFromPath(relPath);
}

/**
 * How this document's `index` field steers the outline: `"root"`, `"exclude"`,
 * or `null` for an ordinary listed document.
 */
export function indexRole(meta) {
    const value = meta?.index;
    return typeof value === "string" && INDEX_VALUES.includes(value) ? value : null;
}

/**
 * Lint the fields that steer outline generation — `index`, `number`, `date`.
 *
 * Exported so the graph build reports them, not just the canvas: these fields
 * decide what `index.json` looks like, and a typo in one silently generates a
 * different outline rather than failing.
 *
 * `level` is "file" for the level-1 block and "chapter" for every other heading.
 */
export function outlineFieldIssues(relPath, meta, level) {
    const issues = [];
    if (!meta) return issues;

    if (level !== "file") {
        for (const field of FILE_ONLY_FIELDS) {
            if (meta[field] != null) {
                issues.push({
                    severity: "error",
                    message: `has \`${field}\`, which belongs on the file-level block only — it places the document in its directory, not a chapter in its document.`,
                });
            }
        }
        // The remaining checks are about the file-level fields above plus
        // `date`, which is legal here; fall through for `date` only.
    }

    if (level === "file" && meta.index != null) {
        if (indexRole(meta) === null) {
            issues.push({
                severity: "error",
                message: `has \`index\` "${meta.index}", expected one of: ${INDEX_VALUES.join(", ")}. Omit the field for an ordinary listed document.`,
            });
        }
    }

    if (level === "file" && meta.number != null) {
        const raw = meta.number;
        if (typeof raw !== "string" || !NUMBER_PATTERN.test(raw)) {
            issues.push({
                severity: "error",
                message: `has \`number\` "${Array.isArray(raw) ? raw.join(", ") : raw}" — a document's number is a single non-negative integer.`,
            });
        } else {
            const fromName = fileNumberFromPath(relPath);
            if (fromName !== null && fromName !== Number(raw)) {
                issues.push({
                    severity: "warning",
                    message: `declares \`number: ${raw}\` but its filename reads ${fromName}. The field wins; rename the file or drop the field so a reader sees one number.`,
                });
            }
        }
    }

    if (meta.date != null) {
        const raw = meta.date;
        if (typeof raw !== "string" || !DATE_PATTERN.test(raw)) {
            issues.push({
                severity: "error",
                message: `has \`date\` "${Array.isArray(raw) ? raw.join(", ") : raw}" — a date is a single calendar day in \`YYYY-MM-DD\` form.`,
            });
        }
    }

    return issues;
}

/**
 * Lint the approval record: `status: approved` plus `approved-by` and
 * `approved-at`.
 *
 * Exported so the graph build reports it too. The point of putting an approval
 * in the chapter is that the decision is auditable — a rung with nobody's name
 * on it, or a name with no rung, is the one shape that defeats that.
 */
export function approvalIssues(meta) {
    if (!meta) return [];
    const issues = [];
    const approved = meta.status === APPROVED_STATUS;

    for (const field of APPROVAL_FIELDS) {
        const raw = meta[field];
        if (raw == null) continue;
        if (Array.isArray(raw) || String(raw).trim() === "") {
            issues.push({
                severity: "error",
                message: `has \`${field}\` set to an empty or list value — it records one approver and one day.`,
            });
            continue;
        }
        if (!approved) {
            issues.push({
                severity: "warning",
                message: `carries \`${field}\` without \`status: ${APPROVED_STATUS}\`. Either the approval is current, and the status says so, or it has lapsed and the record comes out with it.`,
            });
        }
    }

    if (meta["approved-at"] != null && !DATE_PATTERN.test(String(meta["approved-at"]))) {
        issues.push({
            severity: "error",
            message: `has \`approved-at\` "${meta["approved-at"]}" — an approval date is a single calendar day in \`YYYY-MM-DD\` form.`,
        });
    }

    if (approved) {
        for (const field of APPROVAL_FIELDS) {
            if (meta[field] == null) {
                issues.push({
                    severity: "warning",
                    message: `states \`status: ${APPROVED_STATUS}\` without \`${field}\`. An approval nobody signed and dated is not a record of a decision.`,
                });
            }
        }
    }

    return issues;
}

/**
 * Fields this block carries that the schema used to define and no longer does.
 *
 * Exported so the graph build reports them the same way it reports `typeIssues`
 * — a repository that adopted an earlier version of the convention still has
 * these fields in its Markdown, and CI is where it needs to be told.
 */
export function removedFieldIssues(meta) {
    if (!meta) return [];
    return Object.keys(meta)
        .filter((key) => key in REMOVED_FIELDS)
        .map((key) => ({
            severity: "error",
            message: `has \`${key}\`, which is no longer part of the metadata schema — ${REMOVED_FIELDS[key]}`,
        }));
}

/**
 * Heuristic lint of a document's metadata blocks against
 * chapter-metadata.instructions.md. Not a full structural validator (it does
 * not know which headings are "addressable chapters" per folder — see that
 * folder's own instructions file) — it checks the blocks that *are* present
 * plus the file-level block, which covers the common authoring mistakes.
 */
export function validateDocument(relPath, markdown) {
    const kind = folderKindForPath(relPath);
    const issues = [];
    if (!kind) {
        issues.push({
            severity: "info",
            message: `${relPath} is not under .domain/, .arc42/, .tech/, .design/, or .ai/ — no metadata rules apply.`,
        });
        return issues;
    }

    const { fileTitle, fileMeta, chapters } = parseDocument(markdown);
    for (const issue of escapeSequenceIssues(markdown)) {
        issues.push({ severity: issue.severity, message: `${relPath} ${issue.message}` });
    }
    const allowedStatus = STATUS_BY_FOLDER[kind];
    const resting = restingStatusFor(kind);
    const optionalFields = new Set([
        ...COMMON_OPTIONAL_FIELDS,
        ...FILE_ONLY_FIELDS,
        ...FOLDER_EXTRA_FIELDS[kind],
    ]);

    if (!fileTitle) {
        issues.push({
            severity: "error",
            message: "No top-level `#` heading found — every file needs one file-level chapter.",
        });
    } else if (!fileMeta) {
        issues.push({
            severity: "error",
            message: `File-level heading "${fileTitle}" is missing its \`meta\` block.`,
        });
    }

    for (const chapter of chapters) {
        const label = `${"#".repeat(chapter.level)} ${chapter.text} (line ${chapter.line})`;
        if (!chapter.meta) {
            // Level-1 heading already reported above as the file-level block.
            if (chapter.level > 1) {
                issues.push({
                    severity: "warning",
                    message: `${label} has no \`meta\` block. Add one if this heading is an addressable chapter for this folder.`,
                });
            }
            continue;
        }

        // `status` is required only in the folders that have no resting value.
        // Where a folder does have one, absence *is* the statement, so an
        // omitted status is correct and the resting value written out is the
        // thing worth reporting — otherwise the corpus ends up with two
        // spellings of one state and neither reader knows which to expect.
        const declaresStatus = "status" in chapter.meta;
        if (!declaresStatus || chapter.meta.status === null) {
            if (resting === null) {
                issues.push({
                    severity: "error",
                    message: `${label} is missing required \`status\`.`,
                });
            } else if (declaresStatus) {
                // An absence is spelled by leaving the field out, never by
                // writing the word `null` — same discipline as `issue: null`.
                issues.push({
                    severity: "warning",
                    message: `${label} sets \`status\` to a null value — omit the field instead to mean the resting value \`${resting}\`.`,
                });
            }
        } else if (!allowedStatus.includes(chapter.meta.status)) {
            issues.push({
                severity: "error",
                message: `${label} has status "${chapter.meta.status}", expected one of: ${allowedStatus.join(", ")}.`,
            });
        } else if (chapter.meta.status === resting) {
            issues.push({
                severity: "warning",
                message: `${label} states \`status: ${resting}\`, which is the resting value in .${kind} — omit the field instead, per the omit-when-empty rule.`,
            });
        }

        // `type` records what kind of thing this chapter or file is, in the
        // vocabulary its folder defines. Folders that define no vocabulary
        // (`.arc42`, `.design`) omit the field entirely.
        const blockLevel = chapter.level === 1 ? "file" : "chapter";
        for (const issue of typeIssues(kind, blockLevel, chapter.meta)) {
            issues.push({ severity: issue.severity, message: `${label} ${issue.message}` });
        }

        // A feature flag key names an application feature in the consuming
        // repository, whose constants this tooling cannot see — so the key
        // itself is deliberately never validated. What is checked is that it is
        // a key at all: an entry carrying `#` or `/` is a chapter or file
        // reference pasted into a field that produces no edge.
        if (kind === "domain" && chapter.meta["feature-flag"] != null) {
            for (const key of toList(chapter.meta["feature-flag"])) {
                if (key.includes("#") || key.includes("/")) {
                    issues.push({
                        severity: "error",
                        message: `${label} has \`feature-flag\` entry "${key}" — feature flag keys are application identifiers, not \`<path>#<slug>\` chapter references.`,
                    });
                }
            }
        }

        // `effort` is a story-point estimate, so it is a single non-negative
        // integer. A list, a fraction, a negative number, or a word such as
        // "large" is not an estimate this schema can total or compare.
        if (chapter.meta.effort != null) {
            const raw = chapter.meta.effort;
            const isInteger = typeof raw === "string" && /^\d+$/.test(raw);
            if (!isInteger) {
                issues.push({
                    severity: "error",
                    message: `${label} has \`effort\` "${Array.isArray(raw) ? raw.join(", ") : raw}" — effort is a story-point estimate and must be a single non-negative integer.`,
                });
            }
        }

        // `.ai` chapters outside a stage file say which stage of the flow they
        // apply at. Like `roadmap`, the entries are slugs naming something in
        // the consuming repository — here its own stage files — so only the
        // shape is checked, never the vocabulary.
        if (kind === "ai" && chapter.meta.stage != null) {
            for (const slug of toList(chapter.meta.stage)) {
                if (!ROADMAP_TAG_PATTERN.test(slug)) {
                    issues.push({
                        severity: "warning",
                        message: `${label} has \`stage\` entry "${slug}" — a stage is a lowercase kebab-case slug naming one of this repository's \`.ai\` stage files, not a path or free text.`,
                    });
                }
            }
        }

        // Roadmap entries are tag slugs an application groups work by, not
        // `<path>#<slug>` chapter references, so the tag vocabulary lives in the
        // consuming repository and only the slug shape is checked here.
        if (chapter.meta.roadmap != null) {
            for (const tag of toList(chapter.meta.roadmap)) {
                if (!ROADMAP_TAG_PATTERN.test(tag)) {
                    issues.push({
                        severity: "warning",
                        message: `${label} has \`roadmap\` entry "${tag}" — roadmap tags are lowercase kebab-case slugs, not chapter references or free text.`,
                    });
                }
            }
        }

        // `tests` names the test cases that assert what this chapter claims,
        // as `<level>:<runner>:<selector>` identifiers a runner can resolve.
        for (const issue of testIssues(chapter.meta)) {
            issues.push({ severity: issue.severity, message: `${label} ${issue.message}` });
        }

        // The approval gate writes into the chapter, so the chapter is where
        // the record is checked.
        for (const issue of approvalIssues(chapter.meta)) {
            issues.push({ severity: issue.severity, message: `${label} ${issue.message}` });
        }

        for (const issue of removedFieldIssues(chapter.meta)) {
            issues.push({ severity: issue.severity, message: `${label} ${issue.message}` });
        }

        for (const issue of outlineFieldIssues(
            relPath,
            chapter.meta,
            chapter.level === 1 ? "file" : "chapter"
        )) {
            issues.push({ severity: issue.severity, message: `${label} ${issue.message}` });
        }

        for (const [key, value] of Object.entries(chapter.meta)) {
            if (isExtensionField(key)) continue; // opaque by contract — never validated
            if (key === "status") continue; // recognized, and fully reported above
            if (key in REMOVED_FIELDS) continue; // already reported above
            if (!optionalFields.has(key)) {
                issues.push({
                    severity: "warning",
                    message: `${label} has unrecognized field \`${key}\` for the ${kind} folder.`,
                });
                continue;
            }
            const isEmptyList = Array.isArray(value) && value.length === 0;
            if (isEmptyList || value === null) {
                issues.push({
                    severity: "warning",
                    message: `${label} sets \`${key}\` to an empty/null value — omit the field instead per the omit-when-empty rule.`,
                });
            }
        }
    }

    return issues;
}
