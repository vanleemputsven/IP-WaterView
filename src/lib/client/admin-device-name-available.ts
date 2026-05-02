/**
 * Client-side call to verify device display name is free for the current admin account.
 */
export async function fetchAdminDeviceNameAvailable(
  trimmedName: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await fetch(
    `/api/admin/devices/name-available?${new URLSearchParams({ name: trimmedName })}`,
    { method: "GET", credentials: "same-origin" },
  );

  const data = (await res.json().catch(() => ({}))) as {
    available?: boolean;
    error?: string;
  };

  if (!res.ok) {
    const msg =
      typeof data.error === "string" && data.error.length > 0
        ? data.error
        : "Could not verify device name.";
    return { ok: false, message: msg };
  }

  if (data.available !== true) {
    const msg =
      typeof data.error === "string" && data.error.length > 0
        ? data.error
        : "You already have a device with this name. Each device needs a unique name on your account.";
    return { ok: false, message: msg };
  }

  return { ok: true };
}
