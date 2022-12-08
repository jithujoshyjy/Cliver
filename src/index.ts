import { readFile } from "fs/promises";
import { tokenize } from "./lexer/lexer.js";
import { TokenStream } from "./lexer/token.js";
import { generateAST } from "./parser/parser.js";

void async function main() {
    const [_, __, ...args] = process.argv;
    if (args.length < 1) {
        console.log("Error: Please provide an input file");
        process.exit(1);
    }
    const filepath = args[0];
    const code = await readFile(filepath, "utf-8");

    const tokens = tokenize(code, filepath) as TokenStream;
    const ast = generateAST(tokens);

    console.log("===Tokens===");
    
    for (let token of tokens) {
        console.log(token.toString());
    }

    console.log("===AST===");
    console.log(ast);

}()