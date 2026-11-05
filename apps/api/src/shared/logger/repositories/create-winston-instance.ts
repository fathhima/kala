import { utilities as nestWinstonModuleUtilities } from "nest-winston";
import { createLogger, format, transports } from "winston";
import { LogLevel } from "../types/log-level.type";

type CreateWinstonInstanceOptions = {
  appName?: string;
  env?: string;
  level?: LogLevel;
};

// Sensitive data redaction format
const redactFormat = format((info) => {
  const sensitiveKeys =
    /password|secret|token|authorization|cookie|key_id|key_secret|access_key/i;
  const redact = (value: unknown): unknown => {
    if (value === null || typeof value !== "object") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(redact);
    }
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (sensitiveKeys.test(key)) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = redact(val);
      }
    }
    return result;
  };
  return redact(info) as typeof info;
});

export function createWinstonInstance(
  options: CreateWinstonInstanceOptions = {},
) {
  const env = options.env ?? process.env.NODE_ENV ?? "development";
  const level = options.level ?? (env === "production" ? "info" : "debug");
  const appName = options.appName ?? "kala-api";
  const isProduction = env === "production";

  const consoleFormat = isProduction
    ? format.combine(
        redactFormat(),
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
      )
    : format.combine(
        redactFormat(),
        format.timestamp({ format: "HH:mm:ss" }),
        format.ms(),
        format.errors({ stack: true }),
        nestWinstonModuleUtilities.format.nestLike(appName, {
          colors: true,
          prettyPrint: true,
          processId: false,
          appName: true,
        }),
      );

  return createLogger({
    level,
    defaultMeta: { service: appName, env },
    format: consoleFormat,
    transports: [new transports.Console()],
  });
}
