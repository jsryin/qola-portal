/**
 * Puck 相关类型定义
 */

/**
 * Puck 数据结构
 */
export interface PuckData {
  root: {
    props?: Record<string, unknown>;
    [key: string]: unknown;
  };
  content: Array<{
    type: string;
    props: Record<string, unknown>;
    [key: string]: unknown;
  }>;
  zones?: Record<string, Array<{
    type: string;
    props: Record<string, unknown>;
    [key: string]: unknown;
  }>>;
  [key: string]: unknown;
}

/**
 * 验证是否为有效的 Puck 数据
 */
export function isPuckData(data: unknown): data is PuckData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // 检查必需字段
  if (!obj.root || typeof obj.root !== 'object') {
    return false;
  }

  if (!Array.isArray(obj.content)) {
    return false;
  }

  return true;
}

/**
 * 创建空的 Puck 数据
 */
export function createEmptyPuckData(): PuckData {
  return {
    root: {
      props: {},
    },
    content: [],
    zones: {},
  };
}
