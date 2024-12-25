import cliColor from 'cli-color';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
    private static colors = {
        info: cliColor.blue,
        warn: cliColor.yellow,
        error: cliColor.red,
        debug: cliColor.magenta,
        timestamp: cliColor.blackBright,
    };

    private static log(level: LogLevel, message: string, meta?: unknown): void {
        const timestamp = new Date().toISOString();
        const color = this.colors[level];
        const timestampColor = this.colors.timestamp;

        const logMessage = `${timestampColor(`[${timestamp}]`)} ${color(`[${level.toUpperCase()}]:`)} ${message}`;

        if (meta) {
            console[level](logMessage, meta);
        } else {
            console[level](logMessage);
        }
    }

    static info(message: string, meta?: unknown): void {
        this.log('info', message, meta);
    }

    static warn(message: string, meta?: unknown): void {
        this.log('warn', message, meta);
    }

    static error(message: string, meta?: unknown): void {
        this.log('error', message, meta);
    }

    static debug(message: string, meta?: unknown): void {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, meta);
        }
    }
}
