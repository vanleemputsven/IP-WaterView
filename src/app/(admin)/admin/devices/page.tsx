import { prisma } from "@/lib/db/prisma";
import { formatDateTimeForDisplay } from "@/lib/format/datetime";
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

      <div className="rounded-xl border border-border-subtle bg-surface p-6">
        <h2 className="text-sm font-medium text-fg">Create device</h2>
        <p className="mt-1 text-sm text-muted">
          Register a device and receive an API key. Demo chart data is optional — use it only to try
          the dashboard without real hardware.
        </p>
        <div className="mt-4">
          <CreateDeviceForm />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
        <table className="min-w-full divide-y divide-border-subtle">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Owner
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Last seen
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Enabled
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {devices.map((d) => (
              <tr key={d.id}>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-fg">
                  {d.name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-fg-secondary">
                  {d.profile.email}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-fg-secondary">
                  {formatDateTimeForDisplay(d.createdAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-fg-secondary">
                  {formatDateTimeForDisplay(d.lastSeenAt)}
                </td>
                <td className="px-4 py-3 align-middle">
                  <DeviceActiveToggle deviceId={d.id} isActive={d.isActive} />
                </td>
                <td className="px-4 py-3 text-right align-middle">
                  <div className="inline-flex flex-wrap items-center justify-end gap-2 whitespace-normal">
                    <RenameDeviceButton deviceId={d.id} deviceName={d.name} />
                    <DeviceApiKeyButton deviceId={d.id} deviceName={d.name} />
                    <DeleteDeviceButton deviceId={d.id} deviceName={d.name} />
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
