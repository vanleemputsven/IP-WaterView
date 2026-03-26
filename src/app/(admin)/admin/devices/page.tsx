import { prisma } from "@/lib/db/prisma";
import { CreateDeviceForm } from "@/components/admin/create-device-form";

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
          Create a new device and get an API key. Optionally seed with demo measurements.
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
                Last seen
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                Status
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
                  {d.lastSeenAt?.toISOString() ?? "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.isActive ? "bg-success/20 text-success" : "bg-muted/20 text-muted"
                    }`}
                  >
                    {d.isActive ? "Active" : "Inactive"}
                  </span>
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
