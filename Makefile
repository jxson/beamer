
PATH := node_modules/.bin:$(PATH)
SHELL := /bin/bash -e -o pipefail

VERSION=patch

release:
	npm version $(VERSION)
	git push && git push --tags
	npm publish

clean:
	@$(RM) -fr node_modules $(STANDALONE).js
	@$(RM) -fr npm-debug.log

node_modules: package.json
	@npm prune
	@npm install

test:
	@mocha test/test-*.js

.PHONY: clean release test
