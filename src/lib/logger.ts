// Ficheiro: src/lib/logger.ts
// Logger condicional que remove logs em produção

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: isDev ? console.log.bind(console) : () => {},
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  info: isDev ? console.info.bind(console) : () => {},
  debug: isDev ? console.debug.bind(console) : () => {},
};

export const devLog = (...args: unknown[]) => {
  if (isDev) console.log(...args);
};

export const devWarn = (...args: unknown[]) => {
  if (isDev) console.warn(...args);
};
