'use strict';

const {SNS} = require('aws-sdk');
const sns = new SNS();

class EventPublisher {
  topicArn;

  constructor(topicArn) {
    this.topicArn = topicArn;
  }

  static of(topicArn) {
    return new EventPublisher(topicArn);
  }

  /**
   * Publish a message event to AWS using SNS
   * @param message - Event message to be sent to the cloud,
   * must be convertible to JSON
   * @returns {Promise<*>}
   */
  async publish(message) {
    const payload = {
      default: JSON.stringify(message),
    };

    return sns.publish({
      Message: JSON.stringify(payload),
      MessageStructure: 'json',
      TopicArn: this.topicArn,
    }).promise();
  }
}

module.exports = {EventPublisher}
