# Lightweight UI

A lightweight React UI kit: tokens, typography, colour, motion and a full set of components, plus a playground that shows all of it working.

**Live playground: [lightweight-ui-kit.vercel.app](https://lightweight-ui-kit.vercel.app)**

Ink on paper, in light and dark. Hairlines and ink washes instead of greys. Big, smoothed corners. Geist for the interface, Geist Pixel for display. Fast motion. Icons by [Phosphor](https://phosphoricons.com).

> **Where this repo lives.** The commands below install from `ayaneshu/lightweight-ui-kit`. If the kit moves, change that path in this README, in `bin/lightweight-ui.mjs` and in `playground/src/ui/site.ts`.

---

## Install

### 1. As a package (one command)

```bash
npm install github:ayaneshu/lightweight-ui-kit
```

npm builds the package from source on install (the `prepare` script), so nothing needs publishing first. To publish to npm later, you'll need a scoped name such as `@buildsbyas/lightweight-ui`, because `lightweight-ui` is already taken there by an unrelated package.

**Styles.** Pick one:

```ts
// No Tailwind: precompiled reset + tokens + fonts + every class the components use
import 'lightweight-ui/styles.css'
```

```css
/* Tailwind v4: use the theme, so bg-ink, text-label, rounded-sheet… work in your own code too */
@import "tailwindcss";
@import "lightweight-ui/theme.css";
@import "lightweight-ui/base.css";           /* optional: page face, pixel headings, press feedback */
@source "../node_modules/lightweight-ui/dist";
```

**Use it:**

```tsx
import { Button, StatusBadge, ToastProvider } from 'lightweight-ui'

<ToastProvider>
  <StatusBadge status="open" />
  <Button>Publish form</Button>
</ToastProvider>
```

**Icons.** The kit uses [Phosphor Icons](https://github.com/phosphor-icons/react) (MIT, by Helena Zhang and Tobias Fried) and re-exports the whole set, so your own icons match the components' without a second install:

```tsx
import { Trash, Plus } from 'lightweight-ui/icons'        // client components
import { Trash } from 'lightweight-ui/icons/ssr'          // React Server Components
```

**Dark mode.** Every colour token has a light and a dark value (written with CSS `light-dark()`), so there are no `dark:` classes to add. With nothing set, the kit follows the OS.

```tsx
import { ThemeSwitch, themeScript, useTheme, applyTheme } from 'lightweight-ui'

<html data-theme="system">       {/* light | dark | system — or on any element, to pin a region */}
  <head>
    <script dangerouslySetInnerHTML={{ __html: themeScript() }} />  {/* no flash of light on load */}
  </head>
  <body>
    <ThemeSwitch />              {/* Light · Dark · System, remembered in localStorage */}
  </body>
</html>

const [theme, setTheme, resolved] = useTheme()   // for your own control
```

Tailwind's `dark:` variant matches `.dark` and `[data-theme=dark]`, if you need one-off overrides.

### 2. Copy the components (own the source)

```bash
npx github:ayaneshu/lightweight-ui-kit add button dialog   # by file or export name, dependencies included
npx github:ayaneshu/lightweight-ui-kit add --all
npx github:ayaneshu/lightweight-ui-kit list
npx github:ayaneshu/lightweight-ui-kit init                # theme + fonts only
# --dir <path> (default src/components/lightweight-ui)   --force
```

Needs Tailwind v4 and `@phosphor-icons/react` in your project. The CLI prints the two `@import` lines to add to your global CSS.

### 3. Clone and run the playground

```bash
git clone https://github.com/ayaneshu/lightweight-ui-kit.git
cd lightweight-ui-kit
npm install
npm run dev               # playground on http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Playground with hot reload. It imports the kit's **source**, so editing `src/` updates it live. |
| `npm run build` | Builds the package into `dist/` (ESM + CJS + types, precompiled CSS, fonts, `tokens.json`). |
| `npm run build:playground` | A static playground in `playground/dist/`. It uses hash routing, so you can host it anywhere. |
| `npm run typecheck` | Typechecks the kit and the playground. |

The playground is hosted on Vercel at [lightweight-ui-kit.vercel.app](https://lightweight-ui-kit.vercel.app). `vercel.json` sets the build, so deploying is `vercel deploy --prod` from the repo root.

---

## What's inside

### Foundations

| | |
| --- | --- |
| **Colour** | Light and dark from one set of tokens: `ink`, `on-ink`, `muted`, `bg`, `card`, `raised`, `field`, `line`, `line-strong`, `line-control` (3:1 for control edges). Status: draft, open and closed, each with a `-bg` tint. Danger: `danger`, `danger-solid`, `danger-strong`, `danger-bg`, `danger-line`. Six **washes** (ink at 1.5–12%, so black on light and white on dark) for hover, selected, tracks and empty wells. Chart palettes: four option-identity hues and a five-step rating ramp. Eight avatar fills. All text pairs meet 4.5:1 in both themes. |
| **Type** | **Geist** for the UI and **Geist Pixel Square** for display. Headings over 20px use the pixel face; 20px and under use Geist. The scale is named by job: `micro 11 · caption 12 · label 13 · ui 14 · body 15 · title 17 · stat 19 · display-sm 28 · display 32 · display-lg 40 · figure 52`. |
| **Radius** | `chip 10 · xl 12 · control 14 · 2xl 16 · tile 20 · panel 22 · sheet 26 · canvas 28 · device 38`, with corner smoothing through `--lui-corner-shape`, which defaults to `superellipse(4)`. `.u-circle` turns smoothing off for true circles. |
| **Elevation** | Soft, long shadows: `hairline · pill · card · menu · modal · lift · nudge · toast · tooltip`. Most surfaces have no shadow and use a border instead. |
| **Motion** | A strong `ease-out` (`cubic-bezier(0.23,1,0.32,1)`) for everything that enters. Only `transform` and `opacity` animate, and every transition names its properties. Buttons scale to 0.97 on press (`data-static` opts a wide control out). Popovers scale from their trigger, modals from centre, never from zero; exits are shorter than entrances (120ms) and play before unmount. Once one tooltip is open the next opens instantly. Toasts rise from the bottom edge. Every tab and segmented control shares one sliding highlight; the checkbox tick draws itself in; the switch knob stretches while held. Hover states are pointer-only and small — a lift, a nudge, a glyph that grows. Reduced motion keeps the fades and drops the movement. Classes: `u-press`, `u-overlay`, `u-modal`, `u-popover`, `u-toast`, `u-icon-in`, `u-swap`, `u-stagger`, `u-rise`, `u-view`, `u-pop`, `u-flash`. |
| **Backdrops** | 24 gradients in three families — 17 linear, 5 mesh, 2 radial — plus 8 solids or any hex. Stops blend in OKLab with an eased curve, then `Backdrop` redraws the CSS on a canvas with invisible 8×8 Bayer dithering, so wide ramps have no bands. Or pick a visible texture: Bayer 2/4/8, Floyd–Steinberg, Atkinson, Jarvis–Judice–Ninke, Stucki, Burkes, Sierra, Sierra Lite or noise, with `pixelSize` and `levels`. |
| **Icons** | [Phosphor Icons](https://phosphoricons.com), re-exported from `lightweight-ui/icons`. Regular weight; bold for tiny marks. |

The tokens are available as CSS variables (`var(--color-ink)`), as Tailwind utilities, as a typed object (`import { tokens } from 'lightweight-ui'` or `'lightweight-ui/tokens'`) and as `lightweight-ui/tokens.json`.

### Components

| Group | Exports |
| --- | --- |
| Actions | `Button`, `IconButton`, `buttonClasses`, `ThemeSwitch` |
| Display | `Badge`, `StatusBadge`, `CountBadge`, `Dot`, `LetterBadge`, `IconTile`, `UpvoteChip`, `Avatar`, `AvatarStack`, `Tooltip`, `Heading`, `Text`, `Overline`, `Eyebrow`, `Divider` |
| Forms | `Field`, `FieldError`, `FieldRow`, `Input`, `Textarea`, `Select`, `SearchInput`, `InlineInput`, `InlineTextarea`, `CopyField`, `Checkbox`, `Switch`, `Toggle`, `RadioGroup`, `Slider`, `ValueBox`, `Rating`, `Swatch`, `CustomColorSwatch`, `ChoiceTile`, `DatePicker` |
| Navigation | `SegmentedControl`, `PillTabs`, `SlidingSwitch`, `FilterPills`, `IconToggleGroup`, `UnderlineNav`, `AppHeader`, `Toolbar`, `Logo`, `Breadcrumb`, `HoverHighlight`, `RailItem`, `RailGroup`, `RailAction`, `AddRow`, `PropertyPanel`, `PropertyGroup`, `ResizeHandle` |
| Menus | `Popover`, `Menu`, `MenuItem`, `MenuDivider`, `MenuLabel`, `FilterMenu` |
| Overlays | `Dialog`, `DialogHeader`, `DialogBody`, `DialogFooter`, `ConfirmDialog`, `Lightbox`, `CommandMenu` (⌘K), `Kbd` |
| Feedback | `Toast`, `ToastProvider`, `useToast`, `Callout`, `EmptyState`, `Skeleton`, `Spinner`, `Placeholder`, `SuccessMark`, `Nudge` |
| Loading | `Loader` (pixel, dots, spinner, bar), `LoaderOverlay` (for a card or panel that's refreshing), `PageLoader` (a top bar for page changes), `useLoading` (waits 150ms before showing, then stays at least 400ms, so fast loads never flash) |
| Data | `Card`, `ChartCard`, `ThumbnailCard`, `HeroFigure`, `StatTile`, `MetaItem`, `Count`, `ShareBar`, `ShareLegend`, `DistributionColumns`, `NominalBars`, `Table`/`THead`/`TBody`/`TR`/`TH`/`TD`, `ListHeader`, `ListRow` |
| Media | `Backdrop`, `HeroPanel`, `Dropzone`, `DeviceFrame`, `MediaActions`, `MediaActionButton`, `ZoomableImage`, `VoiceRecorder` |
| Compare | `OptionCard`, `SelectButton`, `ChoiceRow`, `HeaderChip` |
| Collaboration | `PresenceBar`, `PresenceTag`, `PeerDots`, `NotificationBell`, `NotificationPanel`, `NotificationItem` |
| Helpers | `cn`, `personName`, `personInitials`, `personColor`, `timeAgo`, `onColor`, `tint`, `contrast`, `optionColor`, `ratingBuckets`, `sliderBuckets`, backdrop presets (`HERO_GRADIENTS`, `HERO_SOLIDS`, `renderSpec`, `gradientPalette`), `dither`, `DITHER_ALGORITHMS`, OKLab helpers, `useTheme`, `applyTheme`, `themeScript`, `useDismiss`, `useFocusTrap`, `usePresence`, `useLayer`, `useControllable`, `useReducedMotion`, `useHotkey`, `modKey`, `commandScore` |

The playground has a page for each group with live demos, prop controls and the code for each example. Press ⌘K (Ctrl+K) anywhere in it to search pages, sections, components, hooks, tokens and all 1,512 Phosphor icons. It also has six **pattern** pages that build complete product screens from kit components: the dashboard, the voting flow, the results report, the builder, the publish and share dialogs, and sign-in.

---

## Repo layout

```
src/
  components/      the kit, one file per family
  lib/             cn, hooks, theme, person/colour helpers, backdrop presets, OKLab, dither
  tokens/          tokens as data
  styles/
    theme.css      Tailwind v4 @theme (light + dark tokens) + motion classes
    base.css       global opinions (optional)
    fonts.css      @font-face for the bundled Geist files
    index.css      build entry for the precompiled styles.css
    fonts/         Geist, Geist Pixel Square, Geist Mono (OFL)
bin/lightweight-ui.mjs   the copy-in CLI
scripts/           CSS build
playground/        Vite app: docs, live demos, patterns
```

## Notes

- **Next.js.** The component bundle starts with `'use client'`, so you can import it from server components. The tokens entry has no directive, so it's safe to use on the server. To use `next/font` instead of the bundled font files, set `--lui-font-sans` and `--lui-font-pixel` to your font variables. The Installation page in the playground has an example.
- **Corner shape.** The default is `corner-shape: superellipse(4)`. Current Chromium draws that almost square at small radii. For softer, iOS-style corners, set `:root { --lui-corner-shape: squircle; }`, or use `round` to turn smoothing off. The Radius page in the playground compares all three. Safari (so every iPhone browser) and Firefox don't support `corner-shape` yet, so there the kit shrinks its radii to their plain-rounding equivalent (`--lui-corner-fallback`, 0.15) and corners look the same as in Chrome. If you switch smoothing off with `round`, set `--lui-corner-fallback: 1` too.
- **Overriding classes.** `className` is added to a component's own classes, not merged with them, which keeps the kit free of dependencies. When your class conflicts with one the component already sets (such as `rounded-full` on a Button), use Tailwind's important modifier: `className="!rounded-full"`.
- **Accessibility.** Keyboard focus is a 2px ink ring (override with `--lui-focus-ring`); text fields show focus on the field itself instead — the edge turns ink, or a borderless field deepens its background. Components set names and descriptions on fields automatically inside `Field`, follow the APG keyboard patterns for menus, listboxes and the calendar grid, make the page behind a dialog `inert`, and close one layer per Escape. Hover-only controls are always visible on touch.
- **Browsers.** Colours use `light-dark()`, entrance animations use `@starting-style` and tints use `color-mix()`. Corner smoothing is a progressive enhancement: browsers without it show normal rounded corners.

## License

Built by [ayaneshu](https://github.com/ayaneshu). The code is MIT. The Geist fonts are © Vercel and licensed under the SIL Open Font License 1.1 (see `src/styles/fonts/OFL.txt`). Icons are [Phosphor Icons](https://github.com/phosphor-icons/react), MIT-licensed. The dither kernels follow the standard definitions as catalogued in [makew0rld/dither](https://github.com/makew0rld/dither).
