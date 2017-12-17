#!/usr/bin/env node

'use strict';

var program = require('commander');
program
  .version('0.0.2')
  .description('Super opinionated and overly engineered macOS bootstrap')
  .command('run', 'make changes to system')
  .command('undo', 'undo changes to system')
  .parse(process.argv);
