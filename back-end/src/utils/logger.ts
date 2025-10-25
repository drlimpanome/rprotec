import AppLog from "../models/AppLog";

interface LogContext {
  client_id?: string;
  list_id?: any;
  list_group_id?: any;
  data?: any;
  context?: string;
  service?: string;
}

class Logger {
  private async write(
    level: string,
    message: string,
    context: LogContext = {}
  ) {
    try {
      await AppLog.create({
        level,
        message,
        context: context.context,
        service: context.service,
        client_id: context.client_id,
        list_id: context.list_id,
        list_group_id: context.list_group_id,
        data: context.data,
      });
    } catch (err) {
      // Nunca quebrar o fluxo da aplicação por causa de log
      console.error("Erro ao salvar log:", err);
    }
  }

  info(message: string, context?: LogContext) {
    return this.write("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    return this.write("warn", message, context);
  }

  error(message: string, context?: LogContext) {
    return this.write("error", message, context);
  }

  debug(message: string, context?: LogContext) {
    return this.write("debug", message, context);
  }
}

export default new Logger();
