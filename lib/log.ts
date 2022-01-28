import * as colors from 'colors/safe';
import { CLICKHOUSE_ORM_DEBUG, CLICKHOUSE_ORM_LOG } from './constants';
let LogService = console.log;

export const setLogService = (logService: ()=>void) => {
    LogService = logService;
};

export const Log = (desc: string) => {
    LogService(colors.green(`>> ${CLICKHOUSE_ORM_LOG} ${desc}`))
};
export const DebugLog = (desc: string) => {
    LogService(colors.gray(`>> ${CLICKHOUSE_ORM_DEBUG} ${desc}`))
};
