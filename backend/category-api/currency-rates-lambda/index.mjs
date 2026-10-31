import {SSMClient, GetParameterCommand} from '@aws-sdk/client-ssm';

const ssm = new SSMClient({});
const CORS_HEADERS = {
  "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Authorization",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
};

let fxApiKey;

async function getFxApiKey() {
  if (!fxApiKey) {
    const res = await ssm.send(new GetParameterCommand({Name: process.env.FX_API_KEY_PARAMETER, WithDecryption: true}));
    fxApiKey = res.Parameter.Value;
  }
  return fxApiKey;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {body: "", statusCode: 200, headers: CORS_HEADERS};
  }

  try {
    const source = encodeURIComponent(JSON.parse(event.body).baseCurrency);
    const apiKey = await getFxApiKey();
    // exchangerate.host only serves plain http on the free plan
    const res = await fetch(`http://api.exchangerate.host/live?access_key=${apiKey}&currencies=GBP,USD,EUR&source=${source}`);
    const apiResponse = await res.json();

    return {statusCode: 200, body: JSON.stringify(apiResponse), headers: CORS_HEADERS};
  } catch (e) {
    console.log(e);
    return {statusCode: 500, body: JSON.stringify("Error calling the external API"), headers: CORS_HEADERS};
  }
};
