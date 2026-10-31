// Exchange rates from Frankfurter (ECB reference rates, no API key): https://frankfurter.dev
const SUPPORTED_CURRENCIES = ["GBP", "USD", "EUR"];
const CORS_HEADERS = {
  "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Authorization",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {body: "", statusCode: 200, headers: CORS_HEADERS};
  }

  try {
    const source = JSON.parse(event.body).baseCurrency;
    if (!SUPPORTED_CURRENCIES.includes(source)) {
      return {statusCode: 400, body: JSON.stringify(`Unsupported currency: ${source}`), headers: CORS_HEADERS};
    }

    const symbols = SUPPORTED_CURRENCIES.filter(c => c !== source).join(",");
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${source}&symbols=${symbols}`);
    if (!res.ok) {
      throw new Error(`Frankfurter responded with ${res.status}`);
    }
    const {date, rates} = await res.json();

    // keep the response shape the frontend's currency converter expects: {source, quotes: {GBPUSD: 1.27, ...}}
    const quotes = Object.fromEntries(Object.entries(rates).map(([currency, rate]) => [source + currency, rate]));

    return {statusCode: 200, body: JSON.stringify({success: true, source, date, quotes}), headers: CORS_HEADERS};
  } catch (e) {
    console.log(e);
    return {statusCode: 500, body: JSON.stringify("Error calling the external API"), headers: CORS_HEADERS};
  }
};
