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
var express_1 = require("express");
var db_1 = require("@workspace/db");
var drizzle_orm_1 = require("drizzle-orm");
var api_zod_1 = require("@workspace/api-zod");
var event_auth_js_1 = require("../lib/event-auth.js");
var event_seed_js_1 = require("../lib/event-seed.js");
var router = (0, express_1.Router)();
router.post("/auth/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var parsed, user, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, event_seed_js_1.ensureEventSeed)()];
            case 1:
                _b.sent();
                parsed = api_zod_1.LoginBody.safeParse(req.body);
                if (!parsed.success) {
                    res.status(400).json({ error: "Enter your username and password." });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, db_1.db
                        .select()
                        .from(db_1.organizerUsersTable)
                        .where((0, drizzle_orm_1.eq)(db_1.organizerUsersTable.username, parsed.data.username.trim()))
                        .limit(1)];
            case 2:
                user = (_b.sent())[0];
                _a = !user;
                if (_a) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, event_auth_js_1.verifyPassword)(parsed.data.password, user.passwordHash)];
            case 3:
                _a = !(_b.sent());
                _b.label = 4;
            case 4:
                if (_a) {
                    res.status(401).json({ error: "That username or password is not correct." });
                    return [2 /*return*/];
                }
                (0, event_auth_js_1.setSession)(res, user.username);
                res.json(api_zod_1.LoginResponse.parse({
                    user: { username: user.username, displayName: user.displayName },
                }));
                return [2 /*return*/];
        }
    });
}); });
router.post("/auth/logout", function (_req, res) {
    (0, event_auth_js_1.clearSession)(res);
    res.sendStatus(204);
});
router.get("/auth/me", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, event_auth_js_1.getSessionUser)(req)];
            case 1:
                user = _a.sent();
                if (!user) {
                    res.status(401).json({ error: "Not authenticated" });
                    return [2 /*return*/];
                }
                res.json(api_zod_1.GetCurrentUserResponse.parse(user));
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
