import { prisma } from "@/lib/prisma";
import { Card, Table, TableRow, TableCell, TableHead, TableHeaderCell, TableBody, SparkAreaChart } from "@tremor/react";
import { Activity } from "lucide-react";
import { AutoRefresh } from "@/components/AutoRefresh";

export default async function PublicStatusPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { email: true }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-transparent p-4">
        <Card className="max-w-md text-center bg-white dark:bg-[#111111] ring-1 ring-gray-200 dark:ring-white/10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Status Page Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400">The requested infrastructure status page does not exist or has been removed.</p>
        </Card>
      </div>
    );
  }

  const monitors = await prisma.monitor.findMany({
    where: { userId: params.id },
    orderBy: { createdAt: "desc" },
    include: {
      heartbeats: {
        orderBy: { timestamp: "desc" },
        take: 30,
      }
    }
  });

  const isSystemDegraded = monitors.some(m => m.status === "DOWN");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <AutoRefresh intervalMs={5000} />
      
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#111111] p-6 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isSystemDegraded ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">System Status</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{user.email}</p>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-full text-sm font-bold border ${isSystemDegraded ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'}`}>
            {isSystemDegraded ? "System Degraded" : "All Systems Operational"}
          </div>
        </header>

        {monitors.length === 0 ? (
          <Card className="text-center py-16 border-dashed bg-white dark:bg-[#111111] ring-1 ring-gray-200 dark:ring-white/10">
            <p className="text-gray-500 dark:text-gray-400 font-medium">No services are currently being monitored.</p>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-[#111111] ring-1 ring-gray-200 dark:ring-white/10 transition-colors">
            <Table>
              <TableHead>
                <TableRow className="border-b border-gray-200 dark:border-white/10">
                  <TableHeaderCell className="text-gray-900 dark:text-gray-200 font-semibold">Service</TableHeaderCell>
                  <TableHeaderCell className="text-gray-900 dark:text-gray-200 font-semibold">Status</TableHeaderCell>
                  <TableHeaderCell className="text-gray-900 dark:text-gray-200 font-semibold">Performance (60m)</TableHeaderCell>
                  <TableHeaderCell className="text-right text-gray-900 dark:text-gray-200 font-semibold">Last Updated</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monitors.map((monitor) => {
                  const isUp = monitor.status === "UP";
                  const isPaused = monitor.status === "PAUSED";
                  
                  const chartData = monitor.heartbeats
                    .map((h) => ({
                      time: new Date(h.timestamp).toLocaleTimeString(),
                      Latency: h.responseTime
                    }))
                    .reverse();

                  return (
                    <TableRow key={monitor.id} className="border-b border-gray-100 dark:border-white/5">
                      <TableCell className="font-semibold text-gray-900 dark:text-white">{monitor.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!isPaused && (
                            <span className="relative flex h-2.5 w-2.5">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            </span>
                          )}
                          {isPaused && (
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-300 dark:bg-gray-600"></span>
                          )}
                          <span className="text-sm font-medium capitalize text-gray-800 dark:text-gray-200">
                            {monitor.status.toLowerCase()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {chartData.length > 1 ? (
                          <div className="w-40 h-12">
                            <SparkAreaChart
                              data={chartData}
                              categories={["Latency"]}
                              index="time"
                              colors={isUp ? ["emerald"] : ["rose"]}
                              className="h-full w-full"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">Collecting telemetry...</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-gray-600 dark:text-gray-300 text-sm">
                        {monitor.lastCheckedAt 
                          ? new Date(monitor.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                          : "Pending"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}