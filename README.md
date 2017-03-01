# Getting started

The add-on lives [in Google's Script Editor](https://script.google.com/a/a8c.com/macros/d/1hJ0JBL8vjffwQUzhls0-ihgI7Rb-TcFcKo6qG74TGHE9VFN5gUa8XjUY/edit)
but, in keeping with [best practices](https://developers.googleblog.com/2015/12/advanced-development-process-with-apps.html),
this repo is the source of truth, and the script editor will be overwritten with
changes from this repo.

# Deploying

In order for this to work, you will need to follow the first 2 steps of the
[Quickstart](https://github.com/danthareja/node-google-apps-script/blob/master/README.md#quickstart)
for [node-google-apps-script](https://github.com/danthareja/node-google-apps-script).
I recommend "Independent Developer Console Project" for step 1.

You should only need to do this once. Once you have `gapps auth` working you can
run

`npm run deploy`

This will use node-google-apps-script to upload the `lib` directory to the
add-on's script editor.

# Testing

In the [script editor](https://script.google.com/a/a8c.com/macros/d/1hJ0JBL8vjffwQUzhls0-ihgI7Rb-TcFcKo6qG74TGHE9VFN5gUa8XjUY/edit?splash=yes)
choose "Publish" → "Test as add-on…" and then select a document to test with.

That will open a new window with your document. You can then choose Overpass
from the Add-ons menu.

# Forking

If you create a fork of this project, you will need to create a `gapps.config.json`
with your script's ID.
