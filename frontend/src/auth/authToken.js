import {fetchAuthSession} from "aws-amplify/auth";
import {LOCAL} from "../profile";

// Amplify refreshes the id token here if it has expired
export async function getIdToken() {
    if (LOCAL) {
        return undefined;
    }
    const {tokens} = await fetchAuthSession();
    return tokens?.idToken?.toString();
}
