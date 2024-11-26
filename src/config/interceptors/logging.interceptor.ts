import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();
    const timestamp = new Date().toISOString();

    // 요청 로깅
    this.logger.debug(`
🌐 [${timestamp}] Incoming Request
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Endpoint: ${method} ${originalUrl}
🔍 Client Info:
   IP: ${ip}
   User-Agent: ${userAgent}
${this.formatData('Parameters', request.params)}
${this.formatData('Query', request.query)}
${this.formatData('Body', request.body)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    return next.handle().pipe(
      tap(response => {
        const responseTime = Date.now() - now;
        
        // 응답 로깅
        this.logger.debug(`
🌐 [${timestamp}] Outgoing Response
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Endpoint: ${method} ${originalUrl}
⏱️  Response Time: ${responseTime}ms
${this.formatData('Response Data', response)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      })
    );
  }

  private formatData(title: string, data: any): string {
    if (!data || Object.keys(data).length === 0) return '';
    return `📦 ${title}:\n   ${JSON.stringify(data, null, 3).replace(/\n/g, '\n   ')}`;
  }
} 