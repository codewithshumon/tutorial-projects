const lib = require('../../lib/data');
const { hash, randomString } = require('../../helpers/utilities');
const { perseJSON } = require('../../helpers/utilities');

const handle = {};

handle.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handle._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405, {
            message: 'Request failed, try  post, get, put or delete',
        });
    }
};

handle._token = {};

handle._token.post = (requestProperties, callback) => {
    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : null;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : null;
    if (phone && password) {
        lib.read('users', phone, (err, userData) => {
            const hasPassword = hash(password);
            if (hasPassword === perseJSON(userData).password) {
                const tokenId = randomString(20);
                const tokenExpire = Date.now() + 60 * 60 * 1000;
                const tokenObject = {
                    phone: phone,
                    id: tokenId,
                    tvalid: tokenExpire,
                };

                lib.create('tokens', tokenId, tokenObject, (err) => {
                    if (!err) {
                        callback(200, tokenObject);
                    } else {
                        callback(500, {
                            error: 'Token already exist',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Invalid user and password',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handle._token.get = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        lib.read('tokens', id, (err, tokenData) => {
            const token = { ...perseJSON(tokenData) };
            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'Token not found! Create new token',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Invalid token',
        });
    }
};

handle._token.put = (requestProperties, callback) => {
    const id =
        typeof requestProperties.body.id === 'string' &&
        requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;

    const extend =
        typeof requestProperties.body.extend === 'string' &&
        requestProperties.body.extend === 'true'
            ? true
            : false;

    if (id && extend) {
        lib.read('tokens', id, (err, tokenData) => {
            let tokenObj = perseJSON(tokenData);
            if (tokenObj.tvalid > Date.now()) {
                tokenObj.tvalid = Date.now() + 60 * 60 * 1000;

                lib.update('tokens', id, tokenObj, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'Token updated',
                        });
                    } else {
                        callback(400, {
                            error: 'Token can not update',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Invalid token validiti',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Invalid token request',
        });
    }
};

handle._token.delete = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        lib.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                lib.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'Token successfully deleted',
                        });
                    } else {
                        callback(500, {
                            Error: 'Can not delete token',
                        });
                    }
                });
            } else {
                callback(500, {
                    Error: 'Token not found',
                });
            }
        });
    } else {
        callback(400, {
            Error: 'There was a problem in your request',
        });
    }
};

handle._token.verify = (id, phone, callback) => {
    lib.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (perseJSON(tokenData).phone === phone && perseJSON(tokenData).tvalid > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handle;
