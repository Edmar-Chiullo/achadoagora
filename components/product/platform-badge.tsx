import { platformBadgeClass } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface PlatformBadgeProps {
  platform: { name: string; badgeKey?: string | null } | null;
}

function PlatformBadge({ platform }: PlatformBadgeProps) {
  if (!platform) return null;
  return <Badge className={platformBadgeClass(platform.badgeKey)}>{platform.name}</Badge>;
}

export { PlatformBadge };
