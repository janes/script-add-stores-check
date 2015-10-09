'use strict';

import fs from 'fs';
import * as _ from 'lodash';
import Handler from './handler';
import { argv } from 'yargs';

let loadJSON = (name) => {
  let content = {};

  try {
    content = fs.readFileSync(name);
    content = JSON.parse(content);
  }
  catch (err) {
    console.log(`loading default configuration for filename ${name}`);
  }

  return content;
}

let defaultConfig = loadJSON('config/all.json');
let envConfig = {};
if(process.env.NODE_ENV === 'production') {
  envConfig = loadJSON(`config/production.json`);
}
else {
  envConfig = loadJSON(`config/development.json`);
}

let config = _.extend({}, defaultConfig, envConfig, {file: './lojas.json'});

var handler = new Handler(config);

handler.execute();
