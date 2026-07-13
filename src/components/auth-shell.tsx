import { BrandLogo } from "@/components/brand-logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/35 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><BrandLogo /></div>
        <Card className="shadow-lg shadow-blue-950/5">
          <CardHeader className="text-center"><CardTitle className="text-2xl">{title}</CardTitle><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
