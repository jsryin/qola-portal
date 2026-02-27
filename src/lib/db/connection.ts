/**
 * TiDB 数据库连接池管理
 * 使用单例模式确保连接池只创建一次
 */

// import mysql, { Pool, ... } from 'mysql2/promise'; // 修改为动态导入
import { getDbConfig } from './config';
import type { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

let pool: Pool | null = null;

/**
 * 获取数据库连接池（单例）
 */
export async function getPool(): Promise<Pool> {
  if (!pool) {
    const mysql = await import('mysql2/promise');
    const config = getDbConfig();

    const poolOptions: PoolOptions = {

      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };

    pool = mysql.createPool(poolOptions);
  }

  return pool;
}

/**
 * 执行查询并返回结果
 */
export async function query<T extends RowDataPacket[]>(
  sql: string,
  params?: unknown[]
): Promise<T> {
  const connection = await getPool();
  const [rows] = await connection.query<T>(sql, params);
  return rows;
}

/**
 * 执行增删改操作并返回结果
 */
export async function execute(
  sql: string,
  params?: unknown[]
): Promise<ResultSetHeader> {
  const connection = await getPool();
  const [result] = await connection.execute<ResultSetHeader>(sql, params);
  return result;
}

/**
 * 关闭连接池
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// 导出类型供外部使用
export type { RowDataPacket, ResultSetHeader };
