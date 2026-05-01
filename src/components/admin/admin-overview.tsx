import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import {
  collectDeviceActorIdsFromLogs,
  fetchDeviceNameMap,
  formatSystemLogActor,
} from "@/lib/services/system-log-display";
import {
  Activity,
  ArrowRight,
  Cpu,
  FileText,
  Users,
} from "lucide-react";

function formatShortDate(date: Date): string {
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr} h ago`;
  const d = Math.floor(hr / 24);
  return `${d} d ago`;
}

export async function AdminOverview() {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const staleThreshold = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const [
    deviceCount,
    activeDeviceCount,
    inactiveDeviceCount,
    measurementCount,
    measurementsLast24h,
    logCount,
    profileCount,
    adminCount,
    recentLogs,
    latestMeasurement,
    neverSeenDeviceCount,
    staleDeviceCount,
    thresholdCount,
  ] = await Promise.all([
    prisma.device.count(),
    prisma.device.count({ where: { isActive: true } }),
    prisma.device.count({ where: { isActive: false } }),
    prisma.measurement.count(),
    prisma.measurement.count({
      where: { timestamp: { gte: dayAgo } },
    }),
    prisma.systemLog.count(),
    prisma.profile.count(),
    prisma.profile.count({ where: { role: "ADMIN" } }),
    prisma.systemLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.measurement.findFirst({
      orderBy: { timestamp: "desc" },
      select: {
        timestamp: true,
        device: { select: { name: true } },
      },
    }),
    prisma.device.count({
      where: { lastSeenAt: null, isActive: true },
    }),
    prisma.device.count({
      where: {
        lastSeenAt: { lt: staleThreshold },
        isActive: true,
      },
    }),
    prisma.threshold.count(),
  ]);

  const deviceIdsForLogs = collectDeviceActorIdsFromLogs(recentLogs);
  const deviceNamesForLogs = await fetchDeviceNameMap(deviceIdsForLogs);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-fg">Admin overview</h1>
        <p className="mt-1 text-sm text-muted">
          Platform health and recent activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border-subtle bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-muted">Devices</p>
            <Cpu className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-fg">
            {deviceCount}
          </p>
          <p className="mt-1 text-xs text-fg-secondary">
            <span className="text-success">{activeDeviceCount} active</span>
            {inactiveDeviceCount > 0 ? (
              <>
                {" · "}
                <span className="text-muted">{inactiveDeviceCount} inactive</span>
              </>
            ) : null}
          </p>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-muted">Measurements</p>
            <Activity className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-fg">
            {measurementCount}
          </p>
          <p className="mt-1 text-xs text-fg-secondary">
            <span className="font-medium text-fg">{measurementsLast24h}</span> in
            the last 24 hours
          </p>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-muted">Team</p>
            <Users className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-fg">
            {profileCount}
          </p>
          <p className="mt-1 text-xs text-fg-secondary">
            <span className="font-medium text-fg">{adminCount}</span> admin
            {adminCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-muted">Audit log</p>
            <FileText className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-fg">
            {logCount}
          </p>
          <p className="mt-1 text-xs text-fg-secondary">
            Recorded events across users and devices
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-fg">Recent activity</h2>
            <Link
              href="/admin/logs"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-deep"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-border-subtle bg-surface">
            <table className="min-w-full divide-y divide-border-subtle">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Actor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    Resource
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {recentLogs.map((log) => {
                  const actor = formatSystemLogActor(log, deviceNamesForLogs);
                  return (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-fg-secondary">
                        <span title={formatShortDate(log.createdAt)}>
                          {formatRelativeTime(log.createdAt)}
                        </span>
                      </td>
                      <td
                        className="max-w-[12rem] truncate whitespace-nowrap px-4 py-3 text-sm text-fg-secondary"
                        title={actor.title}
                      >
                        {actor.text}
                      </td>
                      <td className="px-4 py-3 text-sm text-fg-secondary">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {log.resource ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {recentLogs.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-muted">
                No audit events yet. Actions from devices and admins will appear
                here.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div>
            <h2 className="text-lg font-semibold text-fg">Ingest status</h2>
            <div className="mt-3 space-y-3 rounded-xl border border-border-subtle bg-surface p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Latest sample
                </p>
                {latestMeasurement ? (
                  <p className="mt-1 text-sm text-fg-secondary">
                    <span className="font-medium text-fg">
                      {latestMeasurement.device.name}
                    </span>
                    <span className="text-muted"> · </span>
                    <span title={formatShortDate(latestMeasurement.timestamp)}>
                      {formatRelativeTime(latestMeasurement.timestamp)}
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted">
                    No measurements in the database yet.
                  </p>
                )}
              </div>
              <ul className="space-y-2 border-t border-border-subtle pt-3 text-sm">
                {neverSeenDeviceCount > 0 ? (
                  <li className="flex gap-2 text-warning">
                    <span className="font-medium tabular-nums">
                      {neverSeenDeviceCount}
                    </span>
                    <span>
                      active device
                      {neverSeenDeviceCount === 1 ? "" : "s"} never reported a
                      heartbeat (last seen empty).
                    </span>
                  </li>
                ) : null}
                {staleDeviceCount > 0 ? (
                  <li className="flex gap-2 text-warning">
                    <span className="font-medium tabular-nums">
                      {staleDeviceCount}
                    </span>
                    <span>
                      active device
                      {staleDeviceCount === 1 ? "" : "s"} silent for over 48
                      hours.
                    </span>
                  </li>
                ) : null}
                {neverSeenDeviceCount === 0 && staleDeviceCount === 0 ? (
                  <li className="text-fg-secondary">
                    No connectivity warnings for active devices.
                  </li>
                ) : null}
                <li className="text-fg-secondary">
                  <span className="font-medium text-fg tabular-nums">
                    {thresholdCount}
                  </span>{" "}
                  threshold
                  {thresholdCount === 1 ? "" : "s"} configured —{" "}
                  <Link
                    href="/admin/settings"
                    className="font-medium text-accent hover:text-accent-deep"
                  >
                    review limits
                  </Link>
                  .
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
