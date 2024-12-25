import app from '../app';
import { appConfig } from '../config/appConfig';
import { Logger } from '../utils/logger';

export const serverLoader = (): void => {
    app.listen(appConfig.port, () => {
        Logger.info(`Server running on http://localhost:${appConfig.port}`);
    });
};
