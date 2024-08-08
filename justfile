build:
  ./build.js prod

watch:
  ag -l --js | entr ./build.js

package: build
  cd extension; zip -r archive *; cd ..; mv extension/archive.zip ./nos2x.zip
