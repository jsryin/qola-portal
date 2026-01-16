/**
 * TiDB 数据库配置
 * TiDB 兼容 MySQL 协议，使用 mysql2 驱动连接
 */

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: {
    minVersion?: string;
    rejectUnauthorized?: boolean;
  };
}

/**
 * 从环境变量获取数据库配置
 * 支持单独配置或连接字符串两种方式
 */
export function getDbConfig(): DbConfig {
  // 方式1：使用单独的环境变量
  if (process.env.TIDB_HOST) {
    return {
      host: process.env.TIDB_HOST,
      port: parseInt(process.env.TIDB_PORT || '4000', 10),
      user: process.env.TIDB_USER || 'root',
      password: process.env.TIDB_PASSWORD || '',
      database: process.env.TIDB_DATABASE || 'test',
      ssl: process.env.TIDB_SSL === 'true' ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      } : undefined,
    };
  }

  // 方式2：使用连接字符串 (例如 TiDB Cloud)
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port || '4000', 10),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: url.searchParams.get('ssl') === 'true' ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      } : undefined,
    };
  }

  throw new Error('数据库配置缺失：请设置 TIDB_HOST 或 DATABASE_URL 环境变量');
}
