import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = ({ url }) => {
  if (browser) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const accessToken = hashParams.get('access_token');
    const error = hashParams.get('error');
    const errorCode = hashParams.get('error_code');
    const errorDescription = hashParams.get('error_description');

    // Handle error cases
    if (error === 'access_denied' && errorCode === 'otp_expired') {
      throw redirect(303, `/reset-password/request?error=${error}&error_code=${errorCode}`);
    }

    // Handle missing access token
    if (!accessToken) {
      throw redirect(303, '/reset-password/access_denied?error=no_token');
    }

    return {
      accessToken,
      hash: window.location.hash
    };
  }

  return { accessToken: null, hash: null };
};
