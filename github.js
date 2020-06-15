const axios = require("axios").default;
const _ = require("lodash");

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
      // we split string using '-' as delimiter to take `slug.md` part
      // we split it again using '.' as delimiter to take only the slug value
      // NOTE: not the most efficient way, but it works
      (post) => post.name.split("-").pop().split(".").shift() === slug
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

module.exports = {
  getPost,
  createPost,
  updatePost,
  deletePost,
};
