import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_for_build");

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized request", { status: 401 });
  }

  try {
    const activeMonitors = await prisma.monitor.findMany({
      where: { status: { not: "PAUSED" } },
      include: { user: true }
    });

    if (!activeMonitors.length) {
      return NextResponse.json({ success: true, processed: 0, message: "No active monitors found" });
    }

    const checkPromises = activeMonitors.map(async (monitor) => {
      const startTime = Date.now();
      let isOperational = false;
      let statusCode: number | null = null;

      try {
        if (monitor.type === "HTTP") {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(monitor.target, {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          });

          clearTimeout(timeoutId);
          
          statusCode = response.status;
          isOperational = response.ok;
        } else {
          isOperational = true;
        }
      } catch (error) {
        isOperational = false;
      }

      const responseTime = Date.now() - startTime;
      
      let newStatus = monitor.status;

      if (monitor.status === "UP" && !isOperational) {
        newStatus = "DOWN";
        console.log(`[ALERT] ${monitor.name} is down! Sending email to ${monitor.user.email}`);
        
        await resend.emails.send({
          from: "SubCore Alerts <onboarding@resend.dev>",
          to: monitor.user.email,
          subject: `🚨 URGENT: Monitor DOWN - ${monitor.name}`,
          html: `<div style="font-family: sans-serif; color: #111;">
            <h2 style="color: #e11d48;">Service Outage Detected</h2>
            <p>Your infrastructure asset <strong>${monitor.name}</strong> is currently unreachable.</p>
            <ul>
              <li><strong>Target:</strong> ${monitor.target}</li>
              <li><strong>Time:</strong> ${new Date().toUTCString()}</li>
            </ul>
            <p>Please check your server immediately.</p>
          </div>`,
        });
      } 
      else if (monitor.status === "DOWN" && isOperational) {
        newStatus = "UP";
        console.log(`[RECOVERY] ${monitor.name} is back! Sending email to ${monitor.user.email}`);
        
        await resend.emails.send({
          from: "SubCore Alerts <onboarding@resend.dev>",
          to: monitor.user.email,
          subject: `✅ RECOVERED: Monitor is back online - ${monitor.name}`,
          html: `<div style="font-family: sans-serif; color: #111;">
            <h2 style="color: #10b981;">Service Restored</h2>
            <p>Your infrastructure asset <strong>${monitor.name}</strong> is back online and responding normally.</p>
            <ul>
              <li><strong>Target:</strong> ${monitor.target}</li>
              <li><strong>Latency:</strong> ${responseTime}ms</li>
            </ul>
          </div>`,
        });
      }

      await prisma.$transaction([
        prisma.heartbeat.create({
          data: {
            monitorId: monitor.id,
            responseTime,
            statusCode,
            isOperational,
          },
        }),
        prisma.monitor.update({
          where: { id: monitor.id },
          data: { lastCheckedAt: new Date(), status: newStatus as any },
        }),
      ]);

      return { id: monitor.id, isOperational, newStatus };
    });

    const results = await Promise.allSettled(checkPromises);

    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[TELEMETRY_ENGINE_FAULT]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}