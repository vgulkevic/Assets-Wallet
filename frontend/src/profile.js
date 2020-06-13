const LOCAL = process.env.REACT_APP_STAGE === "local";
const BASE_API_URL = process.env.REACT_APP_API_URL || "https://798ohpokhl.execute-api.eu-west-2.amazonaws.com/prod/";
const AWS_REGION = process.env.REACT_APP_REGION || "eu-west-2";
const USER_POOL_ID = process.env.REACT_APP_USER_POOL_ID || "eu-west-2_3ngZJklRB";
const USER_POOL_CLIENT_ID = process.env.REACT_APP_USER_POOL_CLIENT_ID || "2e7vtesvttn2fc7m5ojq3f7kri";

export {LOCAL, BASE_API_URL, AWS_REGION, USER_POOL_ID, USER_POOL_CLIENT_ID};
