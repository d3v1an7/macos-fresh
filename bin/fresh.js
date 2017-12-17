#!/usr/bin/env node

'use strict';

// Pretty CLI
const {info, loading, warn, error, command, link} = require('prettycli');

// Exit early if not running macOS
if (process.platform != "darwin") {
  warn('fresh requires macOS, ya dingus!');
  process.exit(1);
}

// Display update notification
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
updateNotifier({pkg}).notify();

// Kick off
require('../lib/cli')
