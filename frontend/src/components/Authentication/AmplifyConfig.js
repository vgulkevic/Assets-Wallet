import {Amplify} from 'aws-amplify';
import {AWS_REGION, USER_POOL_CLIENT_ID, USER_POOL_ID} from "../../profile";

export default function configureAmplify() {
    Amplify.configure({
        Auth: {
            region: AWS_REGION,
            userPoolId: USER_POOL_ID,
            userPoolWebClientId: USER_POOL_CLIENT_ID,
        }
    });
}