#![allow(warnings)]
use clap::Parser;
use std::path::PathBuf;
use std::fs::File;
use std::io::Read;

#[derive(Parser)]
struct Cli {
    /// The path to the file to read
    path: PathBuf
}

fn main() {
    let code = get_args();
    //Lexer

    //Parse into AST

    //LLVM JIT compile

}

fn get_args() -> String {
    let args = Cli::parse();
    let mut file = File::open(args.path).expect("Cannot open file!");
    let mut code: String = String::from("");
    file.read_to_string(&mut code).expect("File cannot be read");
    return code;
}