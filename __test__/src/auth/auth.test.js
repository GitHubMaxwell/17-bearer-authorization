
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

  xit('mockRequest should exist', () => {
    expect(mockRequest).toBeDefined();
  });

  xit('POST: gets a 200 on good signup', () => {
    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then(response => {
        expect(response.status).toEqual(200);
      });
  });

  xit('POST: gets a 401 on a bad signup', () => {
    return mockRequest.post('/api/signup')
      .catch(response => {
        expect(response.status).toEqual(401);
      });
  });
 
  xit('GET: gets a 401 on a bad login with no credentials', () => {
    return mockRequest.get('/api/signin')
      .auth()
      .then(response => {
        // console.log('THEN');
        // why is this going to the then
        expect(response.status).toEqual(401);
      });
    //   .catch(response => {
    //     console.log('CATCH');
    //     expect(response.status).toEqual(401);
    //   });
  });

  xit('GET: gets a 404 on a good login with wrong credentials', () => {
    return mockRequest.get('/api/signin')
      .auth('foo','bar')
      .catch(response => {
        expect(response.status).toEqual(404);
      });
  });

  xit('GET: gets a 200 on a good BASIC login', () => {
    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then(() => {
        // console.log('200 POST RES:', response.body);
        return mockRequest.get('/api/signin')
          .auth('khoa','khoawell')
          .then(res => {
            expect(res.statusCode).toEqual(200);
          });
      });
  });

  xit('GET: gets a 200 on a good BEARER token login', () => {
    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then(response => {
        return mockRequest.get('/api/signin')
          .set({'Authorization': `Bearer ${response.text}`, Accept: 'application/json'})
          .then(res => {
            expect(res.statusCode).toEqual(200);
          });
      });
  });

  xit('GET: gets a 401 on a bad BEARER token login', () => {
    const badToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjViMzkzNjU3MDQ0YWFlNjc3OTEwMDk5OSIsImlhdCI6MTUzMDQ3NjEyMH0.NQ8obftQL21zd30_XQ2dHnkaJrDk-HdTw81JSo_QZt';

    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then(() => {
        return mockRequest.get('/api/signin')
          .set({'Authorization': `Bearer ${badToken}`, Accept: 'application/json'})
          .catch(err => {
            expect(err.statusCode).toEqual(401);
          });
      });
  });

  xit('GET: gets a 401 on no BEARER token provided', () => {
    return mockRequest.get('/api/signin')
      .set({'Authorization': `Bearer `, Accept: 'application/json'})
      .catch(err => {
        expect(err.statusCode).toEqual(401);
      });
  });

  xit('PUT: gets a 200 on a good BASIC token update', () => {
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
          })
          .catch(err => {
            expect(err.statusCode).toEqual(401);
          });
      });
  });

  xit('PUT: gets a 200 on a good BEARER token update', () => {
    let params = '5b3d27d95d5ac6ca206019ee';

    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then(response => {
        //where in the response is the user id
        // console.log('POST RESPONSE: ', response.text);
        //response.body._id is how to get at 
        // return mockRequest.put(`/api/update/${response.body._id}`)
        return mockRequest.put(`/api/update/${params}`)
          .set({'Authorization': `Bearer ${response.text}`, Accept: 'application/json'})
          .send({dog: 'poodle'})
          .then(res => {
            console.log('POST RESPONSE: ', res.body);
            expect(res.statusCode).toEqual(200);
          });
        // .catch(err => {
        //   expect(err.statusCode).toEqual(401);
        // });
      });
  });

  xit('PUT: gets a 200 on a good BEARER token update', () => {
    let params = '5b3d27d95d5ac6ca206019ee';

    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then(response => {
        // console.log('JWT: ', response.text);
        let jwt = response.text;

        return mockRequest.put(`/api/update/${params}`)
          .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          .send({dog: 'poodle'})
          .then( () => {
            console.log('JWT: ');

            return mockRequest.get('/api/signin')
              .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
              .then(res => {
                // console.log('GET RESPONSE: ', jwt);
                // console.log('GET RESPONSE: ', res);

                expect(res.statusCode).toEqual(200);
              });
            // console.log('POST RESPONSE: ', res.body);
            // expect(res.statusCode).toEqual(200);
          });
      });
  });

  it('PUT: gets a 404 on no ID passed', () => {
    // let params = '5b3d27d95d5ac6ca206019ee';

    return mockRequest.post('/api/signup')
      .send({username: 'khoa', password: 'khoawell'})
      .then(response => {
        // console.log('JWT: ', response.text);
        let jwt = response.text;

        return mockRequest.put(`/api/update/`)
          .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          .send({dog: 'poodle'})
          // .then( () => {
          //   console.log('JWT: ');

          //   return mockRequest.get('/api/signin')
          //     .set({'Authorization': `Bearer ${jwt}`, Accept: 'application/json'})
          //     .then(res => {
          //       // console.log('GET RESPONSE: ', jwt);
          //       console.log('GET RESPONSE: ', res.statusCode);

          //       expect(res.statusCode).toEqual(200);
          //     });
          //   // console.log('POST RESPONSE: ', res.body);
          //   // expect(res.statusCode).toEqual(200);
          // })
          .catch(err => {
            console.log(err.statusCode);
            expect(err.statusCode).toEqual(404);
          });
      });
  });

}); // close describe


// manually set req.headers.authorization = `Bearer ${token}` for token pass/fail tests
// .set({ 'Authorization': `Bearer ${token}`, Accept: 'application/json' })