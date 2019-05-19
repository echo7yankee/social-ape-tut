const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();

admin.initializeApp();

const firebase = require("firebase/app");
require("@firebase/auth");
require("@firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDcsMeuwCqDhL6OlPEgLHag9R-zSymb7JA",
  authDomain: "echo-firestore-cafe.firebaseapp.com",
  databaseURL: "https://echo-firestore-cafe.firebaseio.com",
  projectId: "echo-firestore-cafe",
  storageBucket: "echo-firestore-cafe.appspot.com",
  messagingSenderId: "757391324909",
  appId: "1:757391324909:web:042860d463d33759"
};
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get("/screams", (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams = [
          ...screams,
          {
            screamId: doc.id,
            body: doc.data().body,
            userHandle: doc.data().userHandle,
            createdAt: doc.data().createdAt
          }
        ];
      });
      return res.json(screams);
    })
    .catch(err => {
      console.error(err);
    });
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db.collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
});

//Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };
  // TODO: validate data

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: "This handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.region("europe-west1").https.onRequest(app);
