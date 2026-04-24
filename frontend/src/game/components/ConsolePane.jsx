import React, { memo } from "react";

const ConsolePane = ({ output, loading }) => {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-black border-t border-white/5 animate-pulse">
        <div className="px-4 py-2 border-b border-white/5 bg-black">
          <div className="h-3 w-24 bg-white/10 rounded-md"></div>
        </div>
        <div className="flex-1 p-4">
          <div className="h-3 w-48 bg-white/5 rounded-md"></div>
        </div>
      </div>
    );
  }
  return (
    <section className="flex-1 flex flex-col bg-black m-0 h-full">
      <div className="flex-1 p-0 overflow-y-auto font-mono text-sm relative bg-black">
        {output.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600 pointer-events-none select-none">
            <p className="text-xs opacity-50">Run your code to see output...</p>
          </div>
        )}
        <div className="flex flex-col p-4 gap-1">
          {output.map((log, i) => (
            <div
              key={i}
              className={`p-2 rounded border text-xs leading-relaxed ${
                log.type === "error"
                  ? "bg-red-500/5 text-red-400 border-red-500/10"
                  : log.type === "success"
                    ? "bg-green-500/5 text-green-400 border-green-500/10"
                    : "bg-white/5 text-gray-200 border-white/10"
              }`}
            >
              <span className="opacity-50 mr-2 select-none uppercase text-[10px] font-bold">
                {log.type === "log"
                  ? "OUT"
                  : log.type === "error"
                    ? "ERR"
                    : "OK"}
              </span>
              <span className="whitespace-pre-wrap break-all leading-relaxed tracking-tight">
                {log.content}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(ConsolePane);
