import type { Platform } from "@/app/generated/prisma/client";
import { PLATFORM_META } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface PlatformBadgeProps {
  platform: Platform;
}

function PlatformBadge({ platform }: PlatformBadgeProps) {
  const meta = PLATFORM_META[platform];
  return <Badge className={meta.badge}>{meta.label}</Badge>;
}

export { PlatformBadge };
