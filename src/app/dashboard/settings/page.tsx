import { requireAuth } from "@/lib/auth-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Impostazioni</h1>
        <p className="text-muted-foreground">
          Configura le impostazioni del ristorante
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ristorante</CardTitle>
          <CardDescription>Informazioni del tenant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nome</span>
            <span>{session.user.tenantName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Slug</span>
            <span>{session.user.tenantSlug}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
