import {fetchAuthSession} from "aws-amplify/auth";

// Amplify refreshes the id token here if it has expired
export async function getIdToken() {
    const {tokens} = await fetchAuthSession();
    return tokens?.idToken?.toString();
}
