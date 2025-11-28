import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

import serviceAccount from '../../../../keys/easyquiz-auth-firebase-adminsdk.json';

const params = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url,
};

!admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(params),
    })
  : admin.app();

//initialize firebase auth
const auth = getAuth();

export { admin, auth };
