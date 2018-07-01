'use strict';

import User from '../models/dog-model.js';

export default (req, res, next) => {

  let authorize = (token) => {
    User.authorize(token)
      .then( user => {
        if(!user) {
          console.log('Authorize No User');
          getAuth();
        }
        else {
          next();
        }
      })
      .catch(() => {
        next();
      });
  };

  let authenticate = (auth) => {
    User.authenticate(auth)
      .then( user => {
        if(!user) {
          getAuth();
        }
        else {
          req.token = user.generateToken();
          next();
        }
      })
      .catch(() => {
        next();
      });
  };

  let getAuth = () => {
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
    if(!authHeader) {
      console.log('No req.headers.authorization in TRY');
      return getAuth;
    }

    if(authHeader.match(/basic/i)){
      let base64Header = authHeader.replace(/Basic\s+/i, '');
      let base64Buffer = Buffer.from(base64Header, 'base64');
      let bufferString = base64Buffer.toString();
      let [username,password] = bufferString.split(':');
      auth = {username,password};
      authenticate(auth);
    }
    /////////////////////////////////////////////
    else if(authHeader.match(/bearer/i)){
      let token = authHeader.replace(/bearer\s+/i, '');
      authorize(token);
    }
    /////////////////////////////////////////////
  }
  catch(e) {
    next(e);
  }
};