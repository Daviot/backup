import Backup from './init.js';
import { warning } from './log.js';

(async () => {
    warning('Deprecation warning: Please use the file index.js instead of this file.');
    await Backup();
})()