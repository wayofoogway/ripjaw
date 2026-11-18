import { checks } from "@/content/safety";
import { Reveal } from "../ui/reveal";
import { Section, SectionHeading } from "../ui/section";

/*
 * One table from `md` up; on small screens each check becomes a labelled
 * block. The ARIA roles keep table semantics when the display changes.
 * No parallax here: it is dense reference text.
 */
export function ChecksTable() {
  const { columns } = checks;

  return (
    <Section id="checks" labelledBy="checks-title" className="border-y border-rj-line bg-rj-surface/40">
      <Reveal>
        <SectionHeading id="checks-title" eyebrow={checks.eyebrow} title={checks.title} lede={checks.lede} />
      </Reveal>

      <Reveal className="mt-10 lg:mt-14">
        <table role="table" aria-labelledby="checks-title" className="block w-full text-left md:table md:table-fixed md:border-collapse">
          <thead role="rowgroup" className="hidden md:table-header-group">
            <tr role="row" className="border-b border-rj-line-strong">
              {[columns.check, columns.reads, columns.why, columns.problem].map((heading, index) => (
                <th
                  key={heading}
                  role="columnheader"
                  scope="col"
                  className={`text-eyebrow pr-6 pb-4 font-medium text-rj-caption ${index === 0 ? "w-[19%]" : "w-[27%]"}`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          {checks.groups.map((group) => (
            <tbody key={group.title} role="rowgroup" className="block md:table-row-group">
              <tr role="row" className="block md:table-row">
                <th
                  role="columnheader"
                  scope="colgroup"
                  colSpan={4}
                  className="block pt-10 pb-3 font-display text-[1.25rem] font-semibold tracking-tight text-rj-text md:table-cell md:pt-9"
                >
                  {group.title}
                </th>
              </tr>
              {group.items.map((item) => (
                <tr key={item.name} role="row" className="block border-t border-rj-line py-5 md:table-row md:py-0">
                  <th
                    role="rowheader"
                    scope="row"
                    className="block text-[1.0625rem] font-semibold text-rj-text md:table-cell md:py-5 md:pr-6 md:align-top md:text-[0.9375rem]"
                  >
                    {item.name}
                  </th>
                  {[
                    { label: columns.reads, value: item.reads },
                    { label: columns.why, value: item.why },
                    { label: columns.problem, value: item.problem },
                  ].map((cell) => (
                    <td
                      key={cell.label}
                      role="cell"
                      className="mt-3 block text-base leading-relaxed text-rj-dim md:mt-0 md:table-cell md:py-5 md:pr-6 md:align-top md:text-[0.9375rem]"
                    >
                      <span className="mb-0.5 block font-mono text-[0.6875rem] tracking-[0.1em] text-rj-caption uppercase md:hidden">
                        {cell.label}
                      </span>
                      {cell.value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </Reveal>
    </Section>
  );
}
