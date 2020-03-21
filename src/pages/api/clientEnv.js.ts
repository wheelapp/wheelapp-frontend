// Provides access to a filtered set of environment variables on the client.
// Read https://github.com/sozialhelden/twelve-factor-dotenv for more infos.

import * as env from '../../src/lib/env';
import { createEnvironmentJSResponseHandler } from '@sozialhelden/twelve-factor-dotenv';

export default createEnvironmentJSResponseHandler(env);
