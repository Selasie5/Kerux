import { cn } from "@/lib/utils";

export function KeruxMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} aria-label="Kerux">
      <span className="relative grid size-7 place-items-center rounded-md bg-primary text-primary-foreground shadow-[0_0_0_1px_rgb(28_27_23_/_0.12)]">
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path d="M7 5v14M17 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
      </span>
      <span className="font-heading text-sm font-semibold tracking-[-0.04em]">Kērux</span>
    </div>
  );
}
