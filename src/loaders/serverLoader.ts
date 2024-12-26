import app from '../app';
import { appConfig } from '../config/appConfig';
import logger from '../utils/logger';

export const serverLoader = (): void => {
    app.listen(appConfig.port, () => {
        logger.info(`Server running on http://localhost:${appConfig.port}`);
    });
};
