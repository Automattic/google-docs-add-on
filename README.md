# Getting started

The add-on lives in Google's Script Editor but, in keeping with [best practices](https://developers.googleblog.com/2015/12/advanced-development-process-with-apps.html),
this repo is the source of truth, and the script editor will be overwritten with
local changes.

To start developing, you will need to create [a blank Script Editor project](https://script.google.com/).

# Deploying

In order for this to work, you will need to follow the first 2 steps of the
[Quickstart](https://github.com/danthareja/node-google-apps-script/blob/master/README.md#quickstart)
for [node-google-apps-script](https://github.com/danthareja/node-google-apps-script).
I recommend "Independent Developer Console Project" for step 1.

You should only need to do this once. Once you have `gapps auth` working you will
need to rename `gapps.config.json-sample` to `gapps.config.json` and put in your
script's id. Finally, run

`npm run deploy`

This will use node-google-apps-script to upload the `dist` directory to the
add-on's script editor.

# Testing

In the script editor choose "Publish" → "Test as add-on…" and then select a
document to test with.

That will open a new window with your document. You will then see your project
in the Add-ons menu.