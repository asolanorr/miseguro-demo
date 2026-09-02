import { cn } from "@/lib/utils";

// Mapeo estático a propósito: Tailwind necesita ver la clase completa en el
// código fuente para generarla. Un template literal como `bg-${colorToken}`
// no se detecta en build y queda sin estilo.
const INSURER_COLOR_CLASSES: Record<string, string> = {
  "insurer-1": "bg-insurer-1 text-insurer-1-foreground",
  "insurer-2": "bg-insurer-2 text-insurer-2-foreground",
  "insurer-3": "bg-insurer-3 text-insurer-3-foreground",
  "insurer-4": "bg-insurer-4 text-insurer-4-foreground",
  "insurer-5": "bg-insurer-5 text-insurer-5-foreground",
  "insurer-6": "bg-insurer-6 text-insurer-6-foreground",
};

type InsurerAvatarProps = {
  name: string;
  colorToken: string;
  className?: string;
};

export function InsurerAvatar({ name, colorToken, className }: InsurerAvatarProps) {
  const colorClasses = INSURER_COLOR_CLASSES[colorToken] ?? "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        colorClasses,
        className,
      )}
      aria-hidden
    >
      {name.charAt(0)}
    </span>
  );
}
