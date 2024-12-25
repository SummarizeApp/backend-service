import app from '../app';
import { appConfig } from '../config/appConfig';

export const serverLoader = (): void => {
    app.listen(appConfig.port, () => {
        console.log(`Server running on http://localhost:${appConfig.port}`);
    });
};
