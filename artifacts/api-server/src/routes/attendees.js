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
var drizzle_orm_1 = require("drizzle-orm");
var db_1 = require("@workspace/db");
var api_zod_1 = require("@workspace/api-zod");
var event_helpers_js_1 = require("./event-helpers.js");
var node_crypto_1 = require("node:crypto");
var router = (0, express_1.Router)();
router.use("/attendees", event_helpers_js_1.requireOrganizer);
router.get("/attendees", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var parsed, _a, q, _b, status, filters, attendees;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                parsed = api_zod_1.ListAttendeesQueryParams.safeParse(req.query);
                if (!parsed.success) {
                    res.status(400).json({ error: parsed.error.message });
                    return [2 /*return*/];
                }
                _a = parsed.data, q = _a.q, _b = _a.status, status = _b === void 0 ? "all" : _b;
                filters = [];
                if (q) {
                    filters.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(db_1.attendeesTable.name, "%".concat(q, "%")), (0, drizzle_orm_1.ilike)(db_1.attendeesTable.email, "%".concat(q, "%")), (0, drizzle_orm_1.ilike)(db_1.attendeesTable.qrId, "%".concat(q, "%"))));
                }
                if (status === "checked-in")
                    filters.push((0, drizzle_orm_1.isNotNull)(db_1.attendeesTable.checkedInAt));
                if (status === "pending")
                    filters.push((0, drizzle_orm_1.isNull)(db_1.attendeesTable.checkedInAt));
                return [4 /*yield*/, db_1.db
                        .select()
                        .from(db_1.attendeesTable)
                        .where(filters.length ? drizzle_orm_1.and.apply(void 0, filters) : undefined)
                        .orderBy((0, drizzle_orm_1.asc)(db_1.attendeesTable.name))];
            case 1:
                attendees = _c.sent();
                res.json(api_zod_1.ListAttendeesResponse.parse(attendees));
                return [2 /*return*/];
        }
    });
}); });
router.post("/attendees/import", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var parsed, values, existing, _a, fresh, skipped, inserted, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                parsed = api_zod_1.ImportAttendeesBody.safeParse(req.body);
                if (!parsed.success) {
                    res.status(400).json({ error: "Each attendee needs a name and ticket type." });
                    return [2 /*return*/];
                }
                values = parsed.data.attendees.map(function (attendee) {
                    var _a, _b;
                    return ({
                        qrId: ((_a = attendee.qrId) === null || _a === void 0 ? void 0 : _a.trim()) || "EVT-".concat((0, node_crypto_1.randomUUID)().slice(0, 8).toUpperCase()),
                        name: attendee.name.trim(),
                        email: ((_b = attendee.email) === null || _b === void 0 ? void 0 : _b.trim()) || null,
                        ticketType: attendee.ticketType.trim(),
                    });
                });
                _a = Set.bind;
                return [4 /*yield*/, db_1.db.select({ qrId: db_1.attendeesTable.qrId }).from(db_1.attendeesTable)];
            case 1:
                existing = new (_a.apply(Set, [void 0, (_c.sent()).map(function (row) { return row.qrId; })]))();
                fresh = values.filter(function (value) { return !existing.has(value.qrId); });
                skipped = values.length - fresh.length;
                if (!fresh.length) return [3 /*break*/, 3];
                return [4 /*yield*/, db_1.db.insert(db_1.attendeesTable).values(fresh).returning()];
            case 2:
                _b = _c.sent();
                return [3 /*break*/, 4];
            case 3:
                _b = [];
                _c.label = 4;
            case 4:
                inserted = _b;
                res.status(201).json(api_zod_1.ImportAttendeesResponse.parse({ imported: inserted.length, skipped: skipped, attendees: inserted }));
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
