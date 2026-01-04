
const authController = require('./controller/auth.controller');
console.log("Exports:", Object.keys(authController));
console.log("login type:", typeof authController.login);
console.log("register type:", typeof authController.register);
console.log("getCurrentUser type:", typeof authController.getCurrentUser);
