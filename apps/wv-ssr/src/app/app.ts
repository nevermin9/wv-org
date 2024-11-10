// import { createReadStream } from "node:fs";
// import { Script } from "node:vm";
// import { walk } from "jsr:@std/fs";
// import { resolve, dirname } from "jsr:@std/path";
// import Mustache from "mustache";

// required named parameter
// "[anton]".match(/^\[(\w+)\]$/)
// [
//     "[anton]",
//     "anton"
// ]

// part of the path
// "anton".match(/^\[(\w+)\]$/)
// null


// optional
// "[[anton]]".match(/^\[\[(\w+)\]\]$/)
// [
//     "[[anton]]",
//     "anton"
// ]

// rest
// "[...anton]".match(/^\[\.\.\.(\w+)\]$/)
// [
//     "[...anton]",
//     "anton"
// ]
