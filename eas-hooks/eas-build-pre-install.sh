#!/bin/bash
set -e
echo 'tminus: Setting up iOS signing credentials from EAS secrets...'
mkdir -p certs
node -e "
const fs = require('fs');
fs.writeFileSync('certs/distribution.p12',
  Buffer.from(process.env.TMINUS_DIST_P12_B64 || '', 'base64'));
fs.writeFileSync('certs/profile.mobileprovision',
  Buffer.from(process.env.TMINUS_PROVISIONING_PROFILE_B64 || '', 'base64'));
const creds = {
  ios: {
    distributionCertificate: {
      path: 'certs/distribution.p12',
      password: process.env.TMINUS_DIST_P12_PASSWORD || ''
    },
    provisioningProfilePath: 'certs/profile.mobileprovision'
  }
};
fs.writeFileSync('credentials.json', JSON.stringify(creds, null, 2));
console.log('tminus: iOS signing credentials ready');
"
