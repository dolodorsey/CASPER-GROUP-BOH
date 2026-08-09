module.exports = ({ config }) => {
  const easProjectId = process.env.EAS_PROJECT_ID;
  const gitCommit = process.env.EXPO_PUBLIC_BUILD_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local';

  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      ...(easProjectId ? { eas: { projectId: easProjectId } } : {}),
      release: { gitCommit },
    },
  };
};
