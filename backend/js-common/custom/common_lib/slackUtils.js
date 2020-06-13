'use strict';

const qs = require('querystring');

class SlackUtils {

  static decodeSlackPayload(body) {
    try {
      const {payload} = qs.decode(body);
      const parsed = JSON.parse(payload);
      console.log(`Parsed slack payload:\n${JSON.stringify(parsed)}`);
      return parsed;
    } catch (e) {
      console.log(`Parsing error:\n${JSON.stringify(e)}`);
      throw e;
    }
  }

  static extractSingleAction(actions) {
    const [action] = actions;
    return JSON.parse(action.value);
  }

  static approvalRequestMessage(params) {
    return {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "New prospect!"
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Company:*\n${params.company}`
            },
            {
              type: "mrkdwn",
              text: `*Name:*\n${params.name}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Chosen services:*"
          }
        },
        {
          type: "section",
          fields: this.servicesBlock(params.services)
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Approve"
              },
              style: "primary",
              value: JSON.stringify({
                approve: true,
                taskToken: params.TaskToken
              })
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Reject"
              },
              style: "danger",
              value: JSON.stringify({
                approve: false,
                taskToken: params.TaskToken
              })
            }
          ]
        }
      ]
    }
  }

  /**
   * @param {Array<Object>} services
   * @return {*}
   */
  static servicesBlock(services) {
    return services.map(service => {
      return {
        type: "mrkdwn",
        text: `${service.name}`
      };
    });
  }
}

module.exports = {SlackUtils}
