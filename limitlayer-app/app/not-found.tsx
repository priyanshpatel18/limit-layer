"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <header className="flex justify-center">
        <Link
          href="/"
          className="text-xl font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          Limit Layer
        </Link>
      </header>

      <main className="max-w-md w-full flex flex-col items-center text-center mt-8">
        <section className="space-y-2" aria-labelledby="not-found-title">
          <p className="text-6xl font-bold tabular-nums text-foreground" aria-hidden>
            404
          </p>
          <h1 id="not-found-title" className="text-xl font-semibold text-foreground">
            Page not found
          </h1>
          <p className="text-muted-foreground text-sm">
            The address does not exist or has been changed.
          </p>
        </section>

        <nav
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
          aria-label="Navigation"
        >
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
          <Button asChild size="lg" className="w-full sm:w-auto gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
        </nav>
      </main>
    </div>
  );
}
