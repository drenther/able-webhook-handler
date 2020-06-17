# Able - Push to Github

This repository contains the code to an express web server that consumes webhook requests from Able and pushes them to a target Github repo to power a blog using static site generators.

Currently, this web server is setup specifically to support a [basic Gatsby markdown](https://github.com/drenther/able-gatsby-starter).

We will be updating this project and add other related projects to support more and more similar use cases in the future.

## Dev Setup

This is a basic express app. You can start off by cloning the Git repo -

```
git clone https://github.com/drenther/able-webhook-handler
```

Then, `cd` into the repo root and install the dependencies

```
npm install
```

Finally, setup up the **_environment variables_** by copying the contents of the `.env.example` file into `.env` file and set the correct values for each of the following `ENV` variables.

```sh
# Token that you can get from the webhook section in your Posts page inside Able settings
# It is used to verify if the request is coming from Able
ABLE_TOKEN=able_webhook_token

# An OAuth2 token that can be generated from Github settings to allow API based access to your repos
# Don't forget to grant access to repos when generating the token
GITHUB_TOKEN=personal_oauth_token

# Your github user name
GITHUB_USER=username

# Github repo where you want the updates to be pushed to
GITHUB_REPO=reponame

# Path for where the post files are inside your repo
# This is an absolute path value from your project root directory
CONTENT_PATH=content/blog
```

You can start the dev server by running

```
npm run dev
```

This script uses the `.env` file to inject necessary environment variables and [`nodemon`](https://github.com/remy/nodemon/) to run auto updating dev server.

When trying to debug your development server, you can use something like [ngrok](https://ngrok.com/) to expose your localhost server to be able to listen to webhook requests from Able.

You can also run

```
npm start
```

to run your server (but that will not run a dev-server). This is recommended when you are deploying your server.

> You can also look into using something like [pm2](https://github.com/Unitech/pm2) to manage your node.js apps in production

## Deployment

You can deploy this repo just like any simple node.js app.

You can follow Node.js application deployment tutorial for the platform you are using.

### Using Heroku

[Heroku](https://heroku.com) makes it really easy to deploy a Node.js application.

That's why we have added a one-click method to get you up and running in Heroku.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Click on the **Deploy** button and you should be ready to go.

You must fill in the necessary `ENV` variable values listed in the form and then you are ready to go.

### Using Glitch

[Glitch](https://glitch.com) is a great environment for rapid prototyping and development. It's a great way to get a Node.js server up and running in matter of seconds.

That's why we have added a one-click method to get this repo setup on Glitch for you.

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/import/git?url=https://github.com/drenther/able-webhook-handler.git)

Click on the **Remix** button and you should have a copy of this git repo running under your Glitch account in minutes.

From there, all you have to do is add the correct `ENV` variable values in a `.env` file in glitch.

You can use the `.env.example` and related details mentioned above for reference.
