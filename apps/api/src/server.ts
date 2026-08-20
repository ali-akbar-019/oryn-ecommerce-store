import { createApp } from './app'; import { env } from './config/env';
createApp().listen(env.API_PORT, () => console.log(`ORYN API listening on :${env.API_PORT}`));
