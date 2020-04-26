const axios = require("axios").default;
const _ = require("lodash");
const { nanoid } = require("nanoid");

const config = require("./config");

// base config for the axios instance to use the Github v3 REST API
const githubApi = axios.create({
  headers: {
    "Content-Type": "application/json",
    Authorization: `token ${config.githubToken}`,
  },
  baseURL: `https://api.github.com/repos/${config.githubUser}/${config.githubRepo}`,
});

/**
 * function to get posts in the repo
 *
 * @param {string} slug       the slug id from Able
 *
 * @returns {Promise<{ path: string, name: string, sha: string} | undefined>}
 */
const getPost = async (slug) => {
  const response = await githubApi.get(
    `/contents/${config.contentPath}?ref=${config.githubBaseBranch}`
  );

  // if a valid response is returned
  if (Array.isArray(response.data)) {
    // find the post whose slug matches
    const post = response.data.find(
      // slug from able is appended at the end of the file name
      (post) => post.name.split("-").pop() === slug
    );

    // pick only path, name and sha property of the post response
    return post && _.pick(post, ["path", "name", "sha"]);
  }
  // returns undefined if the post is not found
};

/**
 * function to create new post in the repo
 *
 * @param {object} param
 * @param {string} param.name                 slugified name of the file
 * @param {string} param.content              base64 encoded content for the file
 * @param {string} param.message              commit message
 * @param {string} [param.branch='master']    the branch to use for the commit
 */
const createPost = ({
  name,
  content,
  message,
  branch = config.githubBaseBranch,
}) =>
  githubApi.put(`/contents/${config.contentPath}/${name}`, {
    message,
    content,
    branch,
  });

/**
 * function to update an existing post in the repo
 *
 * @param {object} param
 * @param {string} param.name                 slugified name of the file
 * @param {string} param.content              base64 encoded content for the file
 * @param {string} param.message              commit message
 * @param {string} param.sha                  sha hash of the existing file
 * @param {string} [param.branch='master']    the branch to use for the commit
 */
const updatePost = async ({
  name,
  content,
  message,
  sha,
  branch = config.githubBaseBranch,
}) =>
  githubApi.put(`/contents/${config.contentPath}/${name}`, {
    message,
    content,
    branch,
    sha,
  });

/**
 * function to delete an existing post in the repo
 *
 * @param {object} param
 * @param {string} param.name                 slugified name of the file
 * @param {string} param.message              commit message
 * @param {string} param.sha                  sha hash of the existing file
 * @param {string} [param.branch='master']    the branch to use for the commit
 */
const deletePost = async ({
  name,
  message,
  sha,
  branch = config.githubBaseBranch,
}) =>
  githubApi.delete(`/contents/${config.contentPath}/${name}`, {
    message,
    sha,
    branch,
  });

/**
 * function to create a pull request
 *
 * @param {string} title            title of the pull request
 *
 * @returns {Promise<{ number: string, sha: string, head: string }>}
 */
const createPullRequest = async (title) => {
  // generate a unique id for the pull request branch
  const head = `able:${nanoid(8)}`;

  // create a pull request
  const response = await githubApi.post(`/pulls`, {
    title,
    base: config.githubBaseBranch,
    head,
  });

  // return the branch name that we generated and sha hash of the head branch
  // also the pull request number
  return {
    number: response.data.number,
    sha: response.data.head.sha,
    head,
  };
};

/**
 * function to merge a pull request
 *
 * @param {object} param
 * @param {string} param.pullNumber       pull request number
 * @param {string} param.commitTitle      merge commit title
 * @param {string} param.sha              sha hash value of the head branch
 */
const mergePullRequest = ({ pullNumber, commitTitle, sha }) =>
  githubApi.put(`/pulls/${pullNumber}/merge`, {
    commit_title: commitTitle,
    sha,
    // because we want it trigger only one build from the master in case of an auto-deploy setup
    merge_method: "squash",
  });

/**
 * function to update the file name / path and content of a filter:
 * this is needed when there is an update to the filename as well
 *
 * Github REST API v3 currently doesn't directly support multiple changes in one API request / commit
 *
 * We can use either their low-level Git Database API or Pull Request structure with squash and merge
 * to complete this type of update action in one commit
 *
 * Here, we are using the Pull Request structure
 * because most users of Github are already familiar with Pull Requests
 *
 * @param {object} param
 * @param {string} param.oldFileName        file name of the file to be replaced
 * @param {string} param.oldFileSha         sha value of the file to be replaced
 * @param {string} param.newFileName        file name of the new file
 * @param {content} param.content           base64 encoded content for the file
 */
const updatePostContentAndPath = async ({
  oldFileName,
  oldFileSha,
  newFileName,
  content,
}) => {
  // first, we create a pull request
  const pullRequest = await createPullRequest(`update: ${newFileName}`);

  // then, we concurrently fire off two commits on the pull request branch
  await Promise.all([
    // to delete the old post file
    deletePost({
      name: oldFileName,
      message: `delete: ${oldFileName}`,
      branch: pullRequest.head,
      sha: oldFileSha,
    }),
    // to create the new post file
    createPost({
      name: newFileName,
      content,
      message: `create: ${newFileName}`,
      branch: pullRequest.head,
    }),
  ]);

  // squash and merge the pull request
  await mergePullRequest({
    pullNumber: pullRequest.number,
    commitTitle: `update: ${newFileName}`,
    sha: pullRequest.sha,
  });
};

module.exports = {
  getPost,
  createPost,
  updatePost,
  deletePost,
  updatePostContentAndPath,
};
