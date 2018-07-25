'use strict';

import User from '../models/user-model.js';

export default (req, res, next) => {

  let authorize = (token) => {
    // console.log('Authorize: ', token);
    console.log('Authorize');


    User.authorize(token)
      .then( user => {
        if(!user) {
          console.log('Authorize No User');
          getAuth();
        }
        else {
          //success
          console.log('Authorize success going to Next', user);
          // before the next we need to assignt 
          req.id = user._id;
          next();
        }
      })
      .catch(() => {
        // failure
        console.log('Authorize failure going to Next(401)');
        next(401);
      });
  };

  let authenticate = (auth) => {
    // console.log('auth.js AUTHENTICATE');

    User.authenticate(auth)
      .then( user => {
        // console.log('BEFORE IF User.authenticate', user);

        if(!user) {
          console.log('auth.js authenticate NO USER ERROR', user);
          // getAuth();
          next(404);

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
    console.log('auth.js getAuth');
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
    // console.log('authHeader:', authHeader);
    // console.log('PARAMS', req.params);

    if(!authHeader) {
      return getAuth();
    }

    if(authHeader.match(/basic/i)){
      console.log('BASIC AUTH');

      let base64Header = authHeader.replace(/Basic\s+/i, '');
      let base64Buffer = Buffer.from(base64Header, 'base64');
      let bufferString = base64Buffer.toString();
      let [username,password] = bufferString.split(':');
      auth = {username,password};

      authenticate(auth);
    }
    /////////////////////////////////////////////
    else if(authHeader.match(/bearer/i)){
      console.log('BEARER AUTH');

      let token = authHeader.replace(/bearer\s+/i, '');

      authorize(token);
      
    }
    /////////////////////////////////////////////
  }
  catch(err) {
    next(err);
  }
};