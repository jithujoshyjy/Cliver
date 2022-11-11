import { readFile } from "fs/promises";
import { tokenize } from "./lexer/lexer";
import { type Token, TokenStream, TokenType } from "./lexer/token";
import { generateAST } from "./parser/parser";

void async function main() {
    const [_, __, ...args] = process.argv;
    if (args.length < 1) {
        console.log("Please provide an input file");
        process.exit(1);
    }
    const code = await readFile(args[0], "utf-8");

    const tokens = tokenize(code, args[0]) as TokenStream;
    const ast = generateAST(tokens);

    for (let token of tokens) {
        console.log(token.toString());
    }

}()