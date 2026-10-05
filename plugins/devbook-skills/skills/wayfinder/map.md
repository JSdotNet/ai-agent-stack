# Wayfinder map and tickets

The shapes `SKILL.md` writes, and how they live on the tracker. Follow them exactly.

## Tracker

The repository's own issue tracker, through the host's issue CLI — `gh` on GitHub. Ask which
one when the remote does not say. Every operation is native to the tracker:

| Operation | On GitHub |
| --- | --- |
| A ticket is a child of the map | `gh api repos/<owner>/<repo>/issues/<map>/sub_issues -F sub_issue_id=<ticket's id>` — the issue's `id`, not its number |
| A ticket blocks another | `gh api repos/<owner>/<repo>/issues/<blocked>/dependencies/blocked_by -F issue_id=<blocker's id>` |
| Claim | `gh issue edit <n> --add-assignee @me` |
| Frontier | The map's open sub-issues with no open blocker and no assignee, in the map's order |

A tracker with no native blocking gets one `Blocked by: <title>` line per blocker at the end
of the ticket body. Native blocking is the default because the tracker's own view then shows
the frontier. Create the labels on first use.

## The map

One issue, labelled `wayfinder:map`, titled by the effort. It is an index: each decision lives
in its ticket alone, and the map gists it and links. Open tickets are not listed — they are the
open sub-issues.

```markdown
## Destination

<One or two lines: the spec, decision, or change this map finds its way to.>

## Notes

<The domain, the skills every session consults, standing preferences for this effort.>

## Decisions so far

- [<closed ticket title>](<url>): <one-line gist of the answer>

## Not yet specified

<In-scope fog: a question you can tell is coming but cannot yet state precisely. Loose is fine.>

## Out of scope

- [<closed ticket title>](<url>): <gist>, and why it is past the destination
```

**Fog or ticket?** Ticket when the question can be stated precisely now, even if it is blocked.
Fog when it cannot; never pre-slice fog into ticket-sized pieces. Out of scope is ruled by the
destination, not by sharpness, and never graduates.

## Tickets

A child issue of the map, sized to one session, labelled `wayfinder:<type>`. The body is the
question; the answer is the resolution comment, and an asset is linked from the issue, never
pasted.

```markdown
## Question

<The decision or investigation this ticket resolves.>
```

| Type | Who | Resolved by |
| --- | --- | --- |
| `research` | Agent alone | `research-brief` on the question; the brief is the resolution comment. Without the skill, cite each fact's primary source yourself or leave it open |
| `prototype` | With the person | The cheapest concrete artifact to react to — an outline, a stub, rough UI or logic — through a `prototype` skill when the repository has one; link it, never paste it |
| `grilling` | With the person | The `grilling` skill when the host has one; else inline: one question at a time, each with your recommended answer, until the decision is shared. The default type |
| `task` | Agent where it can, else the person with a checklist | Work that unblocks a decision — access, a sign-up, data moved to see its shape. The comment records what was done and the facts later tickets need |

On a ticket with the person, never answer their side of the exchange yourself.
