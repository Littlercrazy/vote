'use strict';

export default {
    env: 'locale',
    port: 4041,
    db: {
        temp: {
            type: 'mysql',
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
            database: 'vote',
            port: 3306,
            pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            logging: true
        }
    },
    redis: {
        temp:{
            keyPrefix: 'node-vote',
            host: '127.0.0.1',
            port: 6379,
            db: 1,
            password: ''
        }
    }
};
