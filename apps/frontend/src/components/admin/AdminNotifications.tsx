import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminAlerts } from '../../hooks/admin/useAdminAlerts';
import { buildAdminAlerts, formatAlertBadge, totalAdminAlerts } from '../../lib/admin-alerts';

export function AdminNotifications() {
  const { counts, loading, failed, refresh } = useAdminAlerts();
  const alerts = buildAdminAlerts(counts);
  const total = totalAdminAlerts(alerts);

  return (
    <DropdownMenu onOpenChange={(open) => open && void refresh()}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="relative"
          aria-label={total > 0 ? `Notifications, ${total} awaiting action` : 'Notifications'}
        >
          <Bell />
          {total > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white">
              {formatAlertBadge(total)}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Needs your attention</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {alerts.map((alert) => (
          <DropdownMenuItem key={alert.key} asChild>
            <Link href={alert.href} className="cursor-pointer">
              {alert.label}
            </Link>
          </DropdownMenuItem>
        ))}
        {alerts.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            {loading ? 'Checking…' : failed ? 'Could not load notifications.' : "You're all caught up."}
          </p>
        ) : null}
        {failed ? (
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              void refresh();
            }}
          >
            Try again
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
