const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const config = require("./config");
const github = require("./github");
const { getFileName, getPostFileContent } = require("./utils");

const app = express();

app.use(bodyParser.json());

// possible event_types in the webhook body
const EVENT_TYPES = {
  CREATE: "post_create",
  UPDATE: "post_update",
  DELETE: "post_delete",
};

// listening for post requests for able
app.post("/", async (request, response) => {
  const { body } = request;

  try {
    // get the able token passed in the metadata
    const token = _.get(body, "metadata.token");

    // check if it matches the secret token you have generated in your Able webhook settings
    if (token !== config.ableToken) {
      // if it doesn't match then the request is not from Able and can be disregarded
      response.status(401).json({ details: "Invalid Request" });
      return;
    }

    // get the event type of the webhook request from the metadata
    const eventType = body.event;

    // get the slug of the post from the metadata
    const slug = _.get(body, "metadata.slug_id");

    // if the event type is DELETE
    if (eventType === EVENT_TYPES.DELETE) {
      // get the post from Github repo
      const post = await github.getPost(slug);

      // if the post exists in Github repo
      if (post) {
        // delete the post from the repo
        await github.deletePost({
          name: post.name,
          message: `delete: ${post.name}`,
          sha: post.sha,
        });
      }

      response.status(200).json({ details: `Post Deleted: ${post.name}` });
    }

    // get the content properties from the request body
    const title = _.get(body, "content.title");
    const contentBody = _.get(body, "content.body");
    const description = _.get(body, "content.subtitle");

    // get slugified file name
    const fileName = getFileName({ title, slug });

    if (eventType === EVENT_TYPES.CREATE) {
      const createdAt = _.get(body, "metadata.created_at");

      // encode the file content to be committed
      const content = getPostFileContent({
        title,
        body: contentBody,
        description,
        date: createdAt,
      });

      // create the file in the repo
      await github.createPost({
        name: fileName,
        content,
        message: `create: ${fileName}`,
      });

      response.status(200).json({ details: `Post Created: ${fileName}` });

      return;
    }

    if (eventType === EVENT_TYPES.UPDATE) {
      const updatedAt = _.get(body, "metadata.updated_at");

      // encode the file content to be committed
      const content = getPostFileContent({
        title,
        body: contentBody,
        description,
        date: updatedAt,
      });

      const post = await github.getPost(slug);

      // if post is present in github already, let's update its content
      if (post) {
        await github.updatePost({
          name: post.name,
          content,
          sha: post.sha,
          message: `update: ${post.name}`,
        });
      } else {
        // if post is not already in github, let's create it
        await github.createPost({
          name: fileName,
          content,
          message: `create: ${fileName}`,
        });
      }

      response.status(200).json({ details: `Post Updated: ${fileName}` });

      return;
    }
  } catch (err) {
    response.status(500).json({ details: "Failed to push changes to Github" });
  }
});

// a catch all route
app.all("*", (request, response) => {
  response.status(400).json({ details: "Invalid Request" });
});

// listening for requests coming in
const listener = app.listen(config.port, () => {
  console.log("Server is listening on port " + listener.address().port);
});
