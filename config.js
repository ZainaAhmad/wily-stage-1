import firebase from 'firebase'
require('@firebase/firestore')
var firebaseConfig = {
    apiKey: "AIzaSyDPiWW9A5h6QA_F01DLm30_s3m6SwVEMUs",
    authDomain: "wily-9634d.firebaseapp.com",
    projectId: "wily-9634d",
    storageBucket: "wily-9634d.appspot.com",
    messagingSenderId: "359618646342",
    appId: "1:359618646342:web:c1091256017b9b2bfcd547"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore()