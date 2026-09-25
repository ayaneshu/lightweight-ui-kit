import { useState } from 'react'
import { DeviceMobile, DeviceTablet, ListBullets, Monitor, SquaresFour } from 'lightweight-ui/icons'
import { FilterPills, IconToggleGroup, PillTabs, SegmentedControl, SlidingSwitch, UnderlineNav } from 'lightweight-ui'
import { Demo, PageHeader, PropsTable, Section } from '../../ui/Demo'

export default function SegmentedPage() {
  const [seg, setSeg] = useState<'5' | '10' | '20'>('10')
  const [tab, setTab] = useState<'edit' | 'preview' | 'results'>('edit')
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [text, setText] = useState<'day' | 'week' | 'month'>('week')
  const [filter, setFilter] = useState<'all' | 'draft' | 'open' | 'closed'>('all')
  const [view, setView] = useState<'list' | 'card'>('card')
  const [nav, setNav] = useState<'mine' | 'team'>('mine')

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Tabs & segmented"
        description="Six controls for switching between a few options, each for a different job. They share one motion: a single highlight slides to the option you pick, instead of each option fading in its own background. The slide uses a CSS transform and takes 240ms with a strong ease-out. With reduced motion on, it jumps straight into place. If two controls share a bar, give them the same height (h-7 inside a p-1 track) so the bar lines up."
      />

      <Section id="pill-tabs" title="PillTabs" description="Use for switching between views of the same thing, like Editor, Preview and Results. The selected tab is a raised card that slides along a tinted track. Give each item an href to make it a real link, so every view has its own URL and the Back button works.">
        <Demo
          code={`<PillTabs
  label="Form views"
  value={tab}
  onChange={setTab}
  items={[
    { value: 'edit', label: 'Editor', href: '/forms/42/edit' },
    { value: 'preview', label: 'Preview', href: '/forms/42/preview' },
    { value: 'results', label: 'Results', href: '/forms/42/results' },
  ]}
/>`}
        >
          <PillTabs
            label="Form views"
            value={tab}
            onChange={setTab}
            items={[
              { value: 'edit', label: 'Editor' },
              { value: 'preview', label: 'Preview' },
              { value: 'results', label: 'Results' },
            ]}
          />
        </Demo>
      </Section>

      <Section id="sliding" title="SlidingSwitch" description="Segments of equal width with the same sliding highlight. Use iconOnly for a row of icons, with each name shown on hover. The theme switch in the sidebar works this way.">
        <Demo
          code={`<SlidingSwitch iconOnly label="Preview device" value={device} onChange={setDevice} items={[
  { value: 'desktop', label: 'Desktop', icon: <Monitor size={16} /> },
  { value: 'tablet', label: 'Tablet', icon: <DeviceTablet size={16} /> },
  { value: 'mobile', label: 'Mobile', icon: <DeviceMobile size={16} /> },
]} />`}
          className="gap-6"
        >
          <SlidingSwitch
            iconOnly
            label="Preview device"
            value={device}
            onChange={setDevice}
            items={[
              { value: 'desktop', label: 'Desktop', icon: <Monitor size={16} /> },
              { value: 'tablet', label: 'Tablet', icon: <DeviceTablet size={16} /> },
              { value: 'mobile', label: 'Mobile', icon: <DeviceMobile size={16} /> },
            ]}
          />
          <SlidingSwitch
            label="Range"
            value={text}
            onChange={setText}
            items={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
          />
        </Demo>
      </Section>

      <Section id="segmented" title="SegmentedControl" description="Use for a setting with a few options, where only one can be on and all should stay visible. The selected option fills with ink. A light copy of the labels sits on top, trimmed to the highlight, so as it slides the text turns light exactly where the highlight covers it.">
        <Demo code={`<SegmentedControl value={n} onChange={setN} items={[{ value: '5', label: '5 min' }, …]} />`}>
          <SegmentedControl
            label="Estimated time"
            value={seg}
            onChange={setSeg}
            items={[
              { value: '5', label: '5 min' },
              { value: '10', label: '10 min' },
              { value: '20', label: '20 min' },
            ]}
          />
        </Demo>
      </Section>

      <Section id="filters" title="FilterPills & IconToggleGroup" description="Use FilterPills to filter a list by one property, such as status, when every option is worth showing with its count. IconToggleGroup uses the same track with icons only, here to switch between list and card views.">
        <Demo
          code={`<FilterPills value={status} onChange={setStatus} items={[
  { value: 'all', label: 'All', count: 12 },
  { value: 'draft', label: 'Draft', count: 3 },
  …
]} />
<IconToggleGroup value={view} onChange={setView} items={[
  { value: 'list', label: 'List view', icon: <ListBullets size={15} /> },
  { value: 'card', label: 'Card view', icon: <SquaresFour size={15} /> },
]} />`}
          className="justify-between gap-3"
        >
          <FilterPills
            label="Status"
            value={filter}
            onChange={setFilter}
            items={[
              { value: 'all', label: 'All', count: 12 },
              { value: 'draft', label: 'Draft', count: 3 },
              { value: 'open', label: 'Active', count: 7 },
              { value: 'closed', label: 'Closed', count: 2 },
            ]}
          />
          <IconToggleGroup
            label="View"
            value={view}
            onChange={setView}
            items={[
              { value: 'list', label: 'List view', icon: <ListBullets size={15} /> },
              { value: 'card', label: 'Card view', icon: <SquaresFour size={15} /> },
            ]}
          />
        </Demo>
      </Section>

      <Section id="underline" title="UnderlineNav" description="Use for the main sections of an app, in its header. It fills the header's height, so the underline sits right on the header's bottom border and slides along it to the selected tab.">
        <Demo stage="none" code={`<UnderlineNav label="Dashboard views" value={view} onChange={setView} items={[{ value: 'mine', label: 'My forms' }, { value: 'team', label: 'Team' }]} />`}>
          <div className="flex h-14 items-center gap-7 border-b border-line px-6">
            <span className="text-body font-semibold">Acme</span>
            <UnderlineNav
              label="Dashboard views"
              value={nav}
              onChange={setNav}
              items={[
                { value: 'mine', label: 'My forms' },
                { value: 'team', label: 'Team' },
              ]}
            />
          </div>
          <div className="h-16" />
        </Demo>
      </Section>

      <Section id="api" title="API" description="All six take the same items and props.">
        <PropsTable
          rows={[
            { name: 'items', type: '{ value, label, icon?, count?, href?, disabled? }[]', description: 'The options. An item with href renders as an <a>. A plain click still calls onChange, so your app can handle the routing.' },
            { name: 'value / onChange', type: 'T / (v: T) => void', description: 'Controlled. Typed to the values in your items.' },
            { name: 'label', type: 'string', description: 'Names the group for screen readers.' },
            { name: 'SlidingSwitch.iconOnly', type: 'boolean', description: 'Makes each segment 40px wide and shows its label on hover.' },
          ]}
        />
      </Section>
    </>
  )
}
