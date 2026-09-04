# Wireframe Patterns

A reference catalogue of common wireframe layout patterns. Use these as starting points when selecting a base layout in the `ux-wireframe` skill.

---

## 1. Dashboard

**Use when:** The primary goal is to provide an at-a-glance overview of status, metrics, or aggregated data.

**Key regions:**

- Top navigation bar (global nav, user profile, notifications)
- Sidebar (secondary navigation, filters)
- Main content area:
  - KPI summary cards (row of 3–5 metric tiles)
  - Primary chart or data visualisation
  - Recent activity list or secondary charts

**Layout grid:** 12-column grid; KPI cards span 3–4 columns each; charts span 6–12.

**Common patterns:**
- Card grid with border and shadow
- Sparklines or progress bars inside KPI cards
- Collapsible sidebar

---

## 2. Form / Data Entry

**Use when:** The user must provide structured input to complete a task (registration, checkout, settings).

**Key regions:**

- Page title and progress indicator (if multi-step)
- Form fields (label above field, helper text below, error message below helper text)
- Primary action button (right-aligned or full-width)
- Secondary action (cancel / back, left-aligned or ghost button)

**Layout grid:** Single-column for mobile; two-column field layout optional on desktop for short related fields (e.g., first name / last name).

**Common patterns:**
- Wizard / step indicator for long forms
- Inline validation on blur
- Sticky submit button on mobile

---

## 3. List / Table

**Use when:** The user needs to browse, search, filter, or select from a set of items.

**Key regions:**

- Header: title, search bar, filter controls, bulk action menu
- Table or list body: rows with consistent column alignment
- Pagination or infinite scroll trigger
- Row actions (edit, delete, view — visible on hover or always visible)

**Layout grid:** Full-width table; columns sized proportionally to content.

**Common patterns:**
- Sortable column headers
- Row selection checkboxes
- Empty state illustration + call to action
- Loading skeleton rows

---

## 4. List–Detail (Master–Detail)

**Use when:** The user selects an item from a list and views its detail without navigating away.

**Key regions:**

- Left panel: scrollable list of items (compact card or row format)
- Right panel: detail view of the selected item
- Detail panel header: item title, status badge, primary action buttons

**Layout grid:** Left panel ~30–35% width; right panel ~65–70% width on desktop. Collapses to full-screen navigation on mobile.

**Common patterns:**
- Selected item highlighted in list
- Breadcrumb or back button on mobile detail view

---

## 5. Card Grid

**Use when:** Items are visually comparable and benefit from an equal-weight visual presentation (products, articles, team members).

**Key regions:**

- Filter / sort bar at top
- Responsive card grid (3–4 columns desktop, 2 tablet, 1 mobile)
- Each card: image area, title, subtitle, metadata, action button

**Layout grid:** 12-column; each card spans 3–4 columns.

**Common patterns:**
- Skeleton loading cards
- "Load more" button or infinite scroll
- Hover state with elevated shadow and quick-action overlay

---

## 6. Wizard / Step Flow

**Use when:** A complex task is broken into sequential steps to reduce cognitive load.

**Key regions:**

- Step indicator / breadcrumb at top (step number + label)
- Main content area (form or decision for the current step)
- Navigation buttons: Back (left/ghost) and Next / Submit (right/primary)

**Layout grid:** Centred single column; max-width ~640–800 px.

**Common patterns:**
- Progress bar above step indicator
- Step labels clickable only for completed steps
- Summary review step before final submit

---

## 7. Modal / Dialog

**Use when:** A focused action or confirmation is needed without losing the current context.

**Key regions:**

- Overlay backdrop (semi-transparent)
- Dialog container: title, body content, action buttons
- Close button (top-right corner, icon button)

**Sizing:**
- Small: confirmation/alert — ~400 px wide
- Medium: form or detail — ~600 px wide
- Large: data entry or multi-step — ~800 px wide

**Common patterns:**
- Destructive action dialogs: prominent cancel, danger-styled confirm
- Keyboard trap (focus stays within dialog while open)
- ESC key closes the dialog

---

## 8. Empty State

**Use when:** A list, dashboard, or search result has no items to show.

**Key regions:**

- Centred illustration or icon
- Heading: brief explanation of why the area is empty
- Body copy: optional explanation or tips
- Call-to-action button: primary action to populate the area

**Common patterns:**
- First-use onboarding empty state (welcoming, instructional)
- No-results-found state (search-specific, with suggestions)
- Error state (connection failed, retry option)

---

## 9. Navigation Patterns

### Top Navigation Bar

- Logo / app name (left)
- Primary nav links (centre or left after logo)
- User avatar + menu trigger (right)
- Optional: search icon or expanded search bar

### Sidebar Navigation

- Fixed left sidebar, 240–280 px wide
- App logo at top
- Grouped nav items with section labels
- Active state: filled background or left accent bar
- Collapse to icon-only rail at narrow viewports

### Bottom Navigation (Mobile)

- Fixed to viewport bottom
- 3–5 primary destinations as icon + label tabs
- Active tab: filled icon, accent colour
