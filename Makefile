BIN_PATH = node_modules/.bin
WATCHIFY = $(BIN_PATH)/watchify
BROWSERIFY = $(BIN_PATH)/browserify
NODEMON = $(BIN_PATH)/nodemon
MOCHA = $(BIN_PATH)/mocha
NPM = npm
NODE ?= node
BUILD_DIR = build
SERVER_JS = app/server.js
SERVER_BUNDLE_JS = $(BUILD_DIR)/server.js
BABELIFY_PLUGIN = [ babelify --presets [ es2015 ] ]
BROWSERIFY_OPTIONS = --verbose --exclude "**/mongoose/**" --exclude "**/google-distance/**"  --node $(SERVER_JS) -t $(BABELIFY_PLUGIN) -o $(SERVER_BUNDLE_JS)

run: install webserver watchify

build: install

node-version: npm
	@if [ "$(shell $(NODE) --version | sed 's/[^0-9]//g')" -lt 400 ]; then echo "Please upgrade your version of Node.js: https://nodejs.org/"; exit 1; fi

webserver:
	@echo "Starting server..."
	$(NODEMON) $(SERVER_BUNDLE_JS) &

npm:
	@echo "Checking for npm..."
	@command -v npm >/dev/null 2>&1 || { echo >&2 "Please install Node.js: https://nodejs.org/"; exit 1; }

install: npm node-version
	@echo "Checking dependencies..."
	@$(NPM) install

build-server:
	@echo "Building server..."
	mkdir -p $(BUILD_DIR)
	$(BROWSERIFY) $(BROWSERIFY_OPTIONS)

watchify:
	@echo "Running Browserify on your files and watching for changes... (Press CTRL-C to stop)"
	$(WATCHIFY) $(BROWSERIFY_OPTIONS)

clean:
	@rm -rf node_modules $(BUILD_DIR)

test:
	@echo "Running tests..."
	$(MOCHA) --compilers js:babel-register

.PHONY: run watchify install npm node-version build-server clean test build webserver
