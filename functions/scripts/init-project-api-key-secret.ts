/**
 * Sets the cloud project secret for the Calendar API key.
 * This script is designed to be run from the command line.
 */
/* 
// Initialise the Secret Manager API for your project:
https://console.developers.google.com/apis/api/secretmanager.googleapis.com/overview

# Usage:

cd functions

PROJECT_ID=
API_KEY_STRING=

npx ts-node scripts/init-project-api-key-secret.ts \
  --projectId $PROJECT_ID \
  --keyString $API_KEY_STRING
*/

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const SECRET_ID = 'GOOGLE_CALENDAR_API_KEY';

/**
 * Creates a secret if it doesn't exist, and adds a new version with the provided key.
 * It will also disable all other existing versions of the secret.
 *
 * @param {string} projectId The Google Cloud project ID.
 * @param {string} keyString The API key to store in the secret.
 */
async function setApiKeySecret(
  projectId: string,
  keyString: string
): Promise<void> {
  const client = new SecretManagerServiceClient();
  const parent = `projects/${projectId}`;
  const secretPath = `${parent}/secrets/${SECRET_ID}`;

  console.log(`Checking for secret: ${secretPath}`);

  try {
    // Check if the secret exists.
    await client.getSecret({ name: secretPath });
    console.log('Secret already exists.');
  } catch (error: any) {
    // If the secret does not exist, create it.
    if (error.code === 5) {
      // 5 = NotFound
      console.log('Secret not found, creating new secret...');
      await client.createSecret({
        parent: parent,
        secretId: SECRET_ID,
        secret: {
          replication: {
            automatic: {},
          },
        },
      });
      console.log('Secret created.');
    } else {
      console.error('Error checking for secret:', error.message);
      throw error;
    }
  }

  // Add a new secret version.
  console.log('Adding new secret version...');
  const [version] = await client.addSecretVersion({
    parent: secretPath,
    payload: {
      data: Buffer.from(keyString, 'utf8'),
    },
  });
  console.log(`Added new secret version: ${version.name}`);

  // Disable all other versions.
  console.log('Disabling other secret versions...');
  const [versions] = await client.listSecretVersions({ parent: secretPath });
  let disabledCount = 0;
  for (const v of versions) {
    if (v.name !== version.name && v.state === 'ENABLED') {
      await client.disableSecretVersion({ name: v.name });
      console.log(`Disabled secret version: ${v.name}`);
      disabledCount++;
    }
  }
  console.log(`Disabled ${disabledCount} other version(s).`);

  // Access the secret version to verify.
  console.log('Verifying secret version...');
  const [accessResponse] = await client.accessSecretVersion({
    name: version.name,
  });

  const responsePayload = accessResponse.payload?.data
    ? Buffer.from(accessResponse.payload.data).toString('utf8')
    : undefined;
  if (responsePayload === keyString) {
    console.log('Verification successful. The secret is set correctly.');
    console.log(`Payload: ${responsePayload}`);
  } else {
    console.log(`Payload: ${responsePayload}`);
    throw new Error('Verification failed. The secret was not set correctly.');
  }
}

/**
 * Main function to parse arguments and run the script.
 */
async function main() {
  const argv = await yargs(hideBin(process.argv))
    .usage(
      'Usage: $0 --projectId <your-gcp-project-id> --keyString <your-api-key>'
    )
    .option('projectId', {
      describe: 'Your Google Cloud project ID',
      type: 'string',
      demandOption: true,
      alias: 'p',
    })
    .option('keyString', {
      describe: 'The API key to set as the secret value',
      type: 'string',
      demandOption: true,
      alias: 'k',
    })
    .help()
    .alias('help', 'h')
    .strict().argv;

  try {
    await setApiKeySecret(argv.projectId, argv.keyString);
    console.log('\nScript finished successfully.');
  } catch (error) {
    console.error(
      '\nAn error occurred during script execution:',
      (error as Error).message
    );
    process.exit(1);
  }
}

main();
