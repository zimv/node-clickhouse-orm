export const CLICKHOUSE_ORM_DEBUG = "clickhouse-orm-debug:";
export const CLICKHOUSE_ORM_LOG = "clickhouse-orm-log:";
export const CLICKHOUSE_ORM_ERROR = "clickhouse-orm-error-log:";
export type ClickhouseClientInsertSuccess = {
  r: 1;
};
export interface ClickhouseClientInsertPromise {
  then<TResult1 = ClickhouseClientInsertSuccess, TResult2 = Error>(
    onfulfilled?:
      | ((value: ClickhouseClientInsertSuccess) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: Error) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2>;
  catch<TResult = Error>(
    onrejected?:
      | ((reason: TResult) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<ClickhouseClientInsertSuccess | TResult>;
}

export type ClickhouseClientToPromise = Promise<Object[]>;
