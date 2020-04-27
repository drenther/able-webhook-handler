# able-webhook-handler

This repository contains the code to an express web server that consumes webhook requests from Able and pushes them to a target Github repo to power a blog using static site generators.

Currently, this web server is setup specifically tuned to support a [basic Gatsby markdown](https://github.com/able-bio/able-gatsby-starter).

We will updating this repo and other supporting repos to support more and more use cases in the future.

## Dev Setup

This is a basic express app. You can start off by cloning the Git repo -

```
git clone https://github.com/able-bio/able-webhook-handler
```

Then, cd into the repo root and install the dependencies

```
npm install
```

Finally, setup up the **_environment variables_** by copying the contents of the `.env.example` file into `.env` file and set the correct values for each of the following `ENV` variables.

```sh
# this is the token you can get from accessing the webhook section in your able settings -> posts page
ABLE_TOKEN=able_webhook_token

# you can generate a OAuth2 token in Github settings to allow API based access to your repos
# don't forget to give grant access to repos when generating the token
GITHUB_TOKEN=personal_oauth_token

# your github user name
GITHUB_USER=username

# the github repo which you want the updates to be pushed to
GITHUB_REPO=reponame

# the path where the post files are inside your repo
# this is an absolute path value from your project root directory
CONTENT_PATH=content/blog
```

You can start the dev server by

```
npm run dev
```

This script uses the `.env` to inject the necessary environment variables and [`nodemon`](https://github.com/remy/nodemon/) to run auto updating dev server.

When trying to debug your development server, you can use something like [ngrok](https://ngrok.com/) to expose your localhost server to be able to listen to webhook requests from Able.

## Deployment

You can deploy this repo just like any simple node.js app.

You can follow Node.js application deployment tutorial for the platform you are using.

### Using Glitch

[Glitch](https://glitch.com) is a great environment for rapid prototyping and development. It's a great way to get a Node.js server up and running in matter of seconds.

That's why we have set have added a one-click method get you up running in Glitch.

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/import/git?url=https://github.com/able-bio/able-webhook-handler.git)

Click on the remix button and you should have a copy of this git repo running under your Glitch account in minutes.

From there, all you have to do is add the correct `ENV` variable values in a `.env` file in glitch.

You can use the `.env.example` and related details mentioned above for reference.
