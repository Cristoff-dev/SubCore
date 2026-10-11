"use server";

import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MonitorType, MonitorStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function getAuthenticatedSession() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized access.");
  return user;
}

export async function createMonitor(formData: FormData) {
  try {
    const user = await getAuthenticatedSession();
    
    const name = formData.get("name") as string;
    const target = formData.get("target") as string;
    const type = formData.get("type") as MonitorType;
    const interval = parseInt(formData.get("interval") as string, 10);

    if (!name || !target || !type) {
      throw new Error("Missing required payload fields.");
    }

    // TODO: Implement subscription tier quota validation here (e.g., Hobby tier limit = 5)

    const monitor = await prisma.monitor.create({
      data: {
        name,
        target,
        type,
        interval: isNaN(interval) ? 5 : interval,
        status: MonitorStatus.UP,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: monitor };
  } catch (error: any) {
    console.error("[MONITOR_CREATION_FAULT]", error);
    return { success: false, error: error.message || "Failed to provision monitor." };
  }
}

export async function getMonitors() {
  try {
    const user = await getAuthenticatedSession();

    const monitors = await prisma.monitor.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        heartbeats: {
          orderBy: { timestamp: "desc" },
          take: 30,
        }
      }
    });

    return { success: true, data: monitors };
  } catch (error: any) {
    console.error("[MONITOR_FETCH_FAULT]", error);
    return { success: false, error: "Failed to retrieve infrastructure assets." };
  }
}

export async function deleteMonitor(monitorId: string) {
  try {
    const user = await getAuthenticatedSession();

    // IDOR Prevention: Compound unique constraint enforcing user ownership
    await prisma.monitor.delete({
      where: { 
        id: monitorId,
        userId: user.id 
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("[MONITOR_DELETION_FAULT]", error);
    return { success: false, error: "Failed to decommission monitor." };
  }
}

export async function toggleMonitorState(monitorId: string, currentStatus: MonitorStatus) {
  try {
    const user = await getAuthenticatedSession();
    const targetState = currentStatus === MonitorStatus.PAUSED ? MonitorStatus.UP : MonitorStatus.PAUSED;

    const monitor = await prisma.monitor.update({
      where: { 
        id: monitorId,
        userId: user.id 
      },
      data: { status: targetState },
    });

    revalidatePath("/dashboard");
    return { success: true, data: monitor };
  } catch (error: any) {
    console.error("[MONITOR_STATE_MUTATION_FAULT]", error);
    return { success: false, error: "Failed to mutate monitor state." };
  }
}