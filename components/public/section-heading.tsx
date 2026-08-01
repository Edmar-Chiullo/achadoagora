import Link from "next/link";

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}

function SectionHeading({ title, description, action }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="text-sm font-medium text-primary hover:underline"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export { SectionHeading };
