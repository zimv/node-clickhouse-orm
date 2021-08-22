import { CLICKHOUSE_ORM_DEBUG, CLICKHOUSE_ORM_LOG } from './constants';

export const Log = (desc) => {
    console.log(CLICKHOUSE_ORM_LOG, desc)
};
export const DebugLog = (desc) => {
    console.log(CLICKHOUSE_ORM_DEBUG, desc)
};