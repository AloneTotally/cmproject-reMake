// basically whats in UserAuth.js
'use strict';
const auth = firebase.auth();
const user = auth.currentUser;
const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

const provider = new firebase.auth.GoogleAuthProvider();
const mainStorageRef = firebase.storage().ref();
var profilelink = document.getElementById('profile-link')
var userdata;
var userDetails = document.getElementById('userDetails')
var userpfp = document.getElementById('userpfp')
var remakelink = document.getElementById('remakelink')
// the real thing that actually happens
var db = firebase.firestore();
auth.onAuthStateChanged((user) => {
    if (user) {
        // code runs when signed in
        remakelink.onclick = () => { window.location.replace("feed.html") }
        console.log(user.uid);
        var userdata;
        db.collection('Users').doc(user.email).get().then((doc) => {
            if (doc.exists) {
                userdata = doc.data();
                profilelink.addEventListener('click', () => {
                    localStorage.setItem('userprofile', user.email)
                })
                userpfp.src = userdata.photoURL;
                userpfp.addEventListener('click', () => {
                    localStorage.setItem('userprofile', user.email)
                    window.location.replace("profile.html");
                })
                document.getElementById('signOutBtn').addEventListener('click', () => {
                    auth.signOut();
                  })


                //-------------------------------------------------------------------------------------------------------------
                // UPLOADING ACTUAL FILE ONTO FIREBASE STORAGE
                //-------------------------------------------------------------------------------------------------------------

                var progressbar = document.getElementById('progressbar');
                var filebtn = document.getElementById('filebtn');
                var preview = document.getElementById('preview')
                var image;
                var file;
                var filemetadata;
                var uploadTask;
                filebtn.addEventListener('change', (event) => {
                    file = event.target.files[0];

                    // create a storage reference for the file
                    var storageRef = firebase.storage().ref('postimages/' + file.name);
                    uploadTask = storageRef.put(file);

                    uploadTask.on('state_changed', (snapshot) => {
                        // Observe state change events such as progress, pause, and resume
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        progressbar.value = progress
                        switch (snapshot.state) {
                            case firebase.storage.TaskState.PAUSED: // or 'paused'
                                console.log('Upload is paused');
                                break;
                            case firebase.storage.TaskState.RUNNING: // or 'running'
                                console.log('Upload is running');
                                break;
                        }
                    },
                        (error) => {
                            // Handle unsuccessful uploads
                            console.log('rip, ur file not uploaded,', error);
                        },
                        () => {
                            // Handle successful uploads on complete
                            // For instance, get the download URL: https://firebasestorage.googleapis.com/...


                            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                                console.log('File available at', downloadURL);
                                image = downloadURL;
                                preview.src = downloadURL;
                                preview.hidden = false;
                            });

                            uploadTask.snapshot.ref.getMetadata().then((metadata) => {
                                filemetadata = metadata;
                                console.log(metadata);
                            }).catch((error) => {
                                console.log("Uh-oh, an error occurred! " + error);
                            });
                        });
                })


                // uploading the file

                //-------------------------------------------------------------------------------------------------------------
                // UPLOADING DETAILS OF POST ONTO FIRESTORE
                //-------------------------------------------------------------------------------------------------------------

                var db = firebase.firestore();
                var postHeader = document.getElementById("postHeader");
                var postDescription = document.getElementById('postDescription');
                var submitbtn = document.getElementById('submitpost');
                submitbtn.addEventListener('click', () => {
                    if (postHeader.value && postDescription.value != '') {
                        // TODO: add field "x answers" in the object

                        console.log("Button has been clicked, very nice");

                        let postHeaderInput = postHeader.value;
                        let postDescriptionInput = postDescription.value;
                        var postDate = new Date()

                        console.log({
                            postDate: postDate.toString(),
                            year: postDate.getFullYear(),
                            month: postDate.getMonth(),
                            day: postDate.getDate(),
                            hour: postDate.getHours(),
                            minute: postDate.getMinutes(),
                            seconds: postDate.getSeconds()
                        })

                        // If there is an image
                        if (image != undefined) {
                            db.collection('posts').doc(postHeaderInput).set({
                                Header: postHeaderInput,
                                Description: postDescriptionInput,
                                created: {
                                    postDate: postDate.toString(),
                                    year: postDate.getFullYear(),
                                    month: postDate.getMonth(),
                                    day: postDate.getDate(),
                                    hour: postDate.getHours(),
                                    minute: postDate.getMinutes()
                                },
                                since1970: postDate.getTime(),
                                User: user.email,
                                userpfp: user.photoURL,
                                name: userdata.name,
                                file: image,
                                answers: 0
                            }).then(() => {
                                console.log("ay done")
                                var newpostcount = parseInt(userdata.postscount)
                                console.log(newpostcount)
                                newpostcount += 1
                                console.log(newpostcount)
                                document.getElementById("alert").hidden = false
                                db.collection("Users").doc(userdata.email).update({
                                    postscount: newpostcount
                                })

                            }).catch((error) => {
                                console.error("Error writing document.", error)
                            })

                        } else if (progressbar.value == 0) {
                            // if there is NO image

                            db.collection('posts').doc(postHeaderInput).set({
                                Header: postHeaderInput,
                                Description: postDescriptionInput,
                                created: {
                                    postDate: postDate.toString(),
                                    year: postDate.getFullYear(),
                                    month: postDate.getMonth(),
                                    day: postDate.getDate(),
                                    hour: postDate.getHours(),
                                    minute: postDate.getMinutes()
                                },
                                since1970: postDate.getTime(),
                                User: user.email,
                                userpfp: userdata.photoURL,
                                name: userdata.name,
                                answers: 0

                            }).then(() => {
                                console.log("ay done")
                                var newpostcount = parseInt(userdata.postscount)
                                console.log(newpostcount)
                                newpostcount += 1
                                console.log(newpostcount)
                                document.getElementById("alert").hidden = false
                                db.collection("Users").doc(userdata.email).update({
                                    postscount: newpostcount
                                })
                            }).catch((error) => {
                                console.error("Error writing document.", error)
                            });
                        };
                    }
                })
            }
        })

    } else {
        // code runs when signed out
        window.location.replace("index.html");
    }
});