/* eslint-disable no-console */
import { warn, debug, trace, info, error, type LogOptions } from "@tauri-apps/plugin-log";

declare global {
  function error(message: string, options?: LogOptions): Promise<void>;
  function warn(message: string, options?: LogOptions): Promise<void>;
  function info(message: string, options?: LogOptions): Promise<void>;
  function debug(message: string, options?: LogOptions): Promise<void>;
  function trace(message: string, options?: LogOptions): Promise<void>;
}

export function initLogger() {
  // In development mode, capture all logs and forward them to Tauri's log plugin.
  if (import.meta.env.DEV) {
    function forwardConsole(
      fnName: "log" | "debug" | "info" | "warn" | "error",
      logger: (message: string) => Promise<void>,
    ) {
      const original = console[fnName];
      console[fnName] = (message) => {
        original(message);
        logger(message);
      };
    }

    forwardConsole("error", error);
    forwardConsole("warn", warn);
    forwardConsole("info", info);
    forwardConsole("debug", debug);
    forwardConsole("log", trace);
  }

  // Put the logger functions on the global scope.
  globalThis.error = error;
  globalThis.warn = warn;
  globalThis.info = info;
  globalThis.debug = debug;
  globalThis.trace = trace;
}
