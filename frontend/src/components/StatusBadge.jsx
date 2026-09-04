import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  Bike, 
  PackageCheck, 
  XCircle, 
  Ban,
  AlertCircle
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    className: 'badge-pending',
    icon: Clock,
  },
  ACCEPTED: {
    label: 'Accepted',
    className: 'badge-accepted',
    icon: CheckCircle2,
  },
  PREPARING: {
    label: 'Preparing',
    className: 'badge-preparing',
    icon: ChefHat,
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    className: 'badge-out_for_delivery',
    icon: Bike,
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'badge-delivered',
    icon: PackageCheck,
  },
  REJECTED: {
    label: 'Rejected',
    className: 'badge-rejected',
    icon: Ban,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'badge-cancelled',
    icon: XCircle,
  },
};

const StatusBadge = ({ status, size = 13, showIcon = true }) => {
  const normStatus = (status || 'PENDING').toUpperCase();
  const config = STATUS_CONFIG[normStatus] || {
    label: status,
    className: 'badge-cancelled',
    icon: AlertCircle,
  };

  const IconComponent = config.icon;

  return (
    <span className={`status-badge ${config.className}`}>
      {showIcon && <IconComponent size={size} />}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
