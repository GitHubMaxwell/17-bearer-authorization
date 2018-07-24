
'use strict';
import {
  Mockgoose,
} from 'mockgoose';
import mongoose from 'mongoose';
import supertest from 'supertest';
import {server} from '../../../src/app.js';
const mockRequest = supertest(server);
const mockgoose = new Mockgoose(mongoose);
require('dotenv').config();

jest.setTimeout(50000);

//do i have to put done()s in all the before and after stuff?

afterAll( () => {
  mongoose.connection.close();
});

describe('Authentication Server', () => {

  beforeAll( (done) => {
    mockgoose.prepareStorage().then(()=>{
      mongoose.connect('mongodb://localhost:27017/lab-17-test').then(()=>{
        done();
      });
    });
  });

  afterEach((done)=>{
    mockgoose.helper.reset().then(done);
  });

  xit('GET - test 200, for a request made with a valid id', () => {

    return mockRequest.post('/api/signup')
      .send({username: 'max', password: 'maxwell', email: 'max@max'})
      .then( response => {
      // 1st is the hashed pw from the POST / second is from the compare in the below GET
      // $2b$10$PNZUf17lQ1Pt30RNudZ2ou8fLz/rvb3eYJUJgsQQIU.G2v7/56Ph6
      // $2b$10$PNZUf17lQ1Pt30RNudZ2ou8fLz/rvb3eYJUJgsQQIU.G2v7/56Ph6
        console.log('200 POST RES:', response.status);

        return mockRequest.get('/api/signin')
          .auth('max','maxwell')
        //basic login is done with auth
          .then(res => {
            // console.log('supposed to be 200 status: ',res.status);
            expect(res.status).toEqual(200);
          });
      });
  });

  xit('GET - test 401, if no token was provided', () => {
    // return mockRequest.get('/api/signin/max')
    return mockRequest.get('/api/signin')
      // .auth()
      .then(response => {
        console.log(response.status);
        // why is this going to the then? / supertest puts all responses in the then
        expect(response.status).toEqual(401);
      });
  });

  xit('GET - test 404, for a valid request with an id that was not found', () => {
    return mockRequest.get('/api/signin')
      .auth('foo','bar')
      .then(response => {
        // console.log('RES STATUS (404): ',response.status);
        expect(response.status).toEqual(404);
      });
  });

  xit('PUT - test 200, for a post request with a valid body', () => {
    // need to get this dynamically from creating a dog not this static id
    // let params = '5b3d27d95d5ac6ca206019ee';

    return mockRequest.post('/api/signup')
      .send({username: 'max', password: 'maxwell', email: 'max@max'})
      .then(response => {
        let jwt = response.text;
        // console.log('JWT',response.text);

        return mockRequest.post('/api/v1/dogs')
          .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          .send({dog: 'beagle', color:'blue'})
          .then(response => {

            // console.log('Dog Id;',JSON.parse(response.text)._id);
            let params = JSON.parse(response.text)._id;

            return mockRequest.put(`/api/v1/dogs/${params}`)
              .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
              .send({dog: 'poodle', color:'green'})
              .then( response => {
                expect(response.status).toEqual(200);
              });
          });
      });
  });

  xit('PUT - test 401, if no token was provided', () => {
    //gets the 401 from getAuth() in auth.js

    return mockRequest.post('/api/signup')
      .send({username: 'max', password: 'maxwell', email: 'max@max'})
      .then(response => {
        let jwt = response.text;

        return mockRequest.post('/api/v1/dogs')
          .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          .send({dog: 'beagle', color:'blue'})
          .then(response => {
            let params = JSON.parse(response.text)._id;

            return mockRequest.put(`/api/v1/dogs/${params}`)
              // .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
              .send({dog: 'poodle', color:'green'})
              .then( response => {
                console.log('response status;',response.status);
                expect(response.status).toEqual(401);
              });
          });
      });
  });

  xit('PUT - test 400, if the body was invalid', () => {

    return mockRequest.post('/api/signup')
      .send({username: 'max', password: 'maxwell', email: 'max@max'})
      .then(response => {
        let jwt = response.text;

        return mockRequest.post('/api/v1/dogs')
          .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          .send({dog: 'beagle', color:'blue'})
          .then(response => {
            let params = JSON.parse(response.text)._id;

            return mockRequest.put(`/api/v1/dogs/${params}`)
              .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
              // .send({dog: 'poodle', color:'green'})
              .then( response => {
                console.log('response status;',response.status);
                expect(response.status).toEqual(400);
              });
          });
      });
  });

  it('DOESNT WORK - PUT - test 404, for a valid request made with an id that was not found', () => {

    return mockRequest.post('/api/signup')
      .send({username: 'max', password: 'maxwell', email: 'max@max'})
      .then(response => {
        let jwt = response.text;

        return mockRequest.post('/api/v1/dogs')
          .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          .send({dog: 'beagle', color:'blue'})
          .then( response => {
            expect(response.status).toEqual(200);
            //this is a fake ObjectId in the params variable
            let params = '5b5770380c1992c6fa002753';
            console.log('ON TO PUT');

            return mockRequest.put(`/api/v1/dogs/${params}`)
            // return mockRequest.put(`/api/v1/dogs/wrongId`)
              .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
              .send({dog: 'poodle', color:'green'})
              .then( response => {
                console.log('response status;',response.status);
                expect(response.status).toEqual(404);
              });
          });
      });
  });

  xit('POST - test 200, for a post request with a valid body', () => {
    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell',email: 'khoa@max'})
      .then(response => {
        let jwt = response.text;
        return mockRequest.post('/api/v1/dogs')
          .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          .send({dog: 'beagle', color:'blue'})
          .then(response => {
            expect(response.status).toEqual(200);
          });
      });
  });

  xit('POST - test 400, if no body was provided or if the body was invalid', () => {
    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell',email: 'khoa@max'})
      .then(response => {
        let jwt = response.text;

        return mockRequest.post('/api/v1/dogs')
          .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          // .send({dog: 'beagle', color:'blue'})
          .then(response => {
            expect(response.status).toEqual(400);
          });
      });
  });

  xit('POST - test 401, if no token was provided', () => {
    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell',email: 'khoa@max'})
      .then( () => {
        // let jwt = response.text;

        return mockRequest.post('/api/v1/dogs')
          // .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          .send({dog: 'beagle', color:'blue'})
          .then(response => {
            expect(response.status).toEqual(401);
          });
      });
  });

}); // close describe


// manually set req.headers.authorization = `Bearer ${token}` for token pass/fail tests
// .set({ 'Authorization': `Bearer ${token}`, Accept: 'application/json' })


// no need for these 3 gets according to the lab submission spec
// xit('GET: gets a 200 on a good BEARER token login', () => {

//   return mockRequest.post('/api/signup')
//     .send({username: 'khoa', password: 'khoawell', email: 'khoa@well'})
//     .then(response => {
//       let token = response.text;

//       return mockRequest.get('/api/signin')
//         .set({'Authorization': `Bearer ${token}`, Accept: 'application/json'})
//         .then(res => {
//           expect(res.status).toEqual(200);
//         });
//     });
// });

// xit('GET: gets a 401 with a no BEARER token', () => {

//   return mockRequest.post('/api/signup')
//     .send({username: 'khoa', password: 'khoawell', email: 'khoa@well'})
//     .then(res => {
//       console.log('signup success',res.text);

//       return mockRequest.post('/api/v1/dogs')
//         .send({dog: 'poodle', color: 'green'})
//         .then(err => {
//           console.log(err.status);
//           expect(err.status).toEqual(401);
//         });
//     });
// });

// xit('GET: gets a 401 on no BEARER token provided', () => {
//   return mockRequest.get('/api/signin')
//     // .set({'Authorization': `Bearer `, Accept: 'application/json'})
//     .then(err => {
//       expect(err.statusCode).toEqual(401);
//     });
// });

// Bearer isnt used for signin so this doesnt really make sense
// it('signin gets a 200 on a good login', () => {
//     let newUser = {
//       username: 'khoa',
//       password: 'test',
//       email: 'email@email.com',
//     };

//     return supertest.post(SIGNUP_URI)
//       .send(newUser)
//       .then(() => {
//         return supertest.get(SIGNIN_URI)
//           .auth('khoa', 'test')
//           .then(res => {
//             expect(res.statusCode).toEqual(200);
//           });
//       });
// });

// DELETE Test not required by Lab
// xit('DELETE - get 200 with valid credentials', () => {
//   //gets 401 from the badBod.js in app.js
//   let params = '5b3d27d95d5ac6ca206019ee';

//   return mockRequest.post('/api/signup')
//     .send({username: 'khoa', password: 'khoawell'})
//     .then( response => {
//       let jwt = response.text;

//       return mockRequest.delete(`/api/delete/${params}`)
//         .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
//         // .send({og: 'poodle'})
//         .then( data => {

//           expect(data.status).toEqual(200);
//         });
//     });
// });

// it('PUT - test 200, for a post request with a valid body', () => {
//   const payload = {
//     dog: 'pit',
//     color: 'yellow',
//   };

//   let params = '5b3d27d95d5ac6ca206019ee';

//   return mockRequest.post('/api/signup')
//     .send({username: 'max', password: 'maxwell', email: 'max@max'})
//     .then(() => {

//       return mockRequest.put(`/api/v1/dogs/${params}`)
//       //.set({'Authorization': `Bearer ${response.text[1]}`, Accept: 'application/json'})
//       //does the auth go before the .send()??
//         .auth('khoa','khoawell')
//         .send(payload)
//         .then(res => {

//           expect(res.status).toEqual(200);
//         });
//     });
// });