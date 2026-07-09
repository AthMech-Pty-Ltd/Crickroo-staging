import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
import Config from 'react-native-config';

const WEB_CLIENT_ID = Config.GOOGLE_WEB_CLIENT_ID;

export type SocialProvider = 'google' | 'apple';

export class SocialSignInCancelledError extends Error {
  constructor() {
    super('Social sign-in cancelled by user');
    this.name = 'SocialSignInCancelledError';
  }
}

export const configureGoogleSignin = (): void => {
  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
};

const googleFirebaseIdToken = async (): Promise<string> => {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  try {
    await GoogleSignin.signOut();
  } catch {}
  let signInResult;
  try {
    signInResult = await GoogleSignin.signIn();
  } catch (e: any) {
    if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new SocialSignInCancelledError();
    }
    throw e;
  }

  if ((signInResult as any)?.type === 'cancelled') {
    throw new SocialSignInCancelledError();
  }

  const googleIdToken =
    (signInResult as any)?.data?.idToken ?? (signInResult as any)?.idToken;
  if (!googleIdToken) {
    throw new Error('Google did not return an idToken');
  }

  const credential = auth.GoogleAuthProvider.credential(googleIdToken);
  const userCred = await auth().signInWithCredential(credential);
  return userCred.user.getIdToken();
};

const appleFirebaseIdToken = async (): Promise<string> => {
  let appleResponse;
  try {
    appleResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
  } catch (e: any) {
    if (e?.code === appleAuth.Error.CANCELED) {
      throw new SocialSignInCancelledError();
    }
    throw e;
  }

  const { identityToken, nonce } = appleResponse;
  if (!identityToken) {
    throw new Error('Apple did not return an identity token');
  }

  const credential = auth.AppleAuthProvider.credential(identityToken, nonce);
  const userCred = await auth().signInWithCredential(credential);
  return userCred.user.getIdToken();
};

export const getFirebaseIdToken = (provider: SocialProvider): Promise<string> =>
  provider === 'google' ? googleFirebaseIdToken() : appleFirebaseIdToken();

export const socialSignOut = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
  } catch {}
  try {
    await auth().signOut();
  } catch {}
};
