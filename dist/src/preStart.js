"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const command_line_args_1 = __importDefault(require("command-line-args"));
// Setup command line options
const options = command_line_args_1.default([
    {
        name: 'env',
        alias: 'e',
        defaultValue: 'development',
        type: String,
    },
]);
// Set the env file
const result2 = dotenv_1.default.config({
    path: `./env/${options.env}.env`,
});
if (result2.error) {
    throw result2.error;
}
