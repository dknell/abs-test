import { Button } from "@repo/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center font-sans">
      <h1 className="text-4xl font-bold tracking-tight">abs-test</h1>
      <p className="max-w-md text-sm text-gray-500">
        Scaffolding is ready. Start building in{" "}
        <code className="font-mono">apps/web/app/page.tsx</code>.
      </p>
      <Button
        appName="web"
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
      >
        Get started
      </Button>
    </main>
  );
}
