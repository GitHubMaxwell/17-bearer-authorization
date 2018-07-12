
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

  it('POST: gets a 200 on good signup', () => {
    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then(response => {
        expect(response.status).toEqual(200);
      });
  });

  it('POST - test 400, if no body was provided or if the body was invalid', () => {
    return mockRequest.post('/api/signup')
      .then(response => {
        // console.log(response.status);
        expect(response.status).toEqual(400);
      });
  });
 
  it('GET: gets a 401 on a bad login with no credentials', () => {
    return mockRequest.get('/api/signin/max')
      // .auth()
      .then(response => {
        console.log(response.status);
        // why is this going to the then?
        expect(response.status).toEqual(401);
      });
  });

  it('GET: gets a 404 on a good login with not found id', () => {
    //id not as in an incoorect route NOT incorrect credentials because 401 handles that
    return mockRequest.post('/api/signup')
      .send({username: 'foo', password: 'bar'})
      .then( () => {

        return mockRequest.get('/api/signi')
          .auth('foo','bar')
          .then(response => {
            console.log(response.status);
            expect(response.status).toEqual(404);

          });
      });
  });

  it('DOESNT WORK = GET: gets a 200 on a good BASIC login', () => {

    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then( response => {
        console.log('200 POST RES:', response.status);

        return mockRequest.get('/api/signin')
          .auth('khoa','khoawell')
          .then(res => {
            console.log(res.statusCode);
            expect(res.statusCode).toEqual(200);
          });
      });
  });

  it('GET: gets a 200 on a good BEARER token login', () => {

    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then(response => {
        let token = response.text;

        return mockRequest.get('/api/signin')
          .set({'Authorization': `Bearer ${token}`, Accept: 'application/json'})
          .then(res => {
            expect(res.statusCode).toEqual(200);
          });
      });
  });

  it('DOESNT WORK = GET: gets a 401 on a bad BEARER token login', () => {
    // const badToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjViNDU1ZTM5MTUzYjM3NTQwYjM0MDUyNSIsImlhdCI6MTUzMTI3Mjc2MX0.QchHUSQF22UQE0Ma0L8vvAdRNTJWy__oIsekJuUSS3M';

    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then(res => {
        console.log(res.text);

        return mockRequest.get('/api/signin')
          .set({'Authorization': `Bearer `, Accept: 'application/json'})
          .then(err => {
            console.log(err.statusCode);
            expect(err.statusCode).toEqual(401);
          });
      });
  });

  it('GET: gets a 401 on no BEARER token provided', () => {
    return mockRequest.get('/api/signin')
      // .set({'Authorization': `Bearer `, Accept: 'application/json'})
      .then(err => {
        expect(err.statusCode).toEqual(401);
      });
  });

  it('PUT: gets a 200 on a good BASIC token update', () => {
    const payload = {
      dog: 'poodle',
    };

    let params = '5b3d27d95d5ac6ca206019ee';

    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then(() => {

        return mockRequest.put(`/api/update/${params}`)
        //.set({'Authorization': `Bearer ${response.text[1]}`, Accept: 'application/json'})
        //does the auth go before the .send()??
          .auth('khoa','khoawell')
          .send(payload)
          .then(res => {

            expect(res.statusCode).toEqual(200);
          });
      });
  });

  it('PUT - test 200, for a post request with a valid body', () => {
    let params = '5b3d27d95d5ac6ca206019ee';

    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then(response => {
        let jwt = response.text;

        return mockRequest.put(`/api/update/${params}`)
          .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          .send({dog: 'poodle'})
          .then( () => {

            return mockRequest.get('/api/signin')
              .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
              .then(res => {
                expect(res.statusCode).toEqual(200);
              });
          });
      });
  });

  it('PUT - test 404, for a valid request made with an id that was not found', () => {
    // let params = '5b3d27d95d5ac6ca206019ee';

    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then(response => {
        let jwt = response.text;
        console.log(response.status);
        // console.log(response.text);

        // let jwt = 'response.text';
        return mockRequest.put(`/api/update`)
        // return mockRequest.put(`/api/update/${params}`)

          .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          .send({dog: 'poodle'})
          .then( data => {
            console.log(data.status);
            expect(data.statusCode).toEqual(404); 
          });
      });
  });
  it('PUT - test 401, if no token was provided', () => {
    //gets the 401 from getAuth() in auth.js

    let params = '5b3d27d95d5ac6ca206019ee';

    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then( () => {
        // let jwt = response.text;

        return mockRequest.put(`/api/update/${params}`)
          // .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          .send({dog: 'poodle'})
          .then( data => {
            // console.log(data.status);
            expect(data.status).toEqual(401);
          });
      });
  });


  it('PUT - test 400, if the body was invalid', () => {
    //gets 401 from the badBod.js in app.js
    let params = '5b3d27d95d5ac6ca206019ee';

    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then( response => {
        let jwt = response.text;

        return mockRequest.put(`/api/update/${params}`)
        // return mockRequest.put(`/api/update`)

          .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          // .send({og: 'poodle'})
          .then( data => {
            expect(data.status).toEqual(400);
          });
      });
  });

  it('DELETE - get 200 with valid credentials', () => {
    //gets 401 from the badBod.js in app.js
    let params = '5b3d27d95d5ac6ca206019ee';

    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then( response => {
        let jwt = response.text;

        return mockRequest.delete(`/api/delete/${params}`)
          .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          // .send({og: 'poodle'})
          .then( data => {

            expect(data.status).toEqual(200);
          });
      });
  });

}); // close describe


// manually set req.headers.authorization = `Bearer ${token}` for token pass/fail tests
// .set({ 'Authorization': `Bearer ${token}`, Accept: 'application/json' })