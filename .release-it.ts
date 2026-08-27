import { createReleaseConfig } from '@dnbhq/release-config';
import type { Config } from 'release-it';

const config: Config = createReleaseConfig({
  githubTokenRef: 'GITHUB_DNBHQ_TOKEN_ADMIN_PRIVATE',
});

export default config;
