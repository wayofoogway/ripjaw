import { featureStatusMeta } from "@/config/site";
import type { DocsGroup } from "@/content/docs";
import { StatusBadge } from "../ui/status-badge";
import { CopyButton } from "./copy-button";

type CommandListProps = {
  group: DocsGroup;
  copyLabels: { idle: string; done: string; failed: string };
};

/** One group of bot commands: its status, then each command as text with a copy button. */
export function CommandList({ group, copyLabels }: CommandListProps) {
  return (
    <>
      <p className="flex flex-wrap gap-2">
        {group.statuses.map((status) => (
          <StatusBadge key={status} status={status} label={featureStatusMeta[status].label} size="sm" />
        ))}
      </p>
      {group.note && <p>{group.note}</p>}
      <ul className="list-none divide-y divide-rj-line border-y border-rj-line pl-0 [&>li+li]:mt-0">
        {group.commands.map((item) => (
          <li
            key={[item.command, item.args].join(" ")}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-3 sm:grid-cols-[minmax(0,14.5rem)_minmax(0,1fr)_auto] lg:py-2.5"
          >
            <p className="font-mono text-base leading-snug break-words lg:text-[0.9375rem]">
              <code className="bg-transparent p-0 text-[1em]">{item.command}</code>
              {item.args && <span className="text-rj-caption"> {item.args}</span>}
            </p>
            <p className="col-span-2 row-start-2 mt-0 text-base leading-relaxed sm:col-span-1 sm:col-start-2 sm:row-start-1 lg:text-[0.9375rem]">
              {item.description}
            </p>
            <CopyButton value={item.command} labels={copyLabels} />
          </li>
        ))}
      </ul>
    </>
  );
}
