import { type Token, TokenStream, TokenType } from "./token.js";
import { EOL } from "os";

export function tokenize(codeStr: string, fileName: string = ""): TokenStream {
    const tokens: Token[] = [];
    const code = [...(codeStr.trim().match(/[\s\S]/gu) ?? [])];

    let line = 1;
    let pos = 1;
    const isAlpha = (char: string) => (/\p{L}|_/u).test(char);
    const isAlNum = (char: string) => (/\p{L}|\d|_/u).test(char);
    const isDigit = (char: string) => (/\d/u).test(char);
    const isUnderscore = (char: string, res: string) => (/\d$/gu).test(res) && char == '_';
    const isNumber = (numStr: string) => (/^(?:(?:\d+(?:_?\d+)*|\d)?\.)?(?:\d+(?:_?\d+)*|\d)$/ug).test(numStr);
    const isNewline = (char: string) => (/[\r\n]/u).test(char);
    const isWhiteSpace = (char: string) => (/\s/u).test(char);

    const keywords = [
        "done", "do", "fun", "var", "val", "type",
        "data", "expr", "end", "ref", "stmt", "static",
        "return", "yield", "break", "continue", "case",
        "if", "elseif", "else", "for", "try", "catch",
        "throw", "in!", "in", "self", "meta", "payload",
        "of", "use!", "use", "import", "export", "from",
        "getter", "setter", "to", "is!", "is", "as", "await"
    ];

    for (let i = 0; i < code.length; i++) {
        let char = code[i];
        if (isAlpha(char)) { // identifier | keyword
            let res = "";
            const startPos = pos;
            ({ res, i, pos, char } = parseIdentifier(char, i, pos));
            tokens.push({
                value: res,
                type: keywords.includes(res)
                    ? TokenType.Keyword
                    : TokenType.Identifier,
                line,
                column: startPos,
                file: fileName,
            });
        }
        else if (isDigit(char) || char == '.') { // integer | float
            let res = "", type: TokenType;
            const startPos = pos;
            const parsedNum = parseNumber(char, i, pos);

            if(!isNumber(parsedNum.res))
                throw new Error(`Unexpected token '${parsedNum.res}' on ${line}:${startPos}`);
            
            ({ res, i, pos, char, type } = parsedNum);
            tokens.push({
                value: res,
                type,
                line,
                column: startPos,
                file: fileName,
            });
        }
        else if (isNewline(char)) { // newline
            let res = "";
            const startPos = pos;
            
            ({ res, i, pos, char, line } = parseNewline(char, i, pos));
            tokens.push({
                value: res,
                type: TokenType.Newline,
                line,
                column: startPos,
                file: fileName,
            });
            line++;
        }
        else if (isWhiteSpace(char)) { // whitespace
            let res = "";
            const startPos = pos;
            
            ({ res, i, pos, char, line } = parseWhiteSpace(char, i, pos));
            tokens.push({
                value: res,
                type: TokenType.WhiteSpace,
                line,
                column: startPos,
                file: fileName,
            });
        }
        else {
            pos++;
        }
    }

    function parseIdentifier(char: string, i: number, pos: number) {
        let res = "";
        const consumeChar = () => {
            res += char;
            i++;
            pos++;
            char = code[i];
        }
        while (char && isAlNum(char))
            consumeChar();
        if (char && char == "!")
            consumeChar();
        while (char && char == "'")
            consumeChar();
        return { res, i: i-1, pos, char };
    }

    function parseNumber(char: string, i: number, pos: number) {
        let res = "";
        const consumeChar = () => {
            res += char;
            i++;
            pos++;
            char = code[i];
        }
        const parseInteger = () => {
            while (char && isDigit(char) || isUnderscore(char, res))
                consumeChar();
        }
        parseInteger();
        if (char == '.')
            consumeChar();
        parseInteger();
        return {
            res, i: i-1, pos, char,
            type: res.includes('.')
                ? TokenType.FloatLiteral
                : TokenType.IntegerLiteral
        };
    }

    function parseNewline(char: string, i: number, pos: number) {
        let res = "";
        const consumeChar = () => {
            res += char;
            i++;
            pos = 1;
            char = code[i];
        };
        while(res !== EOL)
            consumeChar();
        return { res, i: i-1, pos, char, line };
    }

    function parseWhiteSpace(char: string, i: number, pos: number) {
        let res = ""
        const consumeChar = () => {
            res += char;
            i++;
            pos++;
            char = code[i];
        };
        while(isWhiteSpace(char))
            consumeChar();
        return { res, i: i-1, pos, char, line };
    }

    console.dir(tokens);
    return new TokenStream(tokens);
}