#!/usr/bin/env node

'use strict';

// Pretty CLI
const {info, loading, warn, error, command, link} = require('prettycli');

/*
  Print to stdout:
  1. info: (label, message)
  2. loading: (label, message)
  3. warn: (message)
  4. error: (message)

  Returns pretty string (does not print)
  5. command: (command)
  6. link: (url)
*/

// print_status_primary "INFO" "init"
// install_cli_tools
// install_homebrew
// install_git
// install_ansible
// install_fresh
// ansible_playbook "playbook.yml" "--tags=init"
// print_status_recap "PASS" "init"
// print_help
info('INFO', 'Starting setup');



  // Spinner
  // const ora = require('ora');
  //
  // const spinner = ora('Loading unicorns').start();
  //
  // setTimeout(() => {
  //     spinner.color = 'yellow';
  //     spinner.text = 'Loading rainbows';
  // }, 1000);

// const
//     { spawn } = require( 'child_process' ),
//     child = spawn( 'ls', [ '-lh', '/usr' ] );
//
// child.stdout.on( 'data', data => {
//     console.log( `stdout: ${data}` );
// } );
//
// child.stderr.on( 'data', data => {
//     console.log( `stderr: ${data}` );
// } );
//
// child.on( 'close', code => {
//     console.log( `child process exited with code ${code}` );
// } );
//
// // console.log('you ordered a pizza with:');
// // if (program.peppers) console.log('  - peppers');
// // if (program.pineapple) console.log('  - pineapple');
// // if (program.bbqSauce) console.log('  - bbq');
// // console.log('  - %s cheese', program.cheese);
