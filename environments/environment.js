// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyAfYQfWlpMx3H6aOZ6pkEnWEM4QK00-Bvs",
    authDomain: "mgoos-mvp.firebaseapp.com",
    databaseURL: "https://mgoos-mvp.firebaseio.com",
    projectId: "mgoos-mvp",
    storageBucket: "mgoos-mvp.appspot.com",
    messagingSenderId: "949519506589"
  }
};