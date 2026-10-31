const LOCAL = import.meta.env.VITE_STAGE === "local";
const BASE_API_URL = import.meta.env.VITE_API_URL;
const AWS_REGION = import.meta.env.VITE_REGION;
const USER_POOL_ID = import.meta.env.VITE_USER_POOL_ID;
const USER_POOL_CLIENT_ID = import.meta.env.VITE_USER_POOL_CLIENT_ID;

export {LOCAL, BASE_API_URL, AWS_REGION, USER_POOL_ID, USER_POOL_CLIENT_ID};
