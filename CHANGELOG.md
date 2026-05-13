# Changelog

All notable changes to this project are documented here.

## [1.3.9] - 2026-05-06

### Fixed
- Settings dropdown now renders correctly — it is appended to `document.body` with `position: fixed` and positioned using the gear button's screen coordinates, so it is no longer clipped by Zendesk's header overflow

## [1.3.8] - 2026-05-06

### Changed
- Replaced the four individual header buttons (⏰ 🎯 🔄 ➕) with a single **⚙️ settings button** that opens a clean dropdown menu. The stats section now has full width so the counter text no longer gets cut off.

## [1.3.7] - 2026-05-06

### Added
- **Manual add button (➕)** in the header controls. Click it, enter a ticket number or full URL, and the interaction is added to today's calendar and the counter increments by 1.
  - If the ticket is currently open in Zendesk, the script enriches the entry with the subject, product, and ticket type from the DOM
  - If not open, a minimal entry is created with the ticket ID and a constructed URL
  - Accepts bare ticket numbers (e.g. `11234567`) or full Zendesk URLs

## [1.3.6] - 2026-05-06

### Fixed
- Product detection now rejects Zendesk's empty placeholder value (`-`) — tickets with no product set will show no badge instead of a `-` badge
- Added `checking for new messages` and `messages available` to the notification filter patterns, preventing Zendesk polling status strings from being captured as ticket subjects

## [1.3.5] - 2026-05-06

### Fixed
- Private note detection now falls back to `aria-label="Internal note from..."` when `data-zes-comment-is-note` attribute is missing from the DOM — this was causing private notes to not be counted in some Zendesk DOM states
- Same fallback applied to the second-to-last comment check used in the detection logic

## [1.3.4] - 2026-05-06

### Changed
- Calendar interaction badges now show the **raw product name** from the Zendesk dropdown (e.g. "WooPayments", "WooCommerce - Subscriptions") instead of a normalized category label. Color still comes from the category for consistency.

### Added
- Product field warning banner: when a private note is detected but the Product field is empty, a centered amber toast appears warning the user to fill in the field before submitting

## [1.3.3] - 2026-05-06

### Fixed
- Counter now correctly counts **only private/internal notes** — previously the Step 6 condition was inverted and was counting public replies/emails while skipping private notes
- Single-comment path had the same inversion and is now fixed
- Removed `lastTicketIds` deduplication from `incrementSubmissionCounter` — this was blocking the counter from incrementing when a second note was added to a ticket worked on earlier in the day. The `commentCounts` map already handles true deduplication at the observer level.

## [1.3.2] - 2026-05-05

### Fixed
- Added Step 2 retry logic: when `omni-log-container` is not found inside `conversationPane`, the script now retries up to 8 times with increasing delays (500ms × attempt) instead of failing immediately
- Removed `this.updateInteractionsDisplay()` call from `trackInteraction` — the function was never defined, causing a runtime error on every tracked interaction
- Fixed hardcoded version string in the initialization log

## [1.3.1] - 2026-05-04

### Added
- Product detection via `detectProductFromPage()` with three strategies: ticket-form dropdown fields, Garden form fields, and aria-label attributes
- `normalizeTicketType()` maps raw product strings to canonical labels (Mobile, MailPoet, WooCommerce, Jetpack, WordPress.com, Akismet, Pressable, Plugin)
- Product color coding in the calendar badge display

### Fixed
- MailPoet product detection now correctly matches before the generic WooCommerce pattern

## [1.3.0] - 2026-04-01

### Added
- Calendar-based interaction tracking — all ticket interactions stored in `localStorage` with date, subject, product, status, priority, and requester
- Calendar view opens in a new tab with monthly/weekly totals and clickable day modals
- Per-ticket `omni-log-container` MutationObserver (`omniLogObservers` Map) for immediate comment detection
- SPA navigation detection via `history.pushState`/`replaceState` patching
- Step 1 retry logic for `conversationPane` detection (up to 6 retries)
- Timezone support throughout all date calculations
- Dark mode support

## [1.1.0] - 2024-11-10

### Initial release
- Basic submission counter in the Zendesk header
- Daily target based on working hours × interactions per hour
- Color-coded progress bar and rocket-themed milestone animations
- Customizable working hours (⏰), target rate (🎯), and manual count adjustment (🔄)
- Daily reset at midnight
