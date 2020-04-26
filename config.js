module.exports = {
  ableToken: process.env.ABLE_TOKEN,
  githubToken: process.env.GITHUB_TOKEN,
  githubUser: process.env.GITHUB_USER,
  githubRepo: process.env.GITHUB_REPO,
  githubBaseBranch: process.env.GITHUB_BASE_BRANCH || "master",
  contentPath: process.env.CONTENT_PATH || "content/blog",
  port: process.env.PORT || 3000,
};
