import * as colors from 'colors/safe';
import { CLICKHOUSE_ORM_DEBUG, CLICKHOUSE_ORM_LOG } from './constants';
let LogService = console.log;

export const setLogService = (logService: ()=>void) => {
    LogService = logService;
};

export const Log = (desc: string) => {
    LogService(`${colors.green(`>> ${CLICKHOUSE_ORM_LOG}`)} ${colors.yellow(desc)} \n`)
};
export const DebugLog = (desc: string) => {
    LogService(`${colors.green(`>> ${CLICKHOUSE_ORM_DEBUG}`)} ${colors.gray(desc)} \n`)
};
