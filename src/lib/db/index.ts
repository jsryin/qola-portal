/**
 * TiDB 数据库模块导出
 */

// 配置
export { getDbConfig } from './config';
export type { DbConfig } from './config';

// 连接
export { getPool, query, execute, closePool } from './connection';
export type { RowDataPacket, ResultSetHeader } from './connection';

// CRUD 操作
export {
  CrudRepository,
  createRepository,
} from './crud';

export type {
  BaseEntity,
  WhereCondition,
  OrderOption,
  PaginationOption,
  PaginatedResult,
} from './crud';
