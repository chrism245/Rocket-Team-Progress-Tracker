# 🚀 Rocket Team Progress Tracker

A Tampermonkey userscript for Zendesk agents to automatically track daily ticket interactions and visualize them in a calendar view.

## What it does

The script monitors your Zendesk tabs and increments a counter every time you add a **private/internal note** to a ticket. All data is stored locally in your browser — nothing is sent to any external server.

### Features

- **Daily progress counter** in the Zendesk header showing current count, daily target, and a color-coded progress bar
- **Calendar view** (📅) with monthly/weekly totals — click any day to see every ticket you worked on
- **Product badge** on each interaction showing the exact product from the Zendesk field (WooPayments, MailPoet, Jetpack, etc.)
- **Empty product warning** — shows a banner if you add a private note without setting the Product field
- **Rocket-themed milestone animations** at 25%, 50%, 75%, and 100% of daily goal
- **Customizable settings**: working hours (⏰), target rate (🎯), and manual count adjustment (🔄)
- **Dark mode support** and timezone-aware date tracking

## Installation

### Requirements

- [Tampermonkey](https://www.tampermonkey.net/) browser extension (Chrome, Firefox, Edge, Safari)

### Steps

1. Open the Tampermonkey dashboard → **Utilities** tab → **Import from file**
2. Select `Rocket Team Progress Tracker-1.1.0.user.js`
3. Click **Install**
4. Navigate to `https://a8c.zendesk.com/agent/*` — the counter will appear in the top-right header

## How tracking works

The script attaches a `MutationObserver` to each open ticket's `omni-log-container`. When a new comment appears, it checks:

1. Is the new comment an **internal note**? (detected via `data-zes-comment-is-note="true"` or `aria-label="Internal note from..."`)
2. If yes → increment the counter and record the interaction

One private note = one interaction. Adding multiple notes to the same ticket later in the day will each count separately.

## Usage

### First-time setup

1. Click ⏰ → enter your support hours for the day (e.g. `8`)
2. Click 🎯 → enter your target interactions/hour (default `3.5`)
3. Your daily target updates automatically: `hours × rate`

### Daily usage

- Work normally in Zendesk — tracking is automatic
- Add private notes to tickets as you work; each one increments the counter
- Click 📅 anytime to open the calendar in a new tab
- Click 🔄 if you need to manually correct the count

### Calendar view

- **Blue days** have interactions; **green border** = today
- Click any day to see the full ticket list with product badges, timestamps, and clickable ticket links
- Navigate months with Previous/Next buttons

## Settings storage

All data is stored in browser `localStorage`:

| Key | Contents |
|-----|----------|
| `zendeskSubmissionCounter` | Today's interaction count |
| `zendeskLastResetDate` | Date of last daily reset |
| `zendeskWorkingHours` | Configured working hours |
| `zendeskTargetRate` | Configured interactions/hour |
| `zendeskInteractions` | Full interaction history (all days) |

Clearing browser data will delete your history. Data is browser-specific and does not sync across devices.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Counter not showing | Check Tampermonkey is enabled; refresh the page |
| Interaction not counting | Make sure you're adding an **internal/private note**, not a public reply |
| Counter shows wrong number | Click 🔄 to manually correct |
| Calendar not opening | Check pop-up blocker; calendar opens in a new tab |
| Wrong product showing | Verify the Product field is set in the ticket sidebar before adding the note |

## Version history

See [CHANGELOG.md](CHANGELOG.md).

## Credits

Originally based on a script by [@thestevek](https://github.com/thestevek). Extended with calendar tracking, product detection, and reliability improvements.
