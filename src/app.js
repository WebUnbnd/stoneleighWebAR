import Auth from '@aws-amplify/auth';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
import aws_exports from './aws-exports';

import { XR as AwsXR } from 'aws-amplify';
import scene1Config from './sumerian-exports';

Amplify.configure(aws_exports);

Auth.configure(awsconfig);

AwsXR.configure({
  SumerianProvider: {
    region: 'ap-southeast-2', // Sumerian region
    scenes: {
      "scene1": { // Friendly scene name
        sceneConfig: scene1Config // Scene configuration from Sumerian publish
      }
    },
  }
});
1
let xrready = false

const isXrReady = () => {
  return xrready
}

async function loadAndStartScene() {
  await AwsXR.loadScene('scene1', 'sumerian-scene-dom-id')

  const world = AwsXR.getSceneController('scene1').sumerianRunner.world

  window.sumerian.SystemBus.addListener('xrready', () => {
    // Both Sumerian scene and camera have loaded.
    xrready = true
  })
  window.sumerian.SystemBus.addListener('xrerror', (params) => {
    // Custom error handling through Sumerian SystemBus.
  })

  XR.addCameraPipelineModules([  // Add camera pipeline modules.
    // Existing pipeline modules.
    XRExtras.AlmostThere.pipelineModule(),       // Detects unsupported browsers and gives hints.
    XRExtras.Loading.pipelineModule(),           // Manages the loading screen on startup.
    XRExtras.RuntimeError.pipelineModule(),      // Shows an error image on runtime error.
  ])
  
  XRExtras.Loading.setAppLoadedProvider(isXrReady)  

  window.XR.Sumerian.addXRWebSystem(world)

  const handleClickEvent = (e) => {
    if (!e.touches || e.touches.length < 2) {
      return;
    }
    if (e.touches.length == 2) {
      window.sumerian.SystemBus.emit('recenter')
    }
  }

  const sumerianContainer = document.getElementById('sumerian-app')

  if (sumerianContainer) {
    sumerianContainer.addEventListener('touchstart', handleClickEvent, true)
  }
  
  /*window.sumerian.SystemBus.addListener('xrimageloading', (detail) => {
    console.log('Image loading \n' + detail)
  })

  window.sumerian.SystemBus.addListener('xrimagescanning', (detail) => {
    console.log('Image scanning \n' + detail.data)
  })*/

  window.sumerian.SystemBus.addListener('xrimagefound', (detail) => {
    setTimeout(function(){
      document.getElementById('show-button').classList.add("is-visible")
      document.getElementById('imageReader').classList.add('no-visible')
    }, 2000)


  })

  AwsXR.start('scene1')
}

// Show loading screen before the full XR library has been loaded.
window.onload = () => { XRExtras.Loading.showLoading({onxrloaded: loadAndStartScene}) }

/** 
 * Functionalities
 */

document.getElementById('show-button').addEventListener('touchstart', function(){
  document.getElementById('show-button').classList.remove("is-visible")
 
  setTimeout(function(){
    window.sumerian.SystemBus.emit('spawn')
  }, 500)

  setTimeout(function(){
    document.getElementById('recenter').classList.add("is-visible")
  }, 1000)

  setTimeout(function(){
    document.getElementById('buy-me').classList.add('is-visible')
  }, 3000)
})


document.getElementById('recenter').addEventListener('touchstart', function(){
  window.sumerian.SystemBus.emit('spawn')
  window.sumerian.SystemBus.emit('recenter')
}) 


