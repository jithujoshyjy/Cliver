import pkg from "peggy";
import { readFile } from "fs/promises";

const { generate } = pkg;

const grammar = await readFile("./grammar.peggy", "utf-8").catch((e) =>
  console.log(e)
);

const code = await readFile("./code.cli", "utf-8").catch((e) => console.log(e));

if (grammar && code) {
  const parser = generate(grammar);
  const ast = parser.parse(code);
  console.log(ast);
}
