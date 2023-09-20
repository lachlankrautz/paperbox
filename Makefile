BASE_DIR := .
DIST_DIR := $(BASE_DIR)/dist
FIND_IGNORE_ARGS := -not -path '*/node_modules/*' \
	-not -path '*/dist/*' \
	-not -path '*/public/*' \
	-not -path '*/.git/*'

NODE_MODULES := $(BASE_DIR)/node_modules
NODE_BIN := $(NODE_MODULES)/.bin
YARN_DEP_FILES := package.json yarn.lock
YARN_OUT_FILE := $(NODE_MODULES)/.yarn_integrity

SRC_FILES := $(shell find $(BASE_DIR) -regex '.*\.[jt]sx?' $(FIND_IGNORE_ARGS) -not -name '*.min.js')
DIST_FILES := $(patsubst %.tsx,%.js,$(SRC_FILES))
DIST_FILES := $(patsubst %.jsx,%.js,$(DIST_FILES))
DIST_FILES := $(patsubst %.ts,%.js,$(DIST_FILES))
DIST_FILES := $(patsubst $(BASE_DIR)/%,$(DIST_DIR)/%,$(DIST_FILES))

BUNDLE_IN_FILE := $(DIST_DIR)/src/index.js
BUNDLE_OUT_FILE := public/assets/js/index.js

all: \
	$(BUNDLE_OUT_FILE)
	@echo "All done"

debug:
	@echo "Debugging..."
	@echo "src files"
	@echo $(SRC_FILES)
	@echo "dist files"
	@echo $(DIST_FILES)

tsc: $(YARN_OUT_FILE) $(DIST_FILES)

test:
	@echo "Running tests"

$(YARN_OUT_FILE): $(YARN_DEP_FILES)
	@echo Installing dependencies
	@yarn install --immutable
	@touch $(YARN_OUT_FILE)

$(DIST_DIR)/%.js: $(SRC_FILES) $(YARN_OUT_FILE)
	@echo Compiling typescript
	@$(NODE_BIN)/tsc

$(BUNDLE_OUT_FILE): $(DIST_FILES)
	@echo Creating bundle
	@$(NODE_BIN)/esbuild $(BUNDLE_IN_FILE) \
		--bundle --sourcemap \
		--target=chrome58,firefox57,safari11,edge16 \
		--outfile=$(BUNDLE_OUT_FILE)

#--bundle --minify --sourcemap \

watch:
	@yarn serve public/ &
	@while true; do \
		inotifywait -qr -e modify -e create -e delete -e move src; \
		make; \
	done

clean:
	@rm -rf dist/*
	@rm -rf $(BUNDLE_OUT_FILE)
	@echo "Cleaned"

nuke: clean
	@rm -rf $(NODE_MODULES)
	@echo "Nuked"

.PHONY: \
	all \
	install \
	test \
	watch \
	clean \
	nuke \
	debug
