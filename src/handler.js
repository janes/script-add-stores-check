'use strict';

import fs from 'fs';

import q from 'q';
import * as _ from 'lodash';

import TestRepository from './repositories/test';
import ScheduleRepository from './repositories/schedule';

let configs = Symbol(), scheduleRepo = Symbol(), queueService = Symbol(), testRepo = Symbol(), filename = Symbol();

export default class Handler {
  constructor(config) {
    this[configs] = config;
    this[scheduleRepo] = new ScheduleRepository(config);
    this[testRepo] = new TestRepository(config);
    this[filename] = config.file;
  }

  execute() {
    let stores = (name) => {
      let content = {};

      try {
        content = fs.readFileSync(name);
        content = JSON.parse(content);
      }
      catch (err) {
        console.log(`error on load file`);
        process.exit(0);
      }

      return content;
    }(this[filename]);

    let testsAdded = [];

    let starterDefer = q.defer();
    let startfn = () => {
      return starterDefer.promise;
    }();

    _.each(stores, (store, key) => {
      startfn = startfn.then(() => {
        let def = q.defer();
        if(store.length) {
          let test = {
            name: `test logo vtex on ${key}`,
            description: `testando se o logo está na página`,
            user: 'vtex',
            context: {
              url: store[0]
            },
            actions: [],
            asserts: [{
              type: 'checkHref',
              'selector': "a[href*='vtex.com']",
              'contains': true,
              'value': 'www.vtex.com'
            }]
          };

          console.log(`to save ${key}`);
          this[testRepo].save(test).then((resp) => {
            console.log(`${key} saved`);
            testsAdded.push(resp);

            let scheduleToSave = {
              active: true,
              user: 'vtex',
              testId: resp,
              scheduleDate: new Date(),
              period: 30
            };

            this[scheduleRepo].save(scheduleToSave).then((resp) => {
              console.log(`${key} schedule saved`);
            }).catch((err) => {
              console.log('error on save schedule');
            }).fin(() => {
              def.resolve();
            });
          }).catch((err) => {
            console.log('error on save test');
            def.resolve();
          });
        }
        else {
          def.resolve();
        }
        return def.promise;
      });
    });

    starterDefer.resolve();
  }
}
