'use strict';

var db = firebase.firestore();
const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');

const signInBtn = document.getElementById('signInBtn');
var signOutBtn = document.getElementById('signOutBtn');

const provider = new firebase.auth.GoogleAuthProvider();
var userdata;
var userDetails = document.getElementById('userDetails')
var remakelink = document.getElementById('remakelink')
// the real thing that actually happens
signOutBtn.onclick = () => auth.signOut();

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // code runs when signed in
    remakelink.onclick = () => { window.location.replace("feed.html") }
    var userdata;
    db.collection('Users').doc(user.email).get().then((doc) => {
      if (doc.exists) {
        userdata = doc.data();
        console.log(userdata)
        document.getElementById('profilepicture').src = userdata.photoURL;
        document.getElementById('profilepicture').addEventListener('click', () => {
          localStorage.setItem('userprofile', user.email)
          window.location.replace("profile.html");
        })
        signOutBtn.addEventListener('click', () => {
          auth.signOut();
        })

        console.log(user.uid);

        var postimage;
        var title = document.getElementById('title');
        var description = document.getElementById('description');
        var image = document.getElementById('image');
        var postData;

        var addheader = localStorage.getItem("addheader");
        db.collection("posts").doc(addheader).get().then((doc) => {
          if (doc.exists) {
            console.log("Document data:", doc.data());
            postData = doc.data();

            title.style.fontSize = "50px";
            title.innerHTML = postData.Header;
            description.innerHTML = postData.Description;
            if (image != undefined) {
              image.hidden = false;
              console.log(postData.file);
              image.src = postData.file;
            }


            // comments section
            var comment = document.getElementById('comment');
            var submit = document.getElementById('submitcomment');


            // adding comment
            var progressbar = document.getElementById('progressbar');
            var filebtn = document.getElementById('filebtn');
            var preview = document.getElementById('preview')
            var file;

            var uploadTask;

            filebtn.addEventListener('change', function () {
              // getting the file
              file = event.target.files[0];

              // create a storage reference for the file
              var storageRef = firebase.storage().ref('postimages/' + file.name);

              // uploading the file
              uploadTask = storageRef.put(file);

              uploadTask.on('state_changed', (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
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
                    postimage = downloadURL;
                    preview.src = downloadURL;
                    preview.hidden = false
                  });

                }
              );
            });


            submit.addEventListener('click', () => {

              var newcomment = comment.value;
              var commentDate = new Date()
              var date = {
                postDate: commentDate.toString(),
                year: commentDate.getFullYear(),
                month: commentDate.getMonth(),
                day: commentDate.getDate(),
                hour: commentDate.getHours(),
                minute: commentDate.getMinutes(),
                seconds: commentDate.getSeconds()
              }
              console.log({
                post: title.innerHTML,
                commenttext: newcomment,
                user: userdata.email,
                name: userdata.name,
                photoURL: userdata.photoURL,
                upvotes: 0,
                created: date
              })
              if (postimage == undefined) {

                db.collection("comments").doc(comment.value).set({
                  post: title.innerHTML,
                  commenttext: newcomment,
                  user: userdata.email,
                  name: userdata.name,
                  photoURL: userdata.photoURL,
                  upvotes: 0,
                  created: date,
                  since1970: commentDate.getTime()
                })
                  .then(() => {
                    console.log("Comments document successfully written!");
                    console.log(userdata.commentscount);
                    var commentcount = parseInt(userdata.commentscount) + 1;
                    console.log(commentcount);


                    db.collection("Users").doc(userdata.email).update({
                      commentscount: commentcount
                    }).then(() => {
                      console.log("commentcount in user successfully updated!");
                    }).catch((error) => {
                      // The document probably doesn't exist.
                      console.error("Error updating document: ", error);
                    })


                    console.log('answer:', postData.answers)
                    var answers = parseInt(postData.answers) + 1;
                    console.log('answers:', answers)

                    db.collection("posts").doc(postData.Header).update({
                      answers: answers
                    }).then(() => {
                      console.log("answercount in posts successfully updated!");
                      document.getElementById("alert").hidden = false;
                    }).catch((error) => {
                      // The document probably doesn't exist.
                      console.error("Error updating document: ", error);
                    })

                  })
                  .catch((error) => {
                    console.error("Error writing document: ", error);
                  });

              } else {

                db.collection("comments").doc(comment.value).set({
                  post: title.innerHTML,
                  commenttext: newcomment,
                  user: userdata.email,
                  name: userdata.name,
                  photoURL: userdata.photoURL,
                  upvotes: 0,
                  image: postimage,
                  created: date,
                  since1970: commentDate.getTime()
                })
                  .then(() => {
                    console.log("Comments document successfully written!");
                    console.log(userdata.commentscount);
                    var commentcount = parseInt(userdata.commentscount) + 1;
                    console.log(commentcount);


                    db.collection("Users").doc(userdata.email).update({
                      commentscount: commentcount
                    }).then(() => {
                      console.log("commentcount in user successfully updated!");
                    }).catch((error) => {
                      // The document probably doesn't exist.
                      console.error("Error updating document: ", error);
                    })


                    console.log('answer:', postData.answers)
                    var answers = parseInt(postData.answers) + 1;
                    console.log('answers:', answers)

                    db.collection("posts").doc(postData.Header).update({
                      answers: answers
                    }).then(() => {
                      console.log("answercount in posts successfully updated!");
                      document.getElementById("alert").hidden = false;
                    }).catch((error) => {
                      // The document probably doesn't exist.
                      console.error("Error updating document: ", error);
                    })

                  })
                  .catch((error) => {
                    console.error("Error writing document: ", error);
                  });
              }
            });


            var commentsdiv = document.getElementById('commentsdiv');
            var countinganswers = document.getElementById('countinganswers');
            countinganswers.innerHTML = `${postData.answers} Answers`
            var commentref = db.collection("comments").where("post", "==", title.innerHTML)
            commentref.get()
              .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                  // doc.data() is never undefined for query doc snapshots
                  console.log(doc.id, " => ", doc.data());
                  var data = doc.data()
                  // TODO: add upvote system, and add to pointscount


                  var answer = document.createElement('div');
                  answer.id = 'answerdiv'

                  var upvotes = document.createElement('div')
                  upvotes.className = 'upvotes'

                  var upvote = document.createElement('i')
                  upvote.className = "fas fa-caret-up"
                  upvote.id = 'upvote'
                  var postvote = document.createElement('div')
                  postvote.innerHTML = data.upvotes
                  var originalupvote = data.upvotes

                  postvote.id = 'postvote'
                  var downvote = document.createElement('i')
                  downvote.className = "fas fa-caret-down"
                  downvote.id = 'downvote'


                  upvote.addEventListener('click', () => {
                    var newvote = parseInt(postvote.innerHTML) + 1
                    console.log('clicked upvote')
                    console.log('newvote:', newvote)
                    db.collection('upvotes').doc(String(userdata.email) + String(answertext.innerHTML)).get()
                      .then((doc) => {
                        if (doc.exists) {
                          console.log(doc.data())
                          var votedata = doc.data()
                          console.log('original upvote:', originalupvote)
                          if (votedata.vote == 0 || votedata.vote == -1) {
                            postvote.innerHTML = newvote
                            // update on post
                            db.collection('comments').doc(answertext.innerHTML).update({
                              upvotes: newvote
                            }).then(() => {
                              console.log(`updated, upvotes is now ${newvote}`)

                            }).catch((error) => {
                              console.error('error updating document:', error)
                            })
                            // update on vote document to ensure he cant vote again
                            db.collection('upvotes').doc(String(userdata.email) + String(answertext.innerHTML)).update({
                              vote: parseInt(votedata.vote) + 1
                            }).then(() => {
                              console.log(`updated, upvotes is now ${newvote}`)
                            }).catch((error) => {
                              console.error('error updating document:', error)
                            })

                            // update on user profile
                            let anotheruserdata;
                            db.collection('Users').doc(data.user).get().then((doc) => {
                              if (doc.exists) {
                                anotheruserdata = doc.data();
                              }
                            })
                            db.collection('Users').doc(data.user).update({
                              pointscount: parseInt(anotheruserdata.pointscount) + 1
                            })
                          } else {
                            console.log('beyond range.')
                          }
                        } else {
                          console.log('doc doesnt exist, i shall make one for you')
                          console.log({
                            comment: answertext.innerHTML,
                            user: userdata.email,
                            vote: 1
                          })
                          db.collection('upvotes').doc(String(userdata.email) + String(answertext.innerHTML)).set({
                            comment: answertext.innerHTML,
                            user: userdata.email,
                            vote: 1
                          }).then(() => {
                            console.log(`updated, upvotes is now ${String(newvote)}`)

                          }).catch((error) => {
                            console.error('error updating document:', error)
                          })


                          db.collection('comments').doc(answertext.innerHTML).update({
                            upvotes: newvote
                          }).then(() => {
                            console.log(`updated, upvotes is now ${String(newvote)}`)

                          }).catch((error) => {
                            console.error('error updating document:', error)
                          })

                          postvote.innerHTML = newvote

                          // update on user profile
                          var anotheruserdata;
                          db.collection('Users').doc(data.user).get().then((doc) => {
                            if (doc.exists) {
                              anotheruserdata = doc.data();
                              db.collection('Users').doc(data.user).update({
                                pointscount: parseInt(anotheruserdata.pointscount) + 1
                              })
                            }
                          })


                        }
                      }).catch((error) => {
                        console.error('error updating document:', error)
                      })

                  })

                  downvote.addEventListener('click', () => {
                    var newvote = parseInt(postvote.innerHTML) - 1
                    console.log('clicked downvote')
                    console.log('newvote:', newvote)
                    db.collection('upvotes').doc(String(userdata.email) + String(answertext.innerHTML)).get().then((doc) => {
                      if (doc.exists) {
                        console.log('oh doc does exist')
                        var votedata = doc.data()
                        console.log('votedata.vote:', votedata.vote)
                        if (votedata.vote == 0 || votedata.vote == 1) {
                          postvote.innerHTML = newvote
                          db.collection('comments').doc(answertext.innerHTML).update({
                            upvotes: newvote

                          }).then(() => {
                            console.log(`updated, upvotes is now ${newvote}`)

                          }).catch((error) => {
                            console.error('error updating document:', error)
                          })
                          db.collection('upvotes').doc(String(userdata.email) + String(answertext.innerHTML)).update({
                            vote: parseInt(votedata.vote) - 1
                          }).then(() => {
                            console.log(`updated, upvotes is now ${newvote}`)

                          }).catch((error) => {
                            console.error('error updating document:', error)
                          })
                          // update on user profile
                          let anotheruserdata;
                          db.collection('Users').doc(data.user).get().then((doc) => {
                            if (doc.exists) {
                              anotheruserdata = doc.data();
                            }
                          })
                          db.collection('Users').doc(data.user).update({
                            pointscount: parseInt(anotheruserdata.pointscount) - 1
                          })
                        } else {
                          console.log('beyond range.')
                        }
                      } else if (doc.exists == false) {
                        console.log('doc does not exist, so imma just set the document')
                        console.log({
                          comment: answertext.innerHTML,
                          user: userdata.email,
                          vote: -1
                        })
                        db.collection('upvotes').doc(String(userdata.email) + String(answertext.innerHTML)).set({
                          comment: answertext.innerHTML,
                          user: userdata.email,
                          vote: -1
                        }).then(() => {
                          console.log(`updated, upvotes is now ${newvote}`)

                        }).catch((error) => {
                          console.error('error updating document:', error)
                        })


                        db.collection('comments').doc(answertext.innerHTML).update({
                          upvotes: newvote
                        }).then(() => {
                          console.log(`updated, upvotes is now ${newvote}`)

                        }).catch((error) => {
                          console.error('error updating document:', error)
                        })
                        // update on user profile
                        let anotheruserdata;
                        db.collection('Users').doc(data.user).get().then((doc) => {
                          if (doc.exists) {
                            anotheruserdata = doc.data();
                            db.collection('Users').doc(data.user).update({
                              pointscount: parseInt(anotheruserdata.pointscount) - 1
                            })
                            postvote.innerHTML = newvote
                          }
                        })
                      }
                    }).then(() => {
                      console.log(`updated, upvotes is now ${String(originalupvote - 1)}`)

                    }).catch((error) => {
                      console.error('error getting document:', error)
                    })
                  })


                  upvotes.appendChild(upvote)
                  upvotes.appendChild(postvote)
                  upvotes.appendChild(downvote)
                  answer.appendChild(upvotes)

                  var fleximage = document.createElement('div');
                  fleximage.className = 'fleximage';

                  var firstrow = document.createElement('div')
                  firstrow.className = 'first-row'

                  // userpfp
                  var pfp = document.createElement('img')
                  pfp.style.borderRadius = '50px'
                  pfp.id = 'pfp'
                  pfp.src = data.photoURL
                  firstrow.appendChild(pfp)

                  fleximage.appendChild(firstrow)

                  // text in the comment
                  var answertext = document.createElement('div');
                  answertext.id = 'answertext'
                  answertext.innerHTML = data.commenttext;

                  fleximage.appendChild(answertext)

                  // image in the thing
                  if (data.image != undefined) {
                    var answerimage = document.createElement('img');
                    answerimage.id = 'answerimage'
                    answerimage.src = data.image;
                    fleximage.appendChild(answerimage);
                  }

                  var bottomrow = document.createElement('div')
                  bottomrow.className = 'bottomrow'

                  var date = document.createElement('div')
                  date.id = 'time'
                  var currentdate = new Date()
                  var commenttext;

                  if (currentdate.getFullYear() - data.created.year == 0) {
                    // if posted less than a year ago
                    if (currentdate.getMonth() - data.created.month == 0) {
                      // if posted less than a month ago AND less than a year ago
                      if (currentdate.getDate() - data.created.day == 0) {
                        // if posted less than a day ago AND less than a month ago AND less than a year ago
                        if (currentdate.getHours() - data.created.hour == 0) {
                          // if posted less than an hour ago AND less than a day ago AND less than a month ago AND less than a year ago
                          if (currentdate.getMinutes() - data.created.minute == 0) {
                            // if posted less than a minute ago AND less than an hour ago AND less than a day ago AND less than a month ago AND less than a year ago
                            commenttext = "posted less than a minute ago"
                          } else {
                            // if posted more than a minute ago AND less than an hour ago AND less than a day ago AND less than a month ago AND less than a year ago
                            commenttext = `posted ${currentdate.getMinutes() - data.created.minute} minutes ago`
                          }
                        } else {
                          // if posted more than an hour ago AND less than a day ago AND less than a month ago AND less than a year ago
                          commenttext = `posted ${currentdate.getHours() - data.created.hour} hours ago`
                        }
                      } else {
                        // if post more than a day ago AND more than a month ago AND less than a year ago
                        commenttext = `posted ${currentdate.getDate() - data.created.day} days ago`
                      }
                    } else {
                      // if post more than a month ago AND less than a year ago
                      commenttext = `posted ${currentdate.getMonth() - data.created.month} months ago`
                    }

                  } else {
                    // if posted more than a year ago\
                    commenttext = `posted ${currentdate.getFullYear() - data.created.year} years ago`
                  }
                  date.innerHTML = commenttext;
                  bottomrow.appendChild(date);

                  var questioner = document.createElement('div')
                  questioner.id = 'questioner'
                  questioner.innerHTML = 'Posted by '

                  var realquestioner = document.createElement('a')
                  realquestioner.href = '#';
                  realquestioner.innerHTML = data.name
                  realquestioner.style.color = '#4eff9f'
                  realquestioner.addEventListener('click', () => {
                    console.log(data.user)
                    localStorage.setItem('userprofile', data.user)
                    window.location.replace('profile.html')
                  })
                  questioner.appendChild(realquestioner)

                  bottomrow.appendChild(questioner);
                  var onright = document.createElement('div');
                  onright.style.width = '100%';
                  onright.appendChild(fleximage);
                  onright.appendChild(bottomrow);
                  answer.appendChild(onright);
                  commentsdiv.appendChild(answer);

                });


              })
              .catch((error) => {
                console.log("Error getting documents: ", error);
              });


          } else {
            // doc.data() will be undefined in this case
            console.log("Document has been deleted, sadly");
          }
        });
      }
    })

  } else {
    // code runs when signed out
    window.location.replace("index.html");
  }
});