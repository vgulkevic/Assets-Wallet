'use strict';

const {SNSClient, PublishCommand} = require('@aws-sdk/client-sns');
const sns = new SNSClient({});

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

    return sns.send(new PublishCommand({
      Message: JSON.stringify(payload),
      MessageStructure: 'json',
      TopicArn: this.topicArn,
    }));
  }
}

module.exports = {EventPublisher}
