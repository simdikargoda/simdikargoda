import { cn } from "@/lib/cn";

type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  eyebrow?: string;
};

/** Premium sayfa başlığı — eyebrow + başlık + aksiyonlar. */
export function PageHeader({ title, description, actions, className, eyebrow }: Props) {
  return (
    <div
      className={cn(
        "fade-in-up mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
