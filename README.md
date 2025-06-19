# GoogleCalEventsViewer

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.14.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build:all
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Setup

### Google Cloud & Firebase

This project uses Google Cloud and Firebase.

```sh
gcloud config set project $PROJECT_ID
firebase auth
gcloud init
gcloud auth application-default login
```

### API Key Secrets

See [Secret Manager](https://console.developers.google.com/apis/api/secretmanager.googleapis.com/overview).

Set the calendar API key by running the command
```sh
firebase functions:secrets:set GOOGLE_CALENDAR_API_KEY
# You will then be asked to enter the API key secret, do that.

# You can preview the secret...
gcloud secrets versions access 5 --secret=GOOGLE_CALENDAR_API_KEY
```

### Client side envionment

Copy & fill out `src/environments/environment.ts`, saving it as
`src/environments/environment.prod.ts` and `src/environments/environment.dev.ts`

### Server side envionment

Copy & fill out `functions/src/environments/environment.template.ts`, saving it as
`functions/src/environments/environment.ts`.

### Cloud storage CORS settings

If you want to deploy the standalone webcomponent to a cloud storage web-bucket,
copy and edit the `src/environments/gcloud-cors-config.template.json` file to be
`src/environments/gcloud-cors-config.json`, then deploy the changes to cloud
with: 

```
BUCKET_NAME=...
gsutil cors set src/environments/gcloud-cors-config.json gs://${BUCKET_NAME}
gsutil cors get gs://${BUCKET_NAME}
```


## Deploy

### WebComponent to a Cloud Storage Bucket

Make the standalone web-component:

```
npm build:wc
```

Copy file to your cloud bucket...

```
BUCKET_NAME_AND_PATH=...

gcloud storage cp -R ./dist/google-cal-events-viewer/wc/* gs://${BUCKET_NAME_AND_PATH}
```

For testing, you can serve the standalone web-component for interactive testing:

```
npm start:wc
```

### Deploy to FireBase

```
npm run deploy
```
