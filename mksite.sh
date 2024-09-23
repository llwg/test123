#!/bin/bash

find docs/ -name "*.html" -delete

./tool.js minify_css

./tool.js generate_tool

./generate_site.js .  <(./supplement.js <(./parse_pandoc.js <(pandoc site.md --to json)))
./generate_site.js archived  <(./supplement.js <(./parse_pandoc.js <(pandoc archived.md --to json)))

