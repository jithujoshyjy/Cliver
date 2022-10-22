import { readFile } from "fs/promises";

const code = await readFile("./code.cli", "utf-8").catch((e) => console.log(e));

if (code) {
  
}