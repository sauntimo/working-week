"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRegion = exports.regions = void 0;
exports.regions = ['england-and-wales', 'scotland', 'northern-ireland'];
const isRegion = (x) => exports.regions.includes(x);
exports.isRegion = isRegion;
