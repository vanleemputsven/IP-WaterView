import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PoolDosingSettingsForm } from "@/components/dashboard/pool-dosing-settings-form";
import { prisma } from "@/lib/db/prisma";
import { getDevicePoolDosingSettings } from "@/lib/services/device-pool-dosing-settings-service";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  deviceId: z.string().cuid(),
});

export default async function AdminDevicePoolSettingsPage({
  params,
}: {
  params: Promise<{ deviceId: string }>;
}) {
  const raw = await params;
  const parsed = paramsSchema.safeParse(raw);
  if (!parsed.success) {
    notFound();
  }

  const device = await prisma.device.findUnique({
    where: { id: parsed.data.deviceId },
    select: {
      id: true,
      name: true,
      isActive: true,
      profile: { select: { email: true } },
    },
  });
  if (!device) {
    notFound();
  }

  const settings = await getDevicePoolDosingSettings(device.id);
  const patchHref = `/api/admin/devices/${encodeURIComponent(device.id)}/pool-dosing`;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">
          <Link
            href="/admin/devices"
            className="font-medium text-accent hover:text-accent-deep"
          >
            Devices
          </Link>
          <span aria-hidden className="mx-1.5 text-muted">
            /
          </span>
          <span className="text-fg-secondary">{device.name}</span>
        </p>
        <h1 className="mt-2 text-2xl font-bold text-fg">Pool dosing</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Volume and chemistry for dosing estimates; acceptable bands follow this
          device&apos;s sensor limits.
        </p>
        <p className="mt-1 text-xs text-muted">
          Owner · {device.profile.email}
        </p>
        {!device.isActive ? (
          <p className="mt-2 text-xs font-medium text-warning">Device is disabled.</p>
        ) : null}
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-4 shadow-card sm:p-5">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-bright/25 to-transparent"
          aria-hidden
        />
        <h2 className="relative text-lg font-semibold tracking-tight text-fg">
          Volume &amp; products
        </h2>
        <div className="relative mt-4">
          <PoolDosingSettingsForm
            deviceId={device.id}
            initial={settings}
            patchHref={patchHref}
          />
        </div>
      </section>
    </div>
  );
}
