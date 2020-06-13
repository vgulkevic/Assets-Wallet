'use strict';

const {SSM} = require('aws-sdk');
const ssm = new SSM();

class ParameterStore {

  /**
   * Put parameter into SSM
   * @param {string} key
   * @param {string} value
   * @returns {Promise<PromiseResult<SSM.PutParameterResult, AWSError>>}
   */
  async put(key, value) {
    const params = {
      Name: key,
      Type: 'SecureString',
      Value: value,
      Overwrite: true
    };

    return ssm.putParameter(params).promise();
  }

  /**
   * Get parameter from SSM
   * @param {string} key
   * @returns {Promise<PromiseResult<unknown, unknown>>}
   */
  async get(key) {
    const params = {
      Name: key,
      WithDecryption: true
    };

    return ssm.getParameter(params).promise();
  }

  /**
   * Retrieves parameters for specified keys
   * Values will be returned in insertion order of the keys
   * @param {...string} keys
   * @returns {Promise<string[]>}
   */
  async getParameters(...keys) {
    const promises = keys.map(key => this.get(key));
    const all = await Promise.all(promises);
    return all.map(p => p.Parameter.Value);
  }
}

module.exports = {ParameterStore}
