'use strict';

export default {
    name: 'node-vote-v1.0.0',
    COOKIE_MAX_AGE: 2592000000,
    API_TIMEOUT: 30000,
    WHITE_HOST: [],
    COOKIE: {
        domain: '.vote.com',  // www.vote.com
        maxAge: 2592000 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/'
    }
}
