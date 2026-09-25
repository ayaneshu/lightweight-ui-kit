import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import {
  AppWindow,
  BoundingBox,
  CalendarBlank,
  Cards,
  ChartBar,
  ChartLine,
  ChatCircleDots,
  ChatTeardropText,
  CheckCircle,
  CheckSquare,
  Columns,
  CursorClick,
  DownloadSimple,
  Gradient,
  House,
  Image,
  ListDashes,
  Palette,
  PaperPlaneTilt,
  PencilRuler,
  Shapes,
  SidebarSimple,
  SignIn,
  SpinnerGap,
  SquaresFour,
  Swatches,
  Table,
  Tabs,
  Tag,
  Textbox,
  TextAa,
  UserCircle,
  UsersThree,
  Wind,
  type Icon,
} from 'lightweight-ui/icons'

export type Group = 'Get started' | 'Foundations' | 'Components' | 'Patterns'

export interface PageDef {
  slug: string
  title: string
  group: Group
  /** One line for the overview grid and search. */
  blurb: string
  /** Exported names and synonyms the search should match. */
  keywords: string[]
  Component: LazyExoticComponent<ComponentType>
  /** Source path, for the search index. */
  file: string
  /** The page's glyph in the sidebar and search. */
  icon: Icon
  /** A sub-heading inside a long group (Components). */
  section?: string
}

/** Every page module, loaded on first visit. Keyed by path so search can read the same files. */
const modules = import.meta.glob<{ default: ComponentType }>('./pages/**/*.tsx')

const page = (
  slug: string,
  title: string,
  group: Group,
  blurb: string,
  keywords: string[],
  file: string,
  icon: Icon,
  section?: string,
): PageDef => ({ slug, title, group, blurb, keywords, file, Component: lazy(modules[file]), icon, section })

export const PAGES: PageDef[] = [
  page('overview', 'Overview', 'Get started', 'A quick look at everything in the kit.', ['home', 'intro'], './pages/Overview.tsx', House),
  page('installation', 'Installation', 'Get started', 'Install the kit with one command, or copy components into your project.', ['install', 'npm', 'cli', 'setup', 'tailwind', 'next'], './pages/Install.tsx', DownloadSimple),
  page('colour', 'Colour', 'Foundations', 'Light and dark colour tokens, washes, and palettes for status and charts.', ['color', 'palette', 'tokens', 'wash', 'status', 'chart', 'avatar', 'dark mode', 'theme'], './pages/foundations/Colour.tsx', Palette),
  page('typography', 'Typography', 'Foundations', 'Geist for interface text, Geist Pixel for display, and when to use each.', ['type', 'font', 'geist', 'pixel', 'heading', 'text', 'overline'], './pages/foundations/Typography.tsx', TextAa),
  page('shape', 'Radius & elevation', 'Foundations', 'Corner radii, corner smoothing and soft shadows.', ['radius', 'shadow', 'elevation', 'corner', 'squircle', 'spacing'], './pages/foundations/Shape.tsx', BoundingBox),
  page('motion', 'Motion', 'Foundations', 'Easing curves, press feedback and entrance animations.', ['animation', 'easing', 'transition', 'u-rise', 'u-pop', 'stagger'], './pages/foundations/Motion.tsx', Wind),
  page('backdrops', 'Backdrops', 'Foundations', '24 gradients in three families, plus solid colours and dithering.', ['hero', 'gradient', 'dither', 'mesh', 'Backdrop', 'HeroPanel'], './pages/foundations/Backdrops.tsx', Gradient),
  page('icons', 'Iconography', 'Foundations', 'Every Phosphor icon. Search, filter by category and pick a weight.', ['icon', 'icons', 'phosphor', 'glyph', 'svg'], './pages/foundations/Icons.tsx', Shapes),
  page('buttons', 'Buttons', 'Components', 'Primary, secondary, soft, ghost and danger buttons, plus icon buttons.', ['Button', 'IconButton', 'buttonClasses', 'cta', 'action'], './pages/components/Buttons.tsx', CursorClick, 'Actions & display'),
  page('badges', 'Badges & tags', 'Components', 'Status badges, tags, counts, dots and letter tiles.', ['Badge', 'StatusBadge', 'CountBadge', 'Dot', 'LetterBadge', 'IconTile', 'UpvoteChip', 'pill', 'chip'], './pages/components/Badges.tsx', Tag, 'Actions & display'),
  page('avatars', 'Avatars', 'Components', 'Initials with a fixed colour per person, and overlapping stacks.', ['Avatar', 'AvatarStack', 'person', 'initials'], './pages/components/Avatars.tsx', UserCircle, 'Actions & display'),
  page('tooltip', 'Tooltip', 'Components', 'A small dark label that always stays on screen.', ['Tooltip', 'hint', 'hover'], './pages/components/TooltipPage.tsx', ChatTeardropText, 'Actions & display'),
  page('inputs', 'Inputs', 'Components', 'Text fields, selects, search, inline editors and a copy field.', ['Input', 'Textarea', 'Select', 'SearchInput', 'InlineInput', 'InlineTextarea', 'CopyField', 'Field', 'FieldError', 'form'], './pages/components/Inputs.tsx', Textbox, 'Forms'),
  page('selection', 'Selection controls', 'Components', 'Checkboxes, switches, toggle rows, radio groups, sliders and ratings.', ['Checkbox', 'Switch', 'Toggle', 'RadioGroup', 'Slider', 'Rating', 'ValueBox', 'stars'], './pages/components/Selection.tsx', CheckSquare, 'Forms'),
  page('swatches', 'Swatches & tiles', 'Components', 'Colour swatches, a custom colour picker and choice tiles.', ['Swatch', 'CustomColorSwatch', 'ChoiceTile', 'picker'], './pages/components/Swatches.tsx', Swatches, 'Forms'),
  page('date-picker', 'Date picker', 'Components', 'A calendar that matches the rest of the kit.', ['DatePicker', 'calendar', 'date'], './pages/components/DatePickerPage.tsx', CalendarBlank, 'Forms'),
  page('segmented', 'Tabs & segmented', 'Components', 'Six ways to switch between a few options, all with the same sliding motion.', ['SegmentedControl', 'PillTabs', 'SlidingSwitch', 'FilterPills', 'IconToggleGroup', 'UnderlineNav', 'tabs'], './pages/components/Segmented.tsx', Tabs, 'Navigation'),
  page('menus', 'Menus & popovers', 'Components', 'Action menus, filter menus and popover cards.', ['Menu', 'MenuItem', 'Popover', 'FilterMenu', 'dropdown'], './pages/components/Menus.tsx', ListDashes, 'Navigation'),
  page('navigation', 'Headers & rails', 'Components', 'App header, toolbar, breadcrumb, sidebar rail and properties panel.', ['AppHeader', 'Toolbar', 'Logo', 'Breadcrumb', 'RailItem', 'RailGroup', 'HoverHighlight', 'PropertyPanel', 'PropertyGroup', 'ResizeHandle', 'AddRow', 'sidebar'], './pages/components/NavigationPage.tsx', SidebarSimple, 'Navigation'),
  page('dialogs', 'Dialogs', 'Components', 'Modal dialogs, confirmations, the lightbox and the ⌘K menu.', ['Dialog', 'DialogHeader', 'DialogBody', 'DialogFooter', 'ConfirmDialog', 'Lightbox', 'CommandMenu', 'Kbd', 'useHotkey', 'modal', 'command palette', 'search', 'cmd k'], './pages/components/Dialogs.tsx', AppWindow, 'Overlays & feedback'),
  page('feedback', 'Feedback', 'Components', 'Toasts, callouts, empty states, loading states and nudges.', ['Toast', 'useToast', 'Callout', 'EmptyState', 'Skeleton', 'Spinner', 'Nudge', 'SuccessMark', 'Placeholder'], './pages/components/FeedbackPage.tsx', ChatCircleDots, 'Overlays & feedback'),
  page('loaders', 'Loaders', 'Components', 'Show that something is loading, in a component or between pages.', ['Loader', 'LoaderOverlay', 'PageLoader', 'useLoading', 'loading', 'spinner', 'progress', 'skeleton'], './pages/components/LoadersPage.tsx', SpinnerGap, 'Overlays & feedback'),
  page('cards', 'Cards & stats', 'Components', 'Card surfaces, thumbnail cards, hero figures and stat tiles.', ['Card', 'ThumbnailCard', 'ChartCard', 'HeroFigure', 'StatTile', 'MetaItem', 'Count'], './pages/components/Cards.tsx', Cards, 'Data'),
  page('charts', 'Charts', 'Components', 'Share bars, legends and distributions, where colour has one job.', ['ShareBar', 'ShareLegend', 'DistributionColumns', 'NominalBars', 'OPTION_COLORS', 'RATING_RAMP', 'chart', 'graph'], './pages/components/ChartsPage.tsx', ChartBar, 'Data'),
  page('tables', 'Tables & lists', 'Components', 'Data tables and list rows that line up on a grid.', ['Table', 'TH', 'TD', 'ListHeader', 'ListRow', 'list'], './pages/components/Tables.tsx', Table, 'Data'),
  page('media', 'Media', 'Components', 'Hero panels, dropzones, device frames and voice notes.', ['HeroPanel', 'Dropzone', 'DeviceFrame', 'MediaActions', 'MediaActionButton', 'ZoomableImage', 'VoiceRecorder', 'image', 'upload'], './pages/components/MediaPage.tsx', Image, 'Media & people'),
  page('compare', 'Compare', 'Components', 'Option cards and the controls voters answer with.', ['OptionCard', 'SelectButton', 'ChoiceRow', 'HeaderChip', 'vote', 'ab test'], './pages/components/ComparePage.tsx', Columns, 'Media & people'),
  page('presence', 'Presence & updates', 'Components', 'Who else is here, following someone, and the notification bell.', ['PresenceBar', 'PresenceTag', 'PeerDots', 'NotificationBell', 'NotificationPanel', 'collaboration'], './pages/components/PresencePage.tsx', UsersThree, 'Media & people'),
  page('dashboard', 'Dashboard', 'Patterns', 'A workspace of forms, shown as cards or rows, with filters.', ['workspace', 'grid', 'list'], './pages/patterns/Dashboard.tsx', SquaresFour),
  page('voting', 'Voting flow', 'Patterns', 'What a voter sees, from the welcome screen to the thank-you.', ['voter', 'form', 'flow', 'survey'], './pages/patterns/Voting.tsx', CheckCircle),
  page('results', 'Results report', 'Patterns', 'A report that leads with the response count.', ['report', 'analytics'], './pages/patterns/Results.tsx', ChartLine),
  page('builder', 'Builder', 'Patterns', 'The three-column editor: screens, canvas and settings.', ['editor', 'canvas', 'properties'], './pages/patterns/Builder.tsx', PencilRuler),
  page('publish', 'Publish & share', 'Patterns', 'The dialogs for publishing a form and sharing access to it.', ['share', 'invite', 'collaborators', 'dialog'], './pages/patterns/Publish.tsx', PaperPlaneTilt),
  page('sign-in', 'Sign in', 'Patterns', 'The sign-in card, landing page, and closed and empty screens.', ['login', 'auth', 'landing'], './pages/patterns/SignIn.tsx', SignIn),
]

export const GROUPS: Group[] = ['Get started', 'Foundations', 'Components', 'Patterns']
