import { requireAuth } from "@/lib/auth-utils";
import { getFtpPublishSettingsPublic } from "@/lib/ftp-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FtpSettingsForm } from "@/components/dashboard/ftp-settings-form";

export default async function SettingsPage() {
  const session = await requireAuth();
  const ftpSettings = await getFtpPublishSettingsPublic(session.user.tenantId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Impostazioni</h1>
        <p className="text-muted-foreground">
          Configura le impostazioni del ristorante e la pubblicazione FTP
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

      <FtpSettingsForm initial={ftpSettings} />
    </div>
  );
}
