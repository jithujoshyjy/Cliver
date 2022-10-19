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
    let args = Cli::parse();
    let mut file = File::open(args.path).expect("Cannot open file!");
    let mut code: String = "".to_string();
    file.read_to_string(&mut code).expect("File cannot be read");
    println!("{}", code);

    //Lexer

    //Parse into AST

    //LLVM JIT compile

}