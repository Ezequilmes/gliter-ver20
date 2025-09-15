"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsHandler = exports.chatHandler = exports.usersHandler = exports.authHandler = void 0;
const https_1 = require("firebase-functions/v2/https");
// Lightweight HTTP handlers to satisfy Hosting rewrites
exports.authHandler = (0, https_1.onRequest)({ region: 'us-central1' }, async (req, res) => {
    res.status(200).json({ ok: true, service: 'auth', message: 'Auth API placeholder' });
});
exports.usersHandler = (0, https_1.onRequest)({ region: 'us-central1' }, async (req, res) => {
    res.status(200).json({ ok: true, service: 'users', message: 'Users API placeholder' });
});
exports.chatHandler = (0, https_1.onRequest)({ region: 'us-central1' }, async (req, res) => {
    res.status(200).json({ ok: true, service: 'chat', message: 'Chat API placeholder' });
});
exports.paymentsHandler = (0, https_1.onRequest)({ region: 'us-central1' }, async (req, res) => {
    res.status(200).json({ ok: true, service: 'payments', message: 'Payments API placeholder' });
});
// Export function modules (these should import from './admin' when needing Admin SDK)
__exportStar(require("./auth"), exports);
__exportStar(require("./users"), exports);
__exportStar(require("./chat"), exports);
__exportStar(require("./payments"), exports);
//# sourceMappingURL=index.js.map