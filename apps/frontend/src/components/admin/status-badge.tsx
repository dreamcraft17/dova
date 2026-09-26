import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold',
  {
    variants: {
      tone: {
        green: 'bg-[#dff5e9] text-[#08744f]',
        yellow: 'bg-[#fff2c6] text-[#876b00]',
        red: 'bg-[#fde2e0] text-[#9b3027]',
        blue: 'bg-[#e2efff] text-[#205b9b]',
        gray: 'bg-[#edf0ee] text-[#5f6b65]',
      },
    },
    defaultVariants: { tone: 'gray' },
  },
);

export function StatusBadge({
  className,
  tone,
  children,
}: { className?: string; children: React.ReactNode } & VariantProps<typeof statusBadgeVariants>) {
  return <span className={cn(statusBadgeVariants({ tone }), className)}>{children}</span>;
}
