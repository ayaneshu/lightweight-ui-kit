import { cn } from '../lib/cn'

/**
 * A plain data table: hairline rows, muted 13px headers, content set in the UI
 * face. Wrap it in `overflow-x-auto` when columns can outgrow a phone.
 */
export function Table({ className, ...rest }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full border-collapse text-start', className)} {...rest} />
}

export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />
}

export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />
}

export function TR({ className, ...rest }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-line last:border-b-0', className)} {...rest} />
}

/** `end` aligns a column of numbers to the trailing edge — right, or left in RTL. */
type CellAlign = 'start' | 'end'

export function TH({ className, align = 'start', ...rest }: Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'align'> & { align?: CellAlign }) {
  return <th className={cn('pb-2 pe-3 text-start text-label font-medium text-muted', align === 'end' && 'text-end', className)} {...rest} />
}

export function TD({ className, align = 'start', ...rest }: Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'> & { align?: CellAlign }) {
  return <td className={cn('py-2.5 pe-3 align-top text-ui', align === 'end' && 'text-end tabular-nums', className)} {...rest} />
}

/**
 * The heading row of a grid-based list (rows that aren't a <table>): 11px
 * uppercase, widely tracked. Give it the same grid template as the rows.
 */
export function ListHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('grid items-center gap-4 px-3 pb-2 text-micro font-semibold uppercase tracking-[0.06em] text-muted', className)}>
      {children}
    </div>
  )
}

/**
 * A grid row in such a list, with a hover wash. It pads 12px each side for the
 * wash; add `-mx-3` to it and its ListHeader to bleed that padding so the text
 * lines up with the content above.
 */
export function ListRow({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('group relative grid items-center gap-4 rounded-2xl px-3 py-3.5 transition-colors hover:bg-ink/[0.025]', className)} {...rest}>
      {children}
    </div>
  )
}
