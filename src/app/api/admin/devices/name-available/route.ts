import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";

const DUPLICATE_MESSAGE =
  "You already have a device with this name. Each device needs a unique name on your account.";

const querySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
});

/** Checks whether the signed-in admin can register another device with this exact display name. */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByUserId(user.id);
  if (!profile || !canAccessAdmin(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    name: url.searchParams.get("name") ?? "",
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid name";
    return NextResponse.json({ available: false, error: msg }, { status: 400 });
  }

  const name = parsed.data.name;

  const taken = await prisma.device.findFirst({
    where: { profileId: profile.id, name },
    select: { id: true },
  });

  if (taken) {
    return NextResponse.json({
      available: false,
      error: DUPLICATE_MESSAGE,
    });
  }

  return NextResponse.json({ available: true });
}
