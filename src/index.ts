import { readFile } from "fs/promises";
import { TokenStream } from "./lexer/token.js";
import { generateAST } from "./parser/parser.js";
import { tokenize } from "./lexer/lexer.js";
import { printProgram } from "./parser/program.js";

void async function main() {
    const [_, __, ...args] = process.argv;
    if (args.length < 1) {
        console.log("Error: Please provide an input file");
        process.exit(1);
    }
    const filepath = args[0];
    const code = await readFile(filepath, "utf-8");
    
    const tokens = tokenize(code, filepath);
    const ast = generateAST(tokens);

    console.log("=== AST ===");
    // console.dir(ast, { depth: null });
    console.log(printProgram(ast))
}()