BASE_DIR := .
DIST_DIR := $(BASE_DIR)/dist
FIND_IGNORE_ARGS := -not -path '*/node_modules/*' \
	-not -path '*/dist/*' \
	-not -path '*/.git/*'

NODE_MODULES := $(BASE_DIR)/node_modules
YARN_DEP_FILES := package.json yarn.lock
YARN_OUT_FILE := $(NODE_MODULES)/.yarn_integrity

SRC_FILES := $(shell find $(BASE_DIR) -regex '.*\.[jt]sx?' $(FIND_IGNORE_ARGS) -not -name '*.min.js')
DIST_FILES := $(patsubst %.tsx,%.js,$(SRC_FILES))
DIST_FILES := $(patsubst %.jsx,%.js,$(DIST_FILES))
DIST_FILES := $(patsubst %.ts,%.js,$(DIST_FILES))
DIST_FILES := $(patsubst $(BASE_DIR)/%,$(DIST_DIR)/%,$(DIST_FILES))

MIN_SRC_FILES := $(shell find $(BASE_DIR) -name '*.min.js' $(FIND_IGNORE_ARGS))
MIN_DIST_FILES := $(patsubst $(BASE_DIR)/%.min.js,$(DIST_DIR)/%.min.js,$(MIN_SRC_FILES))

all: \
	bundle
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
	@yarn install --immutable
	@touch $(YARN_OUT_FILE)

$(DIST_DIR):
	@mkdir -p $(DIST_DIR)/lib

$(DIST_DIR)/%.min.js: $(MIN_SRC_FILES) $(DIST_DIR)
	@cp $< $@

$(DIST_DIR)/%.js $(DIST_DIR)/%.jsx: $(SRC_FILES) $(YARN_OUT_FILE)
	@yarn tsc

bundle: $(DIST_FILES) $(MIN_DIST_FILES)
	@yarn esbuild dist/src/App.js \
		--bundle --minify --sourcemap \
		--target=chrome58,firefox57,safari11,edge16 \
		--outfile=public/assets/js/app.js

watch:
	@yarn serve public/ &
	@while true; do \
		inotifywait -qr -e modify -e create -e delete -e move src; \
		make; \
	done

clean:
	@rm -rf dist/*
	@rm -rf public/assets/js/app.js*
	@echo "Cleaned"

nuke: clean
	@rm -rf $(NODE_MODULES)
	@echo "Nuked"

.PHONY: \
	all \
	install \
	test \
	bundle \
	clean \
	nuke \
	debug
