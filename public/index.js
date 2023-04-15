'use strict';

const auth = firebase.auth();
const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');
var userDetails = document.getElementById('userDetails')
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
var db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();


// the real thing that actually happens
signInBtn.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged((user) => {
  if (user) {
    // code runs when signed in
    whenSignedOut.hidden = true;
    whenSignedIn.hidden = false;
    console.log(user.uid);
    if (user !== null) {
      // The user object has basic properties such as display name, email, etc.
      user.providerData.forEach((profile) => {
        db.collection("Users").doc(profile.email).get()
          .then((doc) => {
            if (doc.exists) {
              var userdata = doc.data()
              console.log(userdata)
              document.getElementById('profilepicture').src = userdata.photoURL;
              document.getElementById('alert').hidden = false;

            } else if (doc.exists == false) {
              var signedIn = document.getElementById('signedin')
              var username = document.getElementById('username');
              var userdescription = document.getElementById('userdescription')
              var submitbtn = document.getElementById('submit');
              signedIn.hidden = false;
              submitbtn.addEventListener('click', () => {
                var newuserdata = {
                  name: username.value,
                  description: userdescription.value,
                  email: user.email,
                  photoURL: profile.photoURL,
                  userfirebaseid: user.uid,
                  pointscount: 0,
                  postscount: 0,
                  commentscount: 0
                }

                db.collection("Users").doc(profile.email).set(newuserdata).then(() => {
                  console.log("document successfully written!")
                  document.getElementById('alert').hidden = false;
                });
                
              });
            };
          });
      });
    }
  } else {
    // code runs when signed out
    whenSignedIn.hidden = true;
    whenSignedOut.hidden = false;
    userDetails.innerHTML = '';
  }
});