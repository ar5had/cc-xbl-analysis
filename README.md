# comm-central-xbl-bindings
Scripts for finding xbl files, bindings in comm central a.k.a thunderbird.

## About
Only comm-central bindings are centre of focus so the files and bindings found will be exclusive to comm-central.

## How to run

Steps:

1. `npm install`
2. `npm run start` and enter the path for your comm folder in comm-central repo
3. open `localhost:8080` to see the visualized inheritance tree

## Files

**files/files.txt:** contains the xbl files' path

**node_scripts/script.js:** contains code for parsing xbl files and finding bindings etc.

**shell_scripts/searchXBLFiles:** script for populating files.txt

**files/bindings.md:** markdown file having all the data related to binding present in a file and what they extends

**node_scripts/InheritanceTree.js:** data structure for finding out the inheritance tree

## Supported os/systems

This repo is supposed to work on linux and macOs.