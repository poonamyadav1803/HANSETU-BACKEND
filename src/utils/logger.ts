function formatLog(level: string, message: string) {
  const time = new Date().toLocaleTimeString("en-US", { hour12: false });
  return `${time} [${level}] ${message}`;
}

export const log = (message: string) => console.log(formatLog("INFO", message));
export const logError = (message: string) => console.error(formatLog("ERROR", message));
export const logWarn = (message: string) => console.warn(formatLog("WARN", message));
