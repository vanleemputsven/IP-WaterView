import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/services/profile-service";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { createLog } from "@/lib/services/log-service";

const deviceIdParamSchema = z.string().cuid();

const patchBodySchema = z
  .object({
    name: z.string().min(1).max(120).trim().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((body) => body.name !== undefined || body.isActive !== undefined, {
    message: "Provide name and/or isActive",
  });

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await context.params;
  const idParse = deviceIdParamSchema.safeParse(rawId);
  if (!idParse.success) {
    return NextResponse.json({ error: "Invalid device id" }, { status: 400 });
  }
  const id = idParse.data;

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

  const json = await request.json().catch(() => null);
  const bodyParse = patchBodySchema.safeParse(json);
  if (!bodyParse.success) {
    const msg =
      bodyParse.error.issues[0]?.message ?? "Invalid body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const body = bodyParse.data;

  const existing = await prisma.device.findUnique({
    where: { id },
    select: { id: true, name: true, isActive: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  const data: { name?: string; isActive?: boolean } = {};
  if (body.name !== undefined && body.name !== existing.name) {
    data.name = body.name;
  }
  if (body.isActive !== undefined && body.isActive !== existing.isActive) {
    data.isActive = body.isActive;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({
      id: existing.id,
      name: existing.name,
      isActive: existing.isActive,
      message: "No changes",
    });
  }

  try {
    const updated = await prisma.device.update({
      where: { id },
      data,
      select: { id: true, name: true, isActive: true },
    });

    await createLog({
      actorType: "user",
      actorId: profile.id,
      action: "device.updated",
      resource: "device",
      metadata: {
        deviceId: id,
        changes: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        },
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      isActive: updated.isActive,
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "You already have a device with this name. Each device needs a unique name on your account.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update device" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await context.params;
  const idParse = deviceIdParamSchema.safeParse(rawId);
  if (!idParse.success) {
    return NextResponse.json({ error: "Invalid device id" }, { status: 400 });
  }
  const id = idParse.data;

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

  const existing = await prisma.device.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  try {
    await prisma.device.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Failed to delete device" }, { status: 500 });
  }

  await createLog({
    actorType: "user",
    actorId: profile.id,
    action: "device.deleted",
    resource: "device",
    metadata: { deviceId: id, name: existing.name },
  });

  return new NextResponse(null, { status: 204 });
}
