BASE_DIR := .
DIST_DIR := $(BASE_DIR)/dist
FIND_IGNORE_ARGS := -not -path '*/node_modules/*' -not -path '*/dist/*' -not -path '*/.git/*'

NODE_MODULES := $(BASE_DIR)/node_modules
YARN_DEP_FILES := package.json yarn.lock
YARN_OUT_FILE := $(NODE_MODULES)/.yarn_integrity

SRC_FILES := $(shell find $(BASE_DIR) -regex '.*\.[jt]sx?' $(FIND_IGNORE_ARGS) -not -name '*.min.js')
DIST_FILES := $(patsubst %.ts,%.js,$(SRC_FILES))
DIST_FILES := $(patsubst $(BASE_DIR)/%,$(DIST_DIR)/%,$(SRC_FILES))

MIN_SRC_FILES := $(shell find $(BASE_DIR) -name '*.min.js' $(FIND_IGNORE_ARGS))
MIN_DIST_FILES := $(patsubst $(BASE_DIR)/%.min.js,$(DIST_DIR)/%.min.js,$(MIN_SRC_FILES))

all: \
	$(DIST_FILES) $(MIN_DIST_FILES)
	@echo "All done"

tsc: $(YARN_INTEGRITY)
	@echo yarn tsc

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

clean:
	@rm -rf dist/*
	@echo "Cleaned"

nuke: clean
	@rm -rf $(NODE_MODULES)
	@echo "Nuked"

debug:
	@echo "Debugging..."
	@echo $(SRC_FILES)

.PHONY: \
	all \
	install \
	test \
	clean \
	nuke \
	debug
