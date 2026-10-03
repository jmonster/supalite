import { I as IConnectionConfig, C as Connection } from '../Connection-XOZvkhwS.js';
import 'kysely';

declare function createConnection<E extends IConnectionConfig = IConnectionConfig>(_config?: E): Promise<Connection>;

export { Connection, IConnectionConfig, createConnection };
