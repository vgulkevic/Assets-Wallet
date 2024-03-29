const LOCAL = process.env.REACT_APP_STAGE === "local";
const BASE_API_URL = process.env.REACT_APP_API_URL;
const AWS_REGION = process.env.REACT_APP_REGION;
const USER_POOL_ID = process.env.REACT_APP_USER_POOL_ID;
const USER_POOL_CLIENT_ID = process.env.REACT_APP_USER_POOL_CLIENT_ID;

const FX_API_KEY = process.env.REACT_APP_FX_API_KEY;

export {LOCAL, BASE_API_URL, AWS_REGION, USER_POOL_ID, USER_POOL_CLIENT_ID, FX_API_KEY};
