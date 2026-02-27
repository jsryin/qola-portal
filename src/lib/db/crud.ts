/**
 * 通用 CRUD 操作模块
 * 提供增删改查的通用方法，支持类型安全
 */

import { query, execute, RowDataPacket, ResultSetHeader } from './connection';

/**
 * 基础实体接口
 */
export interface BaseEntity {
  id?: number;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * 查询条件类型
 */
export type WhereCondition = Record<string, unknown>;

/**
 * 排序选项
 */
export interface OrderOption {
  field: string;
  direction: 'ASC' | 'DESC';
}

/**
 * 分页选项
 */
export interface PaginationOption {
  page: number;
  pageSize: number;
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 构建 WHERE 子句
 */
function buildWhereClause(
  where: WhereCondition
): { clause: string; values: unknown[] } {
  const keys = Object.keys(where);
  if (keys.length === 0) {
    return { clause: '', values: [] };
  }

  const conditions: string[] = [];
  const values: unknown[] = [];

  for (const key of keys) {
    const value = where[key];
    if (value === null) {
      conditions.push(`\`${key}\` IS NULL`);
    } else if (Array.isArray(value)) {
      // IN 查询
      const placeholders = value.map(() => '?').join(', ');
      conditions.push(`\`${key}\` IN (${placeholders})`);
      values.push(...value);
    } else {
      conditions.push(`\`${key}\` = ?`);
      values.push(value);
    }
  }

  return {
    clause: `WHERE ${conditions.join(' AND ')}`,
    values,
  };
}

/**
 * 通用 CRUD 类
 */
export class CrudRepository<T extends BaseEntity> {
  constructor(private readonly tableName: string) {}

  /**
   * 创建记录
   */
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map((key) => (data as Record<string, unknown>)[key]);

    const sql = `INSERT INTO \`${this.tableName}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${placeholders})`;
    const result = await execute(sql, values);
    
    return result.insertId;
  }

  /**
   * 批量创建记录
   */
  async createMany(dataList: Omit<T, 'id' | 'created_at' | 'updated_at'>[]): Promise<number> {
    if (dataList.length === 0) return 0;

    const keys = Object.keys(dataList[0]);
    const placeholdersRow = `(${keys.map(() => '?').join(', ')})`;
    const placeholders = dataList.map(() => placeholdersRow).join(', ');
    const values = dataList.flatMap((data) =>
      keys.map((key) => (data as Record<string, unknown>)[key])
    );

    const sql = `INSERT INTO \`${this.tableName}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES ${placeholders}`;
    const result = await execute(sql, values);
    
    return result.affectedRows;
  }

  /**
   * 根据 ID 查询
   */
  async findById(id: number): Promise<T | null> {
    const sql = `SELECT * FROM \`${this.tableName}\` WHERE id = ? LIMIT 1`;
    const rows = await query<(T & RowDataPacket)[]>(sql, [id]);
    
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * 查询单条记录
   */
  async findOne(where: WhereCondition): Promise<T | null> {
    const { clause, values } = buildWhereClause(where);
    const sql = `SELECT * FROM \`${this.tableName}\` ${clause} LIMIT 1`;
    const rows = await query<(T & RowDataPacket)[]>(sql, values);
    
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * 查询多条记录
   */
  async findMany(
    where: WhereCondition = {},
    order?: OrderOption,
    pagination?: PaginationOption
  ): Promise<T[]> {
    const { clause, values } = buildWhereClause(where);
    
    let sql = `SELECT * FROM \`${this.tableName}\` ${clause}`;
    
    if (order) {
      sql += ` ORDER BY \`${order.field}\` ${order.direction}`;
    }
    
    if (pagination) {
      const offset = (pagination.page - 1) * pagination.pageSize;
      sql += ` LIMIT ${pagination.pageSize} OFFSET ${offset}`;
    }
    
    const rows = await query<(T & RowDataPacket)[]>(sql, values);
    return rows;
  }

  /**
   * 分页查询
   */
  async findPaginated(
    where: WhereCondition = {},
    pagination: PaginationOption,
    order?: OrderOption
  ): Promise<PaginatedResult<T>> {
    // 查询总数
    const { clause, values } = buildWhereClause(where);
    const countSql = `SELECT COUNT(*) as total FROM \`${this.tableName}\` ${clause}`;
    const countResult = await query<({ total: number } & RowDataPacket)[]>(countSql, values);
    const total = countResult[0]?.total || 0;
    
    // 查询数据
    const data = await this.findMany(where, order, pagination);
    
    return {
      data,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }

  /**
   * 更新记录
   */
  async update(
    where: WhereCondition,
    data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<number> {
    const keys = Object.keys(data);
    if (keys.length === 0) return 0;

    const setClause = keys.map((key) => `\`${key}\` = ?`).join(', ');
    const setValues = keys.map((key) => (data as Record<string, unknown>)[key]);
    
    const { clause, values: whereValues } = buildWhereClause(where);
    
    const sql = `UPDATE \`${this.tableName}\` SET ${setClause} ${clause}`;
    const result = await execute(sql, [...setValues, ...whereValues]);
    
    return result.affectedRows;
  }

  /**
   * 根据 ID 更新
   */
  async updateById(
    id: number,
    data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> {
    const affectedRows = await this.update({ id }, data);
    return affectedRows > 0;
  }

  /**
   * 删除记录
   */
  async delete(where: WhereCondition): Promise<number> {
    const { clause, values } = buildWhereClause(where);
    
    if (!clause) {
      throw new Error('删除操作必须指定条件，防止误删全表');
    }
    
    const sql = `DELETE FROM \`${this.tableName}\` ${clause}`;
    const result = await execute(sql, values);
    
    return result.affectedRows;
  }

  /**
   * 根据 ID 删除
   */
  async deleteById(id: number): Promise<boolean> {
    const affectedRows = await this.delete({ id });
    return affectedRows > 0;
  }

  /**
   * 检查记录是否存在
   */
  async exists(where: WhereCondition): Promise<boolean> {
    const { clause, values } = buildWhereClause(where);
    const sql = `SELECT 1 FROM \`${this.tableName}\` ${clause} LIMIT 1`;
    const rows = await query<RowDataPacket[]>(sql, values);
    
    return rows.length > 0;
  }

  /**
   * 统计记录数
   */
  async count(where: WhereCondition = {}): Promise<number> {
    const { clause, values } = buildWhereClause(where);
    const sql = `SELECT COUNT(*) as total FROM \`${this.tableName}\` ${clause}`;
    const rows = await query<({ total: number } & RowDataPacket)[]>(sql, values);
    
    return rows[0]?.total || 0;
  }

  /**
   * 执行原生 SQL 查询
   */
  async rawQuery<R extends RowDataPacket[]>(
    sql: string,
    params?: unknown[]
  ): Promise<R> {
    return query<R>(sql, params);
  }

  /**
   * 执行原生 SQL 命令
   */
  async rawExecute(
    sql: string,
    params?: unknown[]
  ): Promise<ResultSetHeader> {
    return execute(sql, params);
  }
}

/**
 * 创建 CRUD 仓库实例的工厂函数
 */
export function createRepository<T extends BaseEntity>(
  tableName: string
): CrudRepository<T> {
  return new CrudRepository<T>(tableName);
}
