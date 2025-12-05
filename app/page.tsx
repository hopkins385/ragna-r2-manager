import { AlertContainer } from "@/components/AlertContainer";
import R2Bucket from "@/components/R2Bucket";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            R2 Object Manager
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage objects from your R2 buckets
          </p>
        </div>
        <AlertContainer />
        <R2Bucket />
      </div>
    </main>
  );
}
