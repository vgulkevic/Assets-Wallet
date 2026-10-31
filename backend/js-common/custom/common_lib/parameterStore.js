'use strict';

const {SSMClient, GetParameterCommand, PutParameterCommand} = require('@aws-sdk/client-ssm');
const ssm = new SSMClient({});

class ParameterStore {

  /**
   * Put parameter into SSM
   * @param {string} key
   * @param {string} value
   * @returns {Promise<import('@aws-sdk/client-ssm').PutParameterCommandOutput>}
   */
  async put(key, value) {
    const params = {
      Name: key,
      Type: 'SecureString',
      Value: value,
      Overwrite: true
    };

    return ssm.send(new PutParameterCommand(params));
  }

  /**
   * Get parameter from SSM
   * @param {string} key
   * @returns {Promise<import('@aws-sdk/client-ssm').GetParameterCommandOutput>}
   */
  async get(key) {
    const params = {
      Name: key,
      WithDecryption: true
    };

    return ssm.send(new GetParameterCommand(params));
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
