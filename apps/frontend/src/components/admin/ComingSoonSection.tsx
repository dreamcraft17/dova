import { Card } from '@/components/ui/card';
import { StatusBadge } from './status-badge';

export function ComingSoonSection({
  eyebrow,
  title,
  lead,
  sections,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  sections: { heading: string; items: string[] }[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">{title}</h1>
        <p className="mt-2 max-w-[70ch] text-muted-foreground">{lead}</p>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <StatusBadge tone="gray">Not yet available</StatusBadge>
          <p className="text-sm text-muted-foreground">This section isn't wired to the backend yet.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="mb-2 text-sm font-bold text-primary">{section.heading}</h2>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-muted-foreground/50">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
