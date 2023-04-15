'use strict';
var db = firebase.firestore();
const auth = firebase.auth();
const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

const provider = new firebase.auth.GoogleAuthProvider();

var userDetails = document.getElementById('userDetails')
var profilepicture = document.getElementById('profilepicture')
var userdata;
var posts = document.getElementById('posts');
var profilelink = document.getElementById('profile-link')
var remakelink = document.getElementById('remakelink')
// the real thing that actually happens

auth.onAuthStateChanged((user) => {
  if (user) {
    // code runs when signed in
    remakelink.onclick = () => { window.location.replace("feed.html") }
    var userdata;
    db.collection('Users').doc(user.email).get().then((doc) => {
      if (doc.exists) {
        userdata = doc.data();
        userDetails.innerHTML = `<h3>Hello ${userdata.name}!</h3>`;
        profilepicture.src = userdata.photoURL;
        console.log(user.uid);
        profilelink.addEventListener('click', () => {
          localStorage.setItem('userprofile', user.email)
          window.location.replace('profile.html')
        })
        document.getElementById('signOutBtn').addEventListener('click', () => {
          auth.signOut();
        })
        var postref = db.collection("posts").orderBy('since1970', 'desc')
        postref.get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              // doc.data() is never undefined for query doc snapshots
              // TODO: add "x answers" in the posts
              var data = doc.data()
              console.log(doc.id, " => ", doc.data());
              console.log(typeof doc.data())

              // create div

              var newdiv = document.createElement("div");
              newdiv.id = 'newdiv';

              var maincontent = document.createElement('div');
              maincontent.className = 'main-content';

              var pfp = document.createElement('img')
              pfp.id = 'pfp'
              pfp.src = data.userpfp
              newdiv.appendChild(pfp)



              var flex = document.createElement('div');
              flex.className = 'flex';

              var onleft = document.createElement('div');
              onleft.id = 'on-left';
              // create header and put it in the body

              var Header = document.createElement("a");
              Header.id = 'header'
              Header.innerHTML = String(data.Header)
              Header.href = "postinfo.html"
              Header.addEventListener('click', function () {
                location.href = 'postinfo.html';
                localStorage.setItem("addheader", data.Header);
              })
              maincontent.appendChild(Header)
              console.log(newdiv)


              var date = document.createElement('div')
              date.id = 'date'
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
              date.innerHTML = commenttext
              onleft.appendChild(date)


              var answers = document.createElement('div');
              answers.id = 'answers'
              answers.innerHTML = `${data.answers} Answers`
              onleft.appendChild(answers)

              flex.appendChild(onleft)
              var questioner = document.createElement('div');
              questioner.id = 'questioner';
              questioner.innerHTML = 'Asked by ';

              var userquestion = document.createElement('a');
              userquestion.id = 'user';
              userquestion.innerHTML = data.name;
              userquestion.href = '#';
              userquestion.addEventListener('click', () => {
                console.log(data.User)
                localStorage.setItem('userprofile', data.User)
                window.location.replace('profile.html')
              })
              questioner.appendChild(userquestion);
              flex.appendChild(questioner);
              maincontent.appendChild(flex);
              newdiv.appendChild(maincontent);
              posts.appendChild(newdiv);
            });
          })
          .catch((error) => {
            console.error("Error getting documents: ", error);
          });
      }
    })


  } else {
    window.location.replace("index.html");
  }
});