"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const linkClass = (href: string) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-foreground text-background"
        : "text-foreground/75 hover:text-foreground hover:bg-foreground/10"
    }`;

  return (
    <nav className="border-b border-foreground/10 bg-background/90 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Link href="/" className="text-base sm:text-lg font-bold mr-1 sm:mr-3 truncate">
            Almost Crackd
          </Link>
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>
          {email && (
            <>
              <Link href="/upload" className={linkClass("/upload")}>
                Upload
              </Link>
              <Link href="/protected" className={linkClass("/protected")}>
                Dashboard
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {email ? (
            <>
              <span className="text-xs opacity-60 hidden md:inline max-w-[220px] truncate">{email}</span>
              <button
                onClick={async () => {
                  const supabase = createSupabaseBrowserClient();
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="text-sm px-3 py-1.5 border border-foreground/20 rounded-md hover:bg-foreground/10 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm px-3 py-1.5 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
