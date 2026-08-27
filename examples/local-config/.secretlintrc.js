import baseConfig from "@dnbhq/secretlint-config";

export default {
  ...baseConfig,
  rules: [
    ...baseConfig.rules,
    // Add project-specific rules here.
  ],
};
