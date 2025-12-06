import R2Bucket from "@/components/R2Bucket";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            R2 Bucket Manager
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage objects from your R2 buckets
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <R2Bucket />
        </Suspense>
      </div>
    </main>
  );
}
