import * as colors from 'colors/safe';
import { CLICKHOUSE_ORM_DEBUG, CLICKHOUSE_ORM_LOG, CLICKHOUSE_ORM_ERROR } from './constants';
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
export const ErrorLog = (desc: string) => {
    LogService(`${colors.red(`>> ${CLICKHOUSE_ORM_ERROR}`)} ${colors.red(desc)} \n`)
};
