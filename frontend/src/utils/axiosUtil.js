import * as axios from "axios";

const client = axios.create({});

export function getHttpClient() {
    return client;
}
