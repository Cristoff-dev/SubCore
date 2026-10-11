"use client";

import { useState } from "react";
import { Play, Pause, Trash2, Loader2 } from "lucide-react";
import { deleteMonitor, toggleMonitorState } from "@/app/actions/monitors";
import { MonitorStatus } from "@prisma/client";

export function MonitorActions({ id, currentStatus }: { id: string, currentStatus: MonitorStatus }) {
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    setIsPending(true);
    await toggleMonitorState(id, currentStatus);
    setIsPending(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this asset? This action is irreversible.")) return;
    setIsPending(true);
    await deleteMonitor(id);
    setIsPending(false);
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors disabled:opacity-50"
        title={currentStatus === "PAUSED" ? "Resume monitoring" : "Pause monitoring"}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : currentStatus === "PAUSED" ? (
          <Play className="h-4 w-4" />
        ) : (
          <Pause className="h-4 w-4" />
        )}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors disabled:opacity-50"
        title="Delete asset"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}