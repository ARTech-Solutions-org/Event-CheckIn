"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.setSession = setSession;
exports.clearSession = clearSession;
exports.getSessionUser = getSessionUser;
var node_crypto_1 = require("node:crypto");
var node_util_1 = require("node:util");
var db_1 = require("@workspace/db");
var drizzle_orm_1 = require("drizzle-orm");
var scrypt = (0, node_util_1.promisify)(node_crypto_1.default.scrypt);
var COOKIE_NAME = "event_checkin_session";
var SESSION_TTL_MS = 12 * 60 * 60 * 1000;
var secret = function () { var _a; return (_a = process.env.SESSION_SECRET) !== null && _a !== void 0 ? _a : "development-only-event-checkin-secret"; };
function sign(value) {
    return node_crypto_1.default.createHmac("sha256", secret()).update(value).digest("base64url");
}
function encodeSession(payload) {
    var value = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return "".concat(value, ".").concat(sign(value));
}
function decodeSession(value) {
    if (!value)
        return null;
    var _a = value.split("."), encoded = _a[0], signature = _a[1];
    if (!encoded || !signature)
        return null;
    var expected = sign(encoded);
    var expectedBuffer = Buffer.from(expected);
    var actualBuffer = Buffer.from(signature);
    if (expectedBuffer.length !== actualBuffer.length ||
        !node_crypto_1.default.timingSafeEqual(expectedBuffer, actualBuffer)) {
        return null;
    }
    try {
        var payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
        if (!payload.username || !payload.expiresAt || payload.expiresAt < Date.now())
            return null;
        return payload;
    }
    catch (_b) {
        return null;
    }
}
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, derivedKey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    salt = node_crypto_1.default.randomBytes(16).toString("hex");
                    return [4 /*yield*/, scrypt(password, salt, 64)];
                case 1:
                    derivedKey = (_a.sent());
                    return [2 /*return*/, "scrypt$".concat(salt, "$").concat(derivedKey.toString("hex"))];
            }
        });
    });
}
function verifyPassword(password, storedHash) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, algorithm, salt, expectedHex, derivedKey, expected;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = storedHash.split("$"), algorithm = _a[0], salt = _a[1], expectedHex = _a[2];
                    if (algorithm !== "scrypt" || !salt || !expectedHex)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, scrypt(password, salt, 64)];
                case 1:
                    derivedKey = (_b.sent());
                    expected = Buffer.from(expectedHex, "hex");
                    return [2 /*return*/, expected.length === derivedKey.length && node_crypto_1.default.timingSafeEqual(expected, derivedKey)];
            }
        });
    });
}
function setSession(res, username) {
    var maxAge = SESSION_TTL_MS;
    res.cookie(COOKIE_NAME, encodeSession({ username: username, expiresAt: Date.now() + maxAge }), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: maxAge,
        path: "/",
    });
}
function clearSession(res) {
    res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax", path: "/" });
}
function getSessionUser(req) {
    return __awaiter(this, void 0, void 0, function () {
        var payload, user;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    payload = decodeSession((_a = req.cookies) === null || _a === void 0 ? void 0 : _a[COOKIE_NAME]);
                    if (!payload)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, db_1.db
                            .select({ username: db_1.organizerUsersTable.username, displayName: db_1.organizerUsersTable.displayName })
                            .from(db_1.organizerUsersTable)
                            .where((0, drizzle_orm_1.eq)(db_1.organizerUsersTable.username, payload.username))
                            .limit(1)];
                case 1:
                    user = (_b.sent())[0];
                    return [2 /*return*/, user !== null && user !== void 0 ? user : null];
            }
        });
    });
}
