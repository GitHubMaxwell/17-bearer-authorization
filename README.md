![CF](https://camo.githubusercontent.com/70edab54bba80edb7493cad3135e9606781cbb6b/687474703a2f2f692e696d6775722e636f6d2f377635415363382e706e67) 17: Bearer Auth
===

## Travis Badge

[![Build Status](https://travis-ci.com/GitHubMaxwell/17-bearer-authorization.svg?branch=max-refactor-lab17)](https://travis-ci.com/GitHubMaxwell/17-bearer-authorization)

## Links

* TRAVIS: https://travis-ci.com/GitHubMaxwell/17-bearer-authorization
* HEROKU: https://lab17-max.herokuapp.com/
* GitHUB PR: https://github.com/GitHubMaxwell/17-bearer-authorization/pull/1

## Steps
* fork/clone code
* npm install
* run npm test without having Nodemon (npm start) running but has MongoDB running with mongod in terminal
* test with postman:
* start MongoDB with mongod
* start nodemon with npm start

* open postman try GET PUT POST DELETE routes out using correct URI for each (explained below)



=============================
ENV Variables

 ```
PORT=3000

MONGODB_URI=mongodb://localhost:27017/lab-17

MONGODB_URI=mongodb://heroku_060vl7j2:k9hs96a3k0sku2h5cjadmh2n6m@ds231991.mlab.com:31991/heroku_060vl7j2

APP_SECRET=maxwell
 ``` 


 * Above are the env variables. I'm not sure which Mongo URI you'll need to do but im suspecting the on with heroku in it

Heroku Routes (in Postman)
* https://lab17-max.herokuapp.com/api/signup

* https://lab17-max.herokuapp.com/api/signin

* https://lab17-max.herokuapp.com/api/update/:id

* https://lab17-max.herokuapp.com/api/delete/:id


 1. First you need to sign up with the signup URL setting the request type to POST. in the body tab paste `{"username": "name", "password": "name"}` and press send. The copy the JWT thats provided in reslt body section of postman below

 2. Open a new tab, paste the signin URL in and set the request to GET. in the Authorization tab set it to `Bearer` and paste the JWT from the signup step in field labeled `Token` and press send. You'll receive a 200 OK back on success.

 3. In a new tab paste the update URL and select the PUT request type. follow the authorization steps from Step 2. In the Body tab, paste `{"dog": "poodle"}`

4. In a new tab paste the delete URL and select the DELETE request type. follow the authorization steps from Step 2. On success you receive a 200

* For the PUT and DELETE (you need to create an account first with signup) routes you need the _id of the user account to add to the end of the URL like so `https://lab17-max.herokuapp.com/api/update/5b3d27d95d5ac6ca206019ee`. This can be found by opening a terminal window, navigating to the root of folder of this repo, enter `mongo` > enter `show dbs` > enter `use lab-17` (or the heroku version) > enter `db.users.find().pretty()` > copy the number value of the key `_id` into the URL and press enter