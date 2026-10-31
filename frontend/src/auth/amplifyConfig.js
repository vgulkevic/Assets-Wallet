import {Amplify} from 'aws-amplify';
import {USER_POOL_CLIENT_ID, USER_POOL_ID} from "../profile";

export default function configureAmplify() {
    Amplify.configure({
        Auth: {
            Cognito: {
                userPoolId: USER_POOL_ID,
                userPoolClientId: USER_POOL_CLIENT_ID,
            }
        }
    });
}
