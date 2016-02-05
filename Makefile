BIN_PATH = node_modules/.bin
NODEMON = $(BIN_PATH)/nodemon
MOCHA = $(BIN_PATH)/mocha
BABEL = $(BIN_PATH)/babel
NPM = npm
NODE ?= node
BUILD_DIR = build
SERVER_JS_DIR = app
SERVER_BUNDLE_JS = $(BUILD_DIR)/server.js

run: install webserver watch

build: install

node-version: npm
	@if [ "$(shell $(NODE) --version | sed 's/[^0-9]//g')" -lt 400 ]; then echo "Please upgrade your version of Node.js: https://nodejs.org/"; exit 1; fi

webserver:
	@echo "Starting server..."
	$(NODEMON) $(SERVER_BUNDLE_JS) &

watch:
	@echo "Watching app for changes..."
	$(BABEL) --watch $(SERVER_JS_DIR) -d $(BUILD_DIR)

build-server:
	$(BABEL) $(SERVER_JS_DIR) -d $(BUILD_DIR)

npm:
	@echo "Checking for npm..."
	@command -v npm >/dev/null 2>&1 || { echo >&2 "Please install Node.js: https://nodejs.org/"; exit 1; }

install: npm node-version
	@echo "Checking dependencies..."
	@$(NPM) install

clean:
	@rm -rf node_modules $(BUILD_DIR)

test:
	@echo "Running tests..."
	$(MOCHA) --compilers js:babel-register

deploy:
	@echo "Deploying to heroku..."
	git push heroku master

.PHONY: run install npm node-version clean test build webserver watch deploy build-server
