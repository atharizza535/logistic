import type { PackageStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: PackageStatus;
  className?: string;
}

const statusConfig: Record<PackageStatus, { label: string; className: string }> = {
  awaiting_payment: {
    label: 'Awaiting Payment',
    className: 'status-awaiting',
  },
  payment_verified: {
    label: 'Payment Verified',
    className: 'status-verified',
  },
  in_transit: {
    label: 'In Transit',
    className: 'status-transit',
  },
  delivered: {
    label: 'Delivered',
    className: 'status-delivered',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={cn('status-badge', config.className, className)}>
      <span className="relative flex h-2 w-2 mr-1.5">
        <span className={cn(
          'absolute inline-flex h-full w-full rounded-full opacity-75',
          status === 'awaiting_payment' && 'animate-ping bg-amber-400',
          status === 'in_transit' && 'animate-ping bg-blue-400',
          status === 'delivered' && 'bg-emerald-400',
          status === 'payment_verified' && 'bg-emerald-400'
        )} />
        <span className={cn(
          'relative inline-flex rounded-full h-2 w-2',
          status === 'awaiting_payment' && 'bg-amber-400',
          status === 'in_transit' && 'bg-blue-400',
          status === 'delivered' && 'bg-emerald-400',
          status === 'payment_verified' && 'bg-emerald-400'
        )} />
      </span>
      {config.label}
    </span>
  );
}
