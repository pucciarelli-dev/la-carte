"use client";

import { useState, useTransition } from "react";
import {
  getFtpSettingsAction,
  updateFtpSettingsAction,
} from "@/server/actions/settings-actions";
import type { FtpPublishSettingsPublic } from "@/lib/ftp-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FtpSettingsFormProps {
  initial: FtpPublishSettingsPublic;
}

export function FtpSettingsForm({ initial }: FtpSettingsFormProps) {
  const [host, setHost] = useState(initial.host);
  const [port, setPort] = useState(String(initial.port || 21));
  const [user, setUser] = useState(initial.user);
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(initial.secure);
  const [remoteBasePath, setRemoteBasePath] = useState(
    initial.remoteBasePath || "/bistrot.southgarage.com"
  );
  const [publicBaseUrl, setPublicBaseUrl] = useState(
    initial.publicBaseUrl || "https://bistrot.southgarage.com"
  );
  const [hasPassword, setHasPassword] = useState(initial.hasPassword);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        const result = await updateFtpSettingsAction({
          host,
          port: Number(port) || 21,
          user,
          password: password.trim() || undefined,
          secure,
          remoteBasePath,
          publicBaseUrl,
        });
        setHasPassword(result.hasPassword);
        setPassword("");
        setMessage("Impostazioni FTP salvate.");
        await getFtpSettingsAction();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossibile salvare le impostazioni FTP"
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pubblicazione FTP</CardTitle>
        <CardDescription>
          Credenziali per pubblicare i menu statici su bistrot.southgarage.com
          (o altro hosting).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ftp-host">Host</Label>
              <Input
                id="ftp-host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="ftp.southgarage.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ftp-port">Porta</Label>
              <Input
                id="ftp-port"
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="21"
              />
            </div>
            <div className="flex items-end gap-3 pb-1">
              <Switch
                id="ftp-secure"
                checked={secure}
                onCheckedChange={setSecure}
              />
              <Label htmlFor="ftp-secure">FTP esplicito su TLS</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ftp-user">Utente</Label>
              <Input
                id="ftp-user"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="3550431@aruba.it"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ftp-password">
                Password
                {hasPassword ? " (lascia vuoto per non cambiare)" : ""}
              </Label>
              <Input
                id="ftp-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={hasPassword ? "••••••••" : "Password FTP"}
                autoComplete="new-password"
                required={!hasPassword}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ftp-base-path">Cartella remota (base)</Label>
              <Input
                id="ftp-base-path"
                value={remoteBasePath}
                onChange={(e) => setRemoteBasePath(e.target.value)}
                placeholder="/bistrot.southgarage.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                Dentro questa cartella verranno create le sottocartelle del menu
                (es. menu-dinner).
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ftp-public-url">URL pubblico sito</Label>
              <Input
                id="ftp-public-url"
                value={publicBaseUrl}
                onChange={(e) => setPublicBaseUrl(e.target.value)}
                placeholder="https://bistrot.southgarage.com"
                required
              />
            </div>
          </div>

          {message && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              {message}
            </p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvataggio..." : "Salva FTP"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
