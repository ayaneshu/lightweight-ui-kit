import { useState } from 'react'
import { ChartBar, DotsThreeVertical, PencilSimple, SlidersHorizontal, Trash } from 'lightweight-ui/icons'
import { Avatar, FilterMenu, IconButton, Menu, MenuDivider, MenuItem, MenuLabel, Popover, useToast } from 'lightweight-ui'
import { Demo, PageHeader, PropsTable, Section } from '../../ui/Demo'

export default function Menus() {
  const toast = useToast()
  const [pod, setPod] = useState('all')
  const [status, setStatus] = useState('all')

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Menus & popovers"
        description="Panels that float over the page from a button. Menus and popovers share one bordered card. It grows out from the edge of its trigger and closes when you click outside it or press Escape. When panels are nested, the innermost one closes first."
      />

      <Section id="menu" title="Menu" description="A short list of actions behind the ⋮ button on a row or card. Icons sit in their own column, so labels line up. Put the destructive action last. It shows in red.">
        <Demo
          className="min-h-[260px] items-start pt-10"
          code={`<Menu trigger={<IconButton label="More actions" size="md"><DotsThreeVertical size={16} weight="bold" /></IconButton>}>
  <MenuItem icon={<SlidersHorizontal size={15} />} onSelect={edit}>Edit form</MenuItem>
  <MenuItem icon={<PencilSimple size={15} />} onSelect={rename}>Rename</MenuItem>
  <MenuItem icon={<Trash size={15} />} tone="danger" onSelect={remove}>Delete form</MenuItem>
</Menu>`}
        >
          <Menu
            trigger={
              <IconButton label="More actions" size="md">
                <DotsThreeVertical size={16} weight="bold" />
              </IconButton>
            }
          >
            <MenuItem icon={<ChartBar size={15} />} onSelect={() => toast('See results')}>
              See results
            </MenuItem>
            <MenuItem icon={<SlidersHorizontal size={15} />} onSelect={() => toast('Edit form')}>
              Edit form
            </MenuItem>
            <MenuItem icon={<PencilSimple size={15} />} onSelect={() => toast('Rename')}>
              Rename
            </MenuItem>
            <MenuItem icon={<Trash size={15} />} tone="danger" onSelect={() => toast('Form deleted', { tone: 'card' })}>
              Delete form
            </MenuItem>
          </Menu>
          <Menu
            align="start"
            trigger={
              <IconButton label="More actions on artwork" size="md" variant="glass">
                <DotsThreeVertical size={16} weight="bold" />
              </IconButton>
            }
          >
            <MenuItem icon={<PencilSimple size={15} />}>Rename</MenuItem>
            <MenuItem icon={<Trash size={15} />} tone="danger">
              Delete form
            </MenuItem>
          </Menu>
        </Demo>
      </Section>

      <Section id="filter-menu" title="FilterMenu" description="A menu that filters a list by one property, such as status. The trigger shows the current choice, not just the property name, so people can see how the list is filtered without opening the menu. The tick has its own column, so labels don't shift when it appears. Options with no matches stay selectable but look muted.">
        <Demo
          className="min-h-[340px] items-start pt-10"
          code={`<FilterMenu
  label="Pod"
  value={pod}
  onChange={setPod}
  options={[
    { value: 'all', label: 'All pods', count: 24 },
    { value: 'Growth', label: 'Growth', count: 9 },
    …
  ]}
/>`}
        >
          <FilterMenu
            label="Pod"
            value={pod}
            onChange={setPod}
            options={[
              { value: 'all', label: 'All pods', count: 24 },
              { value: 'Customer', label: 'Customer', count: 5 },
              { value: 'Growth', label: 'Growth', count: 9 },
              { value: 'Loyalty', label: 'Loyalty', count: 0 },
              { value: 'Storefront', label: 'Storefront', count: 8 },
              { value: '', label: 'No pod', count: 2 },
            ]}
          />
          <FilterMenu
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All', count: 24 },
              { value: 'open', label: 'Active', count: 16 },
              { value: 'closed', label: 'Closed', count: 8 },
            ]}
          />
        </Demo>
      </Section>

      <Section id="popover" title="Popover" description="A floating card for content that isn't a list of actions, such as an account menu or a list of notifications. To close it from inside, pass a function as children. It receives close().">
        <Demo
          className="min-h-[260px] items-start justify-end pr-16 pt-10"
          code={`<Popover
  align="end"
  className="w-56 p-1.5"
  trigger={<button aria-label="Account"><Avatar person={email} size="md" tone="neutral" /></button>}
>
  {(close) => (
    <>
      <MenuLabel>…</MenuLabel>
      <MenuDivider />
      <MenuItem onSelect={signOut}>Sign out</MenuItem>
    </>
  )}
</Popover>`}
        >
          <Popover
            align="end"
            className="w-56 p-1.5"
            trigger={
              <button type="button" aria-label="Account" className="u-circle rounded-full transition-colors hover:opacity-90">
                <Avatar person="sara.k@example.com" size="md" tone="neutral" />
              </button>
            }
          >
            <MenuLabel>
              <p className="text-ui font-medium">sara.k@example.com</p>
              <p className="mt-0.5 text-label text-muted">Team workspace</p>
            </MenuLabel>
            <MenuDivider />
            <MenuItem onSelect={() => toast('Signed out')}>Sign out</MenuItem>
          </Popover>
        </Demo>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Popover · Menu"
          rows={[
            { name: 'trigger', type: 'ReactElement', description: 'The element that opens the panel. onClick, aria-expanded and aria-haspopup are added for you.' },
            { name: 'align', type: "'start' | 'center' | 'end'", default: "'end'", description: 'Which edge of the trigger the panel lines up with and grows from.' },
            { name: 'open / onOpenChange', type: 'boolean / (open) => void', description: 'Optional. Pass both to control the open state yourself.' },
            { name: 'surface', type: "'card' | 'menu'", default: "'card'", description: "Popover only. 'card' is roomy; 'menu' is a tight list of rows. Menu always uses 'menu'." },
            { name: 'className', type: 'string', description: 'Sets the width and padding of the panel.' },
            { name: 'children', type: 'ReactNode | (close) => ReactNode', description: '' },
          ]}
        />
        <PropsTable
          title="MenuItem"
          rows={[
            { name: 'icon', type: 'ReactNode', description: 'A 15px Phosphor icon, in a fixed-width column.' },
            { name: 'tone', type: "'default' | 'danger'", default: "'default'", description: '' },
            { name: 'onSelect / href', type: '() => void / string', description: 'Choosing the item closes the menu in both cases.' },
            { name: 'trailing', type: 'ReactNode', description: 'A count or keyboard shortcut at the end of the row.' },
          ]}
        />
        <PropsTable
          title="FilterMenu"
          rows={[
            { name: 'label', type: 'string', description: 'The property you filter by, such as "Status". Shown muted in the trigger.' },
            { name: 'value / onChange', type: 'string / (v) => void', description: '' },
            { name: 'options', type: '{ value, label, count? }[]', description: '' },
            { name: 'defaultValue', type: 'string', default: "'all'", description: 'The unfiltered value. Any other value marks the trigger as active.' },
          ]}
        />
      </Section>
    </>
  )
}
