const slugify = require("slugify");

/**
 * function to create the base64 encoded file content for commiting the changes to Github
 *
 * @param {object} params
 * @param {string} params.title          title of the post
 * @param {string} params.description    subtitle or brief description of the post
 * @param {string[]} params.tags         an array of string for keywords or tech tags related to the post
 * @param {string} params.body           body of the post
 * @param {string} params.date           date string for created_at or updated_at value
 *
 * @return {string} base64 encoded file content
 */
const getPostFileContent = ({ title, description, body, date, tags }) =>
  Buffer.from(
    `---
title: ${title}
date: ${date}
${description ? `description: ${description}` : ""}
${tags.length ? `tags: ${tags.join(", ")}` : ""}
---

${body}`
  ).toString("base64");

/**
 * function to create the file name based on the title and slug
 *
 * @param {object} param
 * @param {string} param.title         title of the post
 * @param {string} param.slug          slug identifier of the post in Able
 *
 * @returns {string}                   the file name in gatsby
 */
const getFileName = ({ title, slug }) => `${slugify(title)}-${slug}.md`;

module.exports = {
  getPostFileContent,
  getFileName,
};
