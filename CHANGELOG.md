# Changelog

Every change to Lightweight UI, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and version numbers follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- **Patch** (0.2.0 → 0.2.1): a fix or a visual refinement. Nothing to change in your code.
- **Minor** (0.2.0 → 0.3.0): something new, like a component, a prop, a variant or a token. Existing code keeps working.
- **Major** (1.0.0 → 2.0.0): a breaking change. Something was removed or renamed, or behaves differently, so existing code may need updating. Until 1.0.0, a breaking change bumps the minor version instead.

Write notes under Unreleased as you work. `npm run release` turns them into the next version and picks the bump from the headings: Added or Deprecated make a minor, Removed or a note starting with **Breaking** make a major, and anything else makes a patch.

## [Unreleased]

### Changed

- In the playground, changing the theme now crossfades the whole window over 250ms instead of spreading out as a circle. Nothing sweeps across the screen, so no corner lags behind the rest, and the crossfade still plays with reduced motion on.

## [0.2.1] - 2026-10-08

### Changed

- `CommandMenu` now has open and close motion. It settles in over 150ms, from slightly smaller and a few pixels above where it lands, over a fading scrim, and closes in 100ms. Focus is in the field from the first frame, so typing is never held up, and nothing moves while you type or move through results.
- The playground has more motion:
  - Changing the theme spreads the new one out from the switch you pressed.
  - The phone navigation drawer slides in from its edge, and the menu button's icon turns into a close icon.
  - Sidebar groups and demo code panels open and close to their height instead of snapping.
  - "On this page" has one tick that slides to the current section.
  - The icon details panel stays put while you move between icons and slides away when you close it.
  - Copy buttons ease their icon back in after "Copied".

### Fixed

- Changing pages in a background tab no longer logs "Transition was aborted" errors in the playground's console.

## [0.2.0] - 2026-09-28

### Added

- `FilterMenu` takes `multiple`, for picking several options. Each option gets a checkbox, the menu stays open while you pick, and Clear and Done sit underneath. The trigger names the first pick and counts the rest, as in "Growth +1".
- Three tokens: `line-field`, the resting border of fields and boxes; `track`, the background behind segmented controls; and `shadow-thumb`, the raised selector on a track.
- A changelog and versioning. `npm run release` cuts a version from these notes, pull requests that change the kit are checked for a version bump, and each version gets a GitHub release.

### Changed

- `PillTabs`, `SlidingSwitch`, `SegmentedControl`, `FilterPills` and `IconToggleGroup` share one look: the same bordered track on a lighter background, 28px options, and the same raised selector with a faint edge. `FilterPills` and `IconToggleGroup` gain the border and lose their fully rounded ends.
- A count inside a segment sits 4px from the segment's top, bottom and end, with 8px between it and the label.
- Fields, checkboxes, radios, switches and slider thumbs have quieter borders at rest. Hover and focus are unchanged.
- The playground shows the kit's version in the sidebar and has a Changelog page.

## [0.1.0] - 2026-09-25

### Added

- The kit: colour, type, radius, shadow and motion tokens for light and dark mode, 100+ React components, the Phosphor icon set, and a CLI that copies components into your project.
- The playground, with live demos, ⌘K search and a preview card for shared links, hosted at https://lightweight-ui-kit.vercel.app.

### Fixed

- Corners now match in browsers without `corner-shape`, like Safari and Firefox, instead of looking much rounder.
- Playground demos and code blocks have their hairlines back.

[Unreleased]: https://github.com/ayaneshu/lightweight-ui-kit/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/ayaneshu/lightweight-ui-kit/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/ayaneshu/lightweight-ui-kit/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ayaneshu/lightweight-ui-kit/releases/tag/v0.1.0
