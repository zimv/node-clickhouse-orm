import Orm from './orm';
export default ({client, db, debug = false}) => {
    const conn = new Orm({ client, db, debug });
    return conn;
}