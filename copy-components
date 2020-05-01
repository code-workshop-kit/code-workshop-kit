#!/usr/bin/env bash

# (re-)copies the components to node modules, because our app shell insertion relies on
# importing this component from our node modules in the browser.
dir="node_modules/code-workshop-kit"

if [[ ! -e $dir ]]; then
  mkdir $dir
fi

rm -rf "$dir/components"

cp -rf src/components "$dir/components"