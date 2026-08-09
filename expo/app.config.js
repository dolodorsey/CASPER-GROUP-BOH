module.exports = ({ config }) => {
  const easProjectId = process.env.EAS_PROJECT_ID;

  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      ...(easProjectId ? { eas: { projectId: easProjectId } } : {}),
    },
  };
};
