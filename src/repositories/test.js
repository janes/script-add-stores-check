'use strict';

import BaseRepository from './base'
import q from 'q'

export default class TestRepository extends BaseRepository {
  constructor(config) {
    super(config);
    this.collection = 'tests';
  }
}
