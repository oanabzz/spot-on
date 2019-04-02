const applicationServerPublicKey = 'BKvn4XSfj7kKnY3a2tdT3fUCRmglrFX3ba8DtEwc5-WqLkNokuIoiiOardgnxQNlmVRA7GcprEm-a4RBh7Z_fj8';

const pushButton = document.querySelector('.js-push-btn');

let browserSubscription = null;

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('js/serviceWorker.js')
  .then(function(swReg) {
    console.log('Service Worker is registered', swReg);

    swRegistration = swReg;
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');

    console.log(JSON.stringify(subscription));
    updateSubscription(JSON.stringify(subscription));

    browserSubscription = subscription;
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
  });
}

function unsubscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  
  browserSubscription.unsubscribe()
    .then(function(unsubscribed) {
      if(unsubscribed) {
        console.log('User successfully unsubscribed.');
        updateSubscription(null);

        browserSubscription = null;
      } else {
        console.log('Could not unsubscribe user.');
      }
    })
    .catch(function(err) {
      console.log('Failed to unsubscribe the user: ', err);
    });

  // navigator.permissions.revoke({ name: 'notifications'})
  //   .then(function(response) {
  //     console.log('Permissions revoked');
  //   });
  // posibil doar in FireFox...
}

function checkSubscription() {
  if(swRegistration) {
    swRegistration.pushManager.getSubscription().then(function(subscription) {

      if(subscription == null) {
        permissionNotGranted();
        checkSubscriptionFromServer();
      } else {
        permissionGranted();
        browserSubscription = subscription;
      }

    });
  }
}

window.addEventListener('load', function(event) {
  checkSubscription();
});