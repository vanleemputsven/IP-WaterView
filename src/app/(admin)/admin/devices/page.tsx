import Link from "next/link";
import { FlaskConical, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDateTimeForDisplay } from "@/lib/format/datetime";
import {
  deviceToolbarGroupClass,
  deviceToolbarLinkClass,
} from "@/lib/dashboard/device-toolbar-styles";
import { CreateDeviceForm } from "@/components/admin/create-device-form";
import { DeleteDeviceButton } from "@/components/admin/delete-device-button";
import { DeviceActiveToggle } from "@/components/admin/device-active-toggle";
import { DeviceApiKeyButton } from "@/components/admin/device-api-key-button";
import { RenameDeviceButton } from "@/components/admin/rename-device-button";

export const dynamic = "force-dynamic";

export default async function AdminDevicesPage() {
  const devices = await prisma.device.findMany({
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-fg">Devices</h1>
        <p className="mt-1 text-sm text-muted">
          Registered IoT devices and API keys
        </p>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-5 sm:p-6">
        <h2 className="text-sm font-medium text-fg">Create device</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Register a device and receive an API key.
        </p>
        <div className="mt-4 grid gap-5 lg:grid-cols-2 lg:gap-x-10 lg:items-start">
          <CreateDeviceForm />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
        <table className="min-w-full divide-y divide-border-subtle">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-muted">
                Name
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-muted">
                Owner
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-muted">
                Created
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-muted">
                Last seen
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-muted">
                Enabled
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium uppercase text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {devices.map((d) => (
              <tr key={d.id}>
                <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-fg">
                  {d.name}
                </td>
                <td
                  className="max-w-[9rem] truncate px-3 py-3 text-sm text-fg-secondary sm:max-w-[11rem] lg:max-w-[14rem] xl:max-w-[18rem]"
                  title={d.profile.email}
                >
                  {d.profile.email}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-fg-secondary">
                  {formatDateTimeForDisplay(d.createdAt)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-fg-secondary">
                  {formatDateTimeForDisplay(d.lastSeenAt)}
                </td>
                <td className="px-3 py-3 align-middle">
                  <DeviceActiveToggle deviceId={d.id} isActive={d.isActive} />
                </td>
                <td className="px-3 py-3 text-right align-middle">
                  <div className="flex justify-end">
                    <div
                      role="group"
                      aria-label={`Actions for ${d.name}`}
                      className={deviceToolbarGroupClass}
                    >
                      <Link
                        href={`/admin/devices/${encodeURIComponent(d.id)}/thresholds`}
                        className={deviceToolbarLinkClass}
                        title="Sensor limits"
                        aria-label={`Sensor limits for ${d.name}`}
                      >
                        <SlidersHorizontal
                          className="h-3.5 w-3.5 shrink-0 opacity-90 xl:h-4 xl:w-4"
                          aria-hidden
                        />
                        <span className="xl:hidden" aria-hidden>
                          Limits
                        </span>
                      </Link>
                      <Link
                        href={`/admin/devices/${encodeURIComponent(d.id)}/pool-settings`}
                        className={deviceToolbarLinkClass}
                        title="Pool volume & products"
                        aria-label={`Pool dosing settings for ${d.name}`}
                      >
                        <FlaskConical
                          className="h-3.5 w-3.5 shrink-0 opacity-90 xl:h-4 xl:w-4"
                          aria-hidden
                        />
                        <span className="xl:hidden" aria-hidden>
                          Pool
                        </span>
                      </Link>
                      <RenameDeviceButton
                        toolbarSegment
                        deviceId={d.id}
                        deviceName={d.name}
                      />
                      <DeviceApiKeyButton
                        toolbarSegment
                        deviceId={d.id}
                        deviceName={d.name}
                      />
                      <DeleteDeviceButton
                        toolbarSegment
                        deviceId={d.id}
                        deviceName={d.name}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {devices.length === 0 && (
          <div className="px-4 py-8 text-center text-muted">
            No devices registered. Run the seed script to add demo data.
          </div>
        )}
      </div>
    </div>
  );
}
