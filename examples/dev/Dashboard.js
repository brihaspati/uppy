// The @uppy/ dependencies are resolved using aliasify
/* eslint-disable import/no-extraneous-dependencies */
const Uppy = require('@uppy/core/src')
const Dashboard = require('@uppy/dashboard/src')
const Instagram = require('@uppy/instagram/src')
const Facebook = require('@uppy/facebook/src')
const OneDrive = require('@uppy/onedrive/src')
const Dropbox = require('@uppy/dropbox/src')
const Box = require('@uppy/box/src')
const GoogleDrive = require('@uppy/google-drive/src')
const Unsplash = require('@uppy/unsplash/src')
const Zoom = require('@uppy/zoom/src')
const Url = require('@uppy/url/src')
const Webcam = require('@uppy/webcam/src')
const ScreenCapture = require('@uppy/screen-capture/src')
const GoldenRetriever = require('@uppy/golden-retriever/src')
const Tus = require('@uppy/tus/src')
const AwsS3 = require('@uppy/aws-s3/src')
const AwsS3Multipart = require('@uppy/aws-s3-multipart/src')
const XHRUpload = require('@uppy/xhr-upload/src')
const Transloadit = require('@uppy/transloadit/src')
const Form = require('@uppy/form/src')
const ImageEditor = require('@uppy/image-editor/src')
const DropTarget = require('@uppy/drop-target/src')
const Audio = require('@uppy/audio/src')
/* eslint-enable import/no-extraneous-dependencies */

// DEV CONFIG: pick an uploader

const UPLOADER = 'tus'
// const UPLOADER = 's3'
// const UPLOADER = 's3-multipart'
// xhr will use protocol 'multipart' in companion, if used with a remote service, e.g. google drive.
// If local upload will use browser XHR
// const UPLOADER = 'xhr'
// const UPLOADER = 'transloadit'
// const UPLOADER = 'transloadit-s3'
// const UPLOADER = 'transloadit-xhr'

// DEV CONFIG: Endpoint URLs

const COMPANION_URL = 'http://localhost:3020'
const TUS_ENDPOINT = 'https://tusd.tusdemo.net/files/'
const XHR_ENDPOINT = 'https://xhr-server.herokuapp.com/upload'

// DEV CONFIG: Transloadit keys

const TRANSLOADIT_KEY = '...'
const TRANSLOADIT_TEMPLATE = '...'
const TRANSLOADIT_SERVICE_URL = 'https://api2.transloadit.com'

// DEV CONFIG: enable or disable Golden Retriever

const RESTORE = false

// Rest is implementation! Obviously edit as necessary...

module.exports = () => {
  const uppyDashboard = new Uppy({
    logger: Uppy.debugLogger,
    meta: {
      username: 'John',
      license: 'Creative Commons',
    },
    allowMultipleUploadBatches: false,
    // restrictions: { requiredMetaFields: ['caption'] },
  })
    .use(Dashboard, {
      trigger: '#pick-files',
      // inline: true,
      target: '.foo',
      metaFields: [
        { id: 'license', name: 'License', placeholder: 'specify license' },
        { id: 'caption', name: 'Caption', placeholder: 'add caption' },
      ],
      showProgressDetails: true,
      proudlyDisplayPoweredByUppy: true,
      note: '2 files, images and video only',
    })
    .use(GoogleDrive, { target: Dashboard, companionUrl: COMPANION_URL })
    .use(Instagram, { target: Dashboard, companionUrl: COMPANION_URL })
    .use(Dropbox, { target: Dashboard, companionUrl: COMPANION_URL })
    .use(Box, { target: Dashboard, companionUrl: COMPANION_URL })
    .use(Facebook, { target: Dashboard, companionUrl: COMPANION_URL })
    .use(OneDrive, { target: Dashboard, companionUrl: COMPANION_URL })
    .use(Zoom, { target: Dashboard, companionUrl: COMPANION_URL })
    .use(Url, { target: Dashboard, companionUrl: COMPANION_URL })
    .use(Unsplash, { target: Dashboard, companionUrl: COMPANION_URL })
    .use(Webcam, {
      target: Dashboard,
      showVideoSourceDropdown: true,
      showRecordingLength: true,
    })
    .use(Audio, {
      target: Dashboard,
      showRecordingLength: true,
    })
    .use(ScreenCapture, { target: Dashboard })
    .use(Form, { target: '#upload-form' })
    .use(ImageEditor, { target: Dashboard })
    .use(DropTarget, {
      target: document.body,
    })

  switch (UPLOADER) {
    case 'tus':
      uppyDashboard.use(Tus, { endpoint: TUS_ENDPOINT, limit: 6 })
      break
    case 's3':
      uppyDashboard.use(AwsS3, { companionUrl: COMPANION_URL, limit: 6 })
      break
    case 's3-multipart':
      uppyDashboard.use(AwsS3Multipart, { companionUrl: COMPANION_URL, limit: 6 })
      break
    case 'xhr':
      uppyDashboard.use(XHRUpload, { endpoint: XHR_ENDPOINT, limit: 6, bundle: true })
      break
    case 'transloadit':
      uppyDashboard.use(Transloadit, {
        service: TRANSLOADIT_SERVICE_URL,
        waitForEncoding: true,
        params: {
          auth: { key: TRANSLOADIT_KEY },
          template_id: TRANSLOADIT_TEMPLATE,
        },
      })
      break
    case 'transloadit-s3':
      uppyDashboard.use(AwsS3, { companionUrl: COMPANION_URL })
      uppyDashboard.use(Transloadit, {
        waitForEncoding: true,
        importFromUploadURLs: true,
        params: {
          auth: { key: TRANSLOADIT_KEY },
          template_id: TRANSLOADIT_TEMPLATE,
        },
      })
      break
    case 'transloadit-xhr':
      uppyDashboard.setMeta({
        params: JSON.stringify({
          auth: { key: TRANSLOADIT_KEY },
          template_id: TRANSLOADIT_TEMPLATE,
        }),
      })
      uppyDashboard.use(XHRUpload, {
        method: 'POST',
        endpoint: 'https://api2.transloadit.com/assemblies',
        metaFields: ['params'],
        bundle: true,
      })
      break
    default:
  }

  if (RESTORE) {
    uppyDashboard.use(GoldenRetriever, { serviceWorker: true })
  }

  window.uppy = uppyDashboard

  uppyDashboard.on('complete', (result) => {
    if (result.failed.length === 0) {
      console.log('Upload successful 😀')
    } else {
      console.warn('Upload failed 😞')
    }
    console.log('successful files:', result.successful)
    console.log('failed files:', result.failed)
    if (UPLOADER === 'transloadit') {
      console.log('Transloadit result:', result.transloadit)
    }
  })

  const modalTrigger = document.querySelector('#pick-files')
  if (modalTrigger) modalTrigger.click()
}
