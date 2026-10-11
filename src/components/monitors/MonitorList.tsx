import { getMonitors } from "@/app/actions/monitors";
import { Card, Table, TableRow, TableCell, TableHead, TableHeaderCell, TableBody, SparkAreaChart } from "@tremor/react";
import { MonitorActions } from "./MonitorActions";

export async function MonitorList() {
  const { success, data: monitors, error } = await getMonitors();

  if (!success) {
    return (
      <Card className="mt-8 bg-white dark:bg-[#111111] ring-1 ring-gray-200 dark:ring-white/10">
        <p className="text-rose-500 dark:text-rose-400 font-medium">
          Error loading infrastructure data: {error}
        </p>
      </Card>
    );
  }

  if (!monitors || monitors.length === 0) {
    return (
      <Card className="mt-8 flex flex-col items-center justify-center py-16 border-dashed bg-white dark:bg-[#111111] ring-1 ring-gray-200 dark:ring-white/10">
        <p className="text-gray-700 dark:text-gray-300 font-semibold text-base">
          No remote assets provisioned yet.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Deploy your first monitor to start collecting telemetry.
        </p>
      </Card>
    );
  }

  return (
    <Card className="mt-8 bg-white dark:bg-[#111111] ring-1 ring-gray-200 dark:ring-white/10 transition-colors">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-4">
        Infrastructure Assets
      </h3>

      <Table>
        <TableHead>
          <TableRow className="border-b border-gray-200 dark:border-white/10">
            <TableHeaderCell className="text-gray-900 dark:text-gray-200 font-semibold">
              Asset Name
            </TableHeaderCell>
            <TableHeaderCell className="text-gray-900 dark:text-gray-200 font-semibold">
              Target Endpoint
            </TableHeaderCell>
            <TableHeaderCell className="text-gray-900 dark:text-gray-200 font-semibold">
              Status
            </TableHeaderCell>
            <TableHeaderCell className="text-gray-900 dark:text-gray-200 font-semibold">
              Latency History
            </TableHeaderCell>
            <TableHeaderCell className="text-gray-900 dark:text-gray-200 font-semibold">
              Last Check
            </TableHeaderCell>
            <TableHeaderCell className="text-right text-gray-900 dark:text-gray-200 font-semibold">
              Actions
            </TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {monitors.map((monitor: any) => {
            const isUp = monitor.status === "UP";
            const isPaused = monitor.status === "PAUSED";
            
            const chartData = monitor.heartbeats
              .map((h: any) => ({
                time: new Date(h.timestamp).toLocaleTimeString(),
                Latency: h.responseTime
              }))
              .reverse();

            return (
              <TableRow key={monitor.id} className="border-b border-gray-100 dark:border-white/5">
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  {monitor.name}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                    {monitor.type}
                  </div>
                </TableCell>

                <TableCell className="text-gray-600 dark:text-gray-300 font-mono text-xs">
                  {monitor.target}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    {!isPaused && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      </span>
                    )}
                    {isPaused && (
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-400 dark:bg-gray-600"></span>
                    )}
                    <span className="text-sm font-medium capitalize text-gray-800 dark:text-gray-200">
                      {monitor.status.toLowerCase()}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  {chartData.length > 1 ? (
                    <div className="w-32 h-10">
                      <SparkAreaChart
                        data={chartData}
                        categories={["Latency"]}
                        index="time"
                        colors={isUp ? ["emerald"] : ["rose"]}
                        className="h-full w-full"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Awaiting data...
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-gray-600 dark:text-gray-300 text-sm">
                  {monitor.lastCheckedAt 
                    ? new Date(monitor.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
                    : "Pending telemetry..."}
                </TableCell>

                <TableCell className="text-right">
                  <MonitorActions id={monitor.id} currentStatus={monitor.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}