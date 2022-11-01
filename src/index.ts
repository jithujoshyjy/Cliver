import { readFile } from "fs/promises";

import { tokenize } from "./lexer/lexer.js";
import { TokenStream } from "./lexer/token.js";

void async function main() {
    const [_, __, ...args] = process.argv;
    if (args.length < 1) {
        console.log("Please provide an input file");
        process.exit(1);
    }
    const code = await readFile(args[0], "utf-8");
    
    const tokens: TokenStream = tokenize(code, args[0]) as TokenStream;
    
    for(let token of tokens) {
        console.log(token.toString());
    }

}()