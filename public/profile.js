'use strict';
var profilepicture = document.getElementById('profilepicture');
var userName = document.getElementById('username');
var userDescription = document.getElementById('userdescription');
var pointscount = document.getElementById('pointscount');
var postscount = document.getElementById('postscount');
var answerscount = document.getElementById('answerscount');

var edit = document.getElementById('edit');


var commentssection = document.getElementById('commentssection');

const auth = firebase.auth();
var userdata;
const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');


var signOutBtn = document.getElementById('signOutBtn');

const provider = new firebase.auth.GoogleAuthProvider();
var userDetails = document.getElementById('userDetails')
var userpfp = document.getElementById('userpfp')
var profilepicture = document.getElementById('profilepicture')
var profile = document.getElementById('profile')

var db = firebase.firestore()
var remakelink = document.getElementById('remakelink')
// the real thing that actually happens
var userdata;
var foreignuserdata;
auth.onAuthStateChanged((user) => {
  if (user) {
    remakelink.onclick = () => { window.location.replace("feed.html") }
    db.collection('Users').doc(user.email).get().then((doc) => {
      if (doc.exists) {
        userdata = doc.data();
        console.log(userdata);
        userpfp.src = userdata.photoURL;
        console.log(user.uid);
        document.getElementById('signOutBtn').addEventListener('click', () => {
          auth.signOut();
        })

        // code runs when signed in

        
        var anyuser = localStorage.getItem('userprofile')
        console.log(anyuser)
        userpfp.addEventListener('click', () => {
          console.log(user.email)
          localStorage.setItem('userprofile', user.email)
          window.location.replace('profile.html')
        })
        db.collection('Users').doc(anyuser).get()
          .then((doc) => {
            foreignuserdata = doc.data()
            console.log(foreignuserdata)
            profilepicture.src = foreignuserdata.photoURL;
            postscount.innerHTML = foreignuserdata.postscount;
            answerscount.innerHTML = foreignuserdata.commentscount;
            pointscount.innerHTML = foreignuserdata.pointscount;
            userName.innerHTML = foreignuserdata.name;
            userDescription.innerHTML = foreignuserdata.description;
            console.log(user.uid);
            if (foreignuserdata.email == userdata.email) {
              edit.hidden = false;

              // TODO: create a modal box popup when the thing is clicked. 
              // TODO: In the modal box you can edit ur properties then click "exit"
              var modal = document.getElementById('myModal')
              var submitbtn = document.getElementById('submit');
              var span = document.getElementsByClassName("close")[0];

              edit.onclick = () => {
                modal.style.display = "block";
                document.getElementById('inputusername').value = foreignuserdata.name
                document.getElementById('inputuserdescription').value = foreignuserdata.description
              }
              submitbtn.addEventListener('click', () => {

                db.collection("Users").doc(userdata.email).update({
                  name: document.getElementById('inputusername').value,
                  description: document.getElementById('inputuserdescription').value
                }).then(() => {
                  console.log("Success! updated the stuff")
                  // updating the name on the posts document
                  db.collection("posts").where("User", "==", userdata.email).get()
                  .then((querySnapshot) => {
                      querySnapshot.forEach((doc) => {
                          // doc.data() is never undefined for query doc snapshots
                          console.log(doc.id, " => ", doc.data());
                          db.collection("posts").doc(doc.id).update({
                            name: document.getElementById('inputusername').value
                          })
                      })
                      document.getElementById('alert').hidden = false;
                  })

                  .catch((error) => {
                      console.log("Error getting documents: ", error);
                  });


                }).catch((error) => {
                  console.error("welp theres an error, heres the error:", error)
                })
                
              })
              span.onclick = () => {
                modal.style.display = "none";
              }
              // When the user clicks anywhere outside of the modal, close it
              window.onclick = (event) => {
                if (event.target == modal) {
                  modal.style.display = "none";
                }
              }

            }
          })

      }
    })

  } else {
    // code runs when signed out
    window.location.replace("index.html");
  }
})
