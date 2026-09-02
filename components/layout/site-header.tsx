import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
        <Link href="/" className="text-lg font-semibold text-foreground">
          {APP_NAME}
        </Link>
      </div>
    </header>
  );
}
