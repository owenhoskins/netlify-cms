import React from 'react';
import ReactDOM from 'react-dom';
import { loadScript } from 'netlify-cms-lib-util';
import { Iterable } from 'immutable';
import { attachReducer } from './attachReducer';
import { addFile, persistFiles } from './actions';

import MediaLibrary from './components/MediaLibrary';
import store from 'Redux';
import { applyGlobalStyle } from './applyGlobalStyle';
import { isFileGroup } from './util';

attachReducer();
applyGlobalStyle();

/**
 * Default Uploadcare widget configuration, can be overriden via config.yml.
 */
const defaultConfig = {
  previewStep: true,
  tabs: 'mediaLibrary file',
};

/**
 * Returns a fileGroupInfo object wrapped in a promise-like object.
 */
function getFileGroup(files) {
  /**
   * Capture the group id from the first file in the files array.
   */
  const groupId = new RegExp(`^.+/([^/]+~${files.length})/nth/`).exec(files[0])[1];

  /**
   * The `openDialog` method handles the jQuery promise object returned by
   * `fileFrom`, but requires the promise returned by `loadFileGroup` to provide
   * the result of it's `done` method.
   */
  return new Promise(resolve =>
    window.uploadcare.loadFileGroup(groupId).done(group => resolve(group)),
  );
}

/**
 * Convert a url or array/List of urls to Uploadcare file objects wrapped in
 * promises, or Uploadcare groups when possible. Output is wrapped in a promise
 * because the value we're returning may be a promise that we created.
 */
function getFiles(value, cdnBase) {
  if (Array.isArray(value) || Iterable.isIterable(value)) {
    const arr = Array.isArray(value) ? value : value.toJS();
    return isFileGroup(arr) ? getFileGroup(arr) : arr.map(val => getFile(val, cdnBase));
  }
  return value && typeof value === 'string' ? getFile(value, cdnBase) : null;
}

/**
 * Convert a single url to an Uploadcare file object wrapped in a promise-like
 * object. Group urls that get passed here were not a part of a complete and
 * untouched group, so they'll be uploaded as new images (only way to do it).
 */
function getFile(url, cdnBase) {
  const groupPattern = /~\d+\/nth\/\d+\//;
  const baseUrls = ['https://ucarecdn.com', cdnBase].filter(v => v);
  const uploaded = baseUrls.some(baseUrl => url.startsWith(baseUrl) && !groupPattern.test(url));
  return window.uploadcare.fileFrom(uploaded ? 'uploaded' : 'url', url);
}

/**
 * Open the standalone dialog. A single instance is created and destroyed for
 * each use.
 */
function openDialog(files, config, handleInsert) {
  window.uploadcare.openDialog(files, config).done(({ promise }) =>
    promise()
      .then(fileInfo => {
        if (config.multiple) {
          const urls = Array.from(
            { length: fileInfo.count },
            (val, idx) => `${fileInfo.cdnUrl}nth/${idx}/`,
          );
          handleInsert(urls);
        } else {
          handleInsert(fileInfo.cdnUrl);
        }

        return fileInfo;
      })
      .then(fileInfo => store.dispatch(addFile(fileInfo)))
      .then(() => store.dispatch(persistFiles())),
  );
}

/**
 * Initialization function will only run once, returns an API object for Netlify
 * CMS to call methods on.
 */
async function init({ options = { config: {} }, handleInsert }) {
  const { publicKey, ...globalConfig } = options.config;
  const baseConfig = { ...defaultConfig, ...globalConfig };

  window.UPLOADCARE_LIVE = false;
  window.UPLOADCARE_MANUAL_START = true;
  window.UPLOADCARE_PUBLIC_KEY = publicKey;

  /**
   * Loading scripts via url because the uploadcare widget includes
   * non-strict-mode code that's incompatible with our build system
   */
  await loadScript('https://unpkg.com/uploadcare-widget@^3.6.0/uploadcare.full.js');
  await loadScript(
    'https://unpkg.com/uploadcare-widget-tab-effects@^1.2.1/dist/uploadcare.tab-effects.js',
  );

  /**
   * Register the effects tab by default because the effects tab is awesome. Can
   * be disabled via config.
   */
  window.uploadcare.registerTab('preview', window.uploadcareTabEffects);

  /**
   * Register custom tab.
   */

  function mediaLibrary(container, button, dialogApi, settings) {
    // Set Tab button title attribute
    button[0].setAttribute('title', 'Media Library');
    button[0]
      .querySelector('use')
      .setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#uploadcare--icon-menu');

    console.log('mediaLibrary registered: ', ReactDOM);

    ReactDOM.render(
      <MediaLibrary store={store} dialogApi={dialogApi} settings={settings} />,
      container[0],
    );

    // Files panel
    /*
    settings.mediaLibrary.forEach((item, i) => {

      // create and append element
      const img = document.createElement('img')
      img.setAttribute('src', settings.cdnBase + '/' + item.uuid + '/-/stretch/off/-/scale_crop/280x280/center/')
      img.setAttribute('class', 'mediaLibrary-card')
      container[0].appendChild(img)

      img.addEventListener('click', (e) => {
        dialogApi.addFiles([window.uploadcare.fileFrom('uploaded', item.uuid, settings)])
      })
    })
    */
  }

  window.uploadcare.registerTab('mediaLibrary', mediaLibrary);

  return {
    /**
     * On show, create a new widget, cache it in the widgets object, and open.
     * No hide method is provided because the widget doesn't provide it.
     */
    show: async ({ value, config: instanceConfig = {}, imagesOnly }) => {
      const config = { ...baseConfig, imagesOnly, ...instanceConfig };
      const files = getFiles(value);

      /**
       * Resolve the promise only if it's ours. Only the jQuery promise objects
       * from the Uploadcare library will have a `state` method.
       */
      if (files && !files.state) {
        files.then(result => openDialog(result, config, handleInsert));
      } else {
        openDialog(files, config, handleInsert);
      }
    },

    /**
     * Uploadcare doesn't provide a "media library" widget for viewing and
     * selecting existing files, so we return `false` here so Netlify CMS only
     * opens the Uploadcare widget when called from an editor control. This
     * results in the "Media" button in the global nav being hidden.
     */
    enableStandalone: () => true,
  };
}

/**
 * The object that will be registered only needs a (default) name and `init`
 * method. The `init` method returns the API object.
 */
const uploadcareMediaLibrary = { name: 'uploadcare', init };

export default uploadcareMediaLibrary;
