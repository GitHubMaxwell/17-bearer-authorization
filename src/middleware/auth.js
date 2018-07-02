'use strict';

import User from '../models/dog-model.js';

export default (req, res, next) => {

  let deleteOne = (token) => {
    console.log('GETTING TO deleteOne');

    User.authorize(token)
      .then( user => {
        console.log('GETTING PAST deleteOne authorize');

        if(!user) {
          getAuth();
        }
        else {
          console.log('User.deleteOne user: ', user._id);

          console.log('Going to User.deleteOne path');

          //need a then after the i think its breaking because of async
          User.deleteOne(user._id)
            .then(() => {
              console.log('After deleteOne executed and in then onto next');
              next();
            })
            .catch(next);
        }
      })
      .catch(() => {
        next();
      });

  };

  let deleteAll = (token) => {
    User.authorize(token)
      .then( user => {
        if(!user) {
          getAuth();
        }
        else {
          User.deleteAll();
          next();
        }
      })
      .catch(() => {
        next();
      });
  };

  let update = (token, payload) => {
    // console.log('GETTING TO UPDATE');

    User.authorize(token)
      .then( user => {
        // console.log('Update user', user);

        if(!user) {
        //   console.log('Update No User');
          getAuth();
        }
        else {
          //is this the proper way to hand off the user.id
          User.update(user.userId, payload);
          //   console.log('Update going to Next', user);
          next();
        }
      })
      .catch(() => {
        next();
      });
  };

  let authorize = (token) => {
    User.authorize(token)
      .then( user => {
        if(!user) {
        //   console.log('Authorize No User');
          getAuth();
        }
        else {
        //   console.log('Authorize going to Next', user);
          next();
        }
      })
      .catch(() => {
        next();
      });
  };

  let authenticate = (auth) => {
    // console.log('auth.js AUTHENTICATE');

    User.authenticate(auth)
      .then( user => {
        // console.log('BEFORE IF User.authenticate', user);

        if(!user) {
        //   console.log('auth.js authenticate NO USER ERROR', user);
          getAuth();
        }
        else {
          req.token = user.generateToken();
          next();
        }
      })
      .catch(() => {
        // console.log('auth.js authenticate ERROR');
        next();
      });
  };

  let getAuth = () => {
    // console.log('auth.js getAuth');
    next({
      status:401,
      statusMessage: 'Unauthorized getAuth',
      message: 'Invalid User ID/Password',
    });
  };

  ////////////////////////////////////////////

  try {
    let auth = {};
    let authHeader = req.headers.authorization;
    //can also be req.get.authorization
    // console.log('req.headers.authorization in TRY', authHeader);

    if(!authHeader) {
    //   console.log('No req.headers.authorization in TRY');
      return getAuth();
    }
    // console.log('auth.js BEFORE if');

    if(authHeader.match(/basic/i)){
    //   console.log('auth.js BASIC if');

      let base64Header = authHeader.replace(/Basic\s+/i, '');
      let base64Buffer = Buffer.from(base64Header, 'base64');
      let bufferString = base64Buffer.toString();
      let [username,password] = bufferString.split(':');
      auth = {username,password};
      authenticate(auth);
    }
    /////////////////////////////////////////////
    else if(authHeader.match(/bearer/i)){
    //   console.log('auth.js inside BEARER if');

      let token = authHeader.replace(/bearer\s+/i, '');
      //   console.log('auth.js BEARER token: ', token);

      //how to filter this with other routes using it
      // by method
      // if the request doesnt have
      // cant be body because if its a Basic
      // if(!req.params) {
      if(req.method === 'GET') {
        authorize(token);
      }
      if(req.method === 'PUT') {
        update(token, req.body);
      }
      if(req.method === 'POST') {
        authorize(token);
      }
      if(req.params.id && req.method === 'DELETE') {
        console.log('Delete One Bearer Route');
        console.log('Delete One req.params.id', req.params.id);
        console.log('Delete One req.method:', req.method);
        deleteOne(token);
      }
    //   if(req.method === 'DELETE') {
    //     console.log('Delete All Bearer Route');

    //     deleteAll(token);
    //   }
      
    }
    /////////////////////////////////////////////
  }
  catch(e) {
    // console.log('auth.js TRY error catch');
    next(e);
  }
};