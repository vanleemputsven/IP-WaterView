export default function DosingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">Dosing</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Log and review chemical dosing for your pool. Full workflows will live
          here soon.
        </p>
      </div>
      <section className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-6 shadow-card">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-bright/25 to-transparent"
          aria-hidden
        />
        <p className="relative text-sm text-muted">
          No dosing records yet. Once dosing is enabled for your account, you
          will see history and schedules in this area.
        </p>
      </section>
    </div>
  );
}
