# 52. Annotations Reach the Devbook Folders and Nothing Else

```meta
date: 2026-09-09
related: [".devbook/arc42/09-architecture-decisions.md", ".devbook/arc42/adr/8-comments-are-findings-until-the-fence-lands.md", ".devbook/arc42/adr/29-automation-owns-the-_meta-refresh.md", ".devbook/domain/devbook-collaboration/model.md"]
```

Two questions the annotation fence left open, closed here as they already behave.

**An annotation fence outside the five devbook folders is inert, and stays that way.**
`annotations-index.mjs` walks the adopted folders only, and `validateDocument` reports an info
and returns for a path outside them. So a fence in `.agents/rules/`, in a plugin's
`resources/`, or in `AGENTS.md` is parsed by nothing, counted by nothing, and warned about by
nothing. That is the intended reach. An annotation is a note on a chapter, and a chapter is
what these folders hold; an instruction file is reviewed as code, in the pull request that
changes it, which is where its comments already go. Widening the walk means deciding what a
chapter is in a file with no `meta` block and no headings that address anything, and it puts
review notes inside files a host injects into every matching session — a note for one reviewer,
paid for on every load.

What it costs is that nothing says so. A fence written in an instruction file looks exactly
like one that works, and the author finds out by looking in `_meta/annotations.json` and not
finding it. Reopen this the first time someone wants to annotate a rule, and the answer then is
a lint that reports a fence outside the folders — not a wider walk.

**A fence after a `mermaid` block annotates the diagram, deliberately.** `parseAnnotations`
treats every fence that is not `meta` or `annotation` as a text block, so the diagram source
becomes the annotated passage. Position is the anchor, and a diagram is a block like any other:
a note under one is a note about it. Consequence: `quote` on such a note has to quote the
mermaid source rather than anything the rendered picture shows, or `--check` reports it as
matching nothing above; a note about the prose around a diagram goes above the fence, against
that prose. `devbook-annotations.md` does not say either of these yet, and this record is
where the answer lives until it does.
