const env = {};

env.staging = {
    port: 5000,
    name: 'staging',
    secretKey: 'js$$%&nhsij45djk45o$kd&j%i4',
    maxChecks: 5,
    twilio: {
        fromPhone: '+18642728453',
        accountSid: 'AC2d616d4eea215c745b50bd9e85b9e6af',
        authToken: '536826a8ef221f5c1fb3a5d63a749bfa',
    },
};

env.production = {
    port: 4000,
    name: 'production',
    secretKey: 'jk45o$kd&j%i$%&nhsijs$dj454',
    maxChecks: 5,
    twilio: {
        fromPhone: '+18642728453',
        accountSid: 'AC2d616d4eea215c745b50bd9e85b9e6af',
        authToken: '536826a8ef221f5c1fb3a5d63a749bfa',
    },
};
const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

const envExport = typeof env[currentEnv] === 'object' ? env[currentEnv] : env.staging;

module.exports = envExport;
