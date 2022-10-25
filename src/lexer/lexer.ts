import { type Token, TokenStream, TokenType } from "./token.js";
import { EOL } from "os";

export function tokenize(codeStr: string, fileName: string = ""): TokenStream {
    const tokens: Token[] = [];
    const code = [...(codeStr.trim().match(/[\s\S]/gu) ?? [])];

    let line = 1;
    let pos = 1;
    const isAlpha = (char: string) => (/[\p{L}_]/u).test(char);
    const isAlNum = (char: string) => (/[\p{L}\d_]/u).test(char);
    const isDigit = (char: string) => (/\d/u).test(char);
    const isUnderscore = (char: string, res: string) => (/\d$/gu).test(res) && char == '_';
    const isNumber = (numStr: string) => (/^(?:(?:\d+(?:_?\d+)*|\d)?\.)?(?:\d+(?:_?\d+)*|\d)$/ug).test(numStr);
    const isNewline = (char: string) => (/[\r\n]/u).test(char);
    const isWhiteSpace = (char: string) => (/\s/u).test(char);
    const isComment = (char: string) => char == '#';
    const isOperator = (char: string) => operators.includes(char) || unicodeOpr.test(char);
    const isPunctuator = (char: string) => punctuators.includes(char);
    const isString = (char: string) => char == '"';

    const keywords = [
        "done", "do", "fun", "var", "val", "type",
        "data", "expr", "end", "ref", "stmt", "static",
        "return", "yield", "break", "continue", "case",
        "if", "elseif", "else", "for", "try", "catch",
        "throw", "in!", "in", "self", "meta", "payload",
        "of", "use!", "use", "import", "export", "from",
        "getter", "setter", "to", "is!", "is", "as", "await"
    ];

    const punctuators = ['(', ')', '[', ']', '{', '}', ',', ';', '\'', '"', '`']
    const operators = [
        "=", ":", "@", "~", ".", "?", "|", "&", "~", "!", "+", "-", "*", "^", "/",
    "%", "<", ">", "\\"
    ]
    const unicodeOpr = /[\u0021\u0025\u0026\u002A\u002B\u002D\u002E\u002F\u003A\u005C\u005E\u0060\u007C\u007E\u00D7\u00F7\u003C-\u0040\u00A1-\u00AC\u00AE-\u00BF\u2100-\u215F\u2180-\u21FF\u2500-\u25FF\u2200-\u22FF]/u

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

            if (!isNumber(parsedNum.res))
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
        else if(isComment(char)) { // singleline | multiline comment
            let res = "", type: TokenType;
            const startPos = pos;

            ({ res, i, pos, char, type, line } = parseComment(char, i, pos));
            tokens.push({
                value: res,
                type,
                line,
                column: startPos,
                file: fileName,
            });

            if(type === TokenType.SingleLineComment)
                line++;
        }
        else if (isOperator(char)) { // operator
            let res = "";
            const startPos = pos;

            ({ res, i, pos, char, line } = parseOperator(char, i, pos));
            tokens.push({
                value: res,
                type: TokenType.Operator,
                line,
                column: startPos,
                file: fileName,
            });
        }
        else if(isString(char)) {
            let res: Array<string | object> = [""], type = TokenType.InlineStringLiteral;
            const startPos = pos;

            do {
                var j = tokens.length-1;
                const token = tokens[j] ?? {type: "unknown"};
                const skipables = [TokenType.MultiLineComment, TokenType.WhiteSpace];
                if(skipables.includes(token.type))
                    j--;
                else {
                    const strTagEndsWith = [TokenType.ParenEnclosed, TokenType.BracketEnclosed, TokenType.Identifier, TokenType.InlineFormatString];
                    if(strTagEndsWith.includes(token.type))
                        ({ res, i, pos, char, line, type } = parseInlineFormatString(char, i, pos));
                    else {
                        ({ res, i, pos, char, line, type } = parseInlineStringLiteral(char, i, pos));
                    }
                    break;
                }
            } while(j >= 0);

            tokens.push({
                value: res,
                type,
                line,
                column: startPos,
                file: fileName,
            });
        }
        else if (isPunctuator(char)) { // punctuator
            let res = "";
            const startPos = pos;

            ({ res, i, pos, char, line } = parsePunctuator(char, i, pos));
            tokens.push({
                value: res,
                type: TokenType.Punctuator,
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
        return { res, i: i - 1, pos, char };
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
            res, i: i - 1, pos, char,
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
        while (res !== EOL)
            consumeChar();
        return { res, i: i - 1, pos, char, line };
    }

    function parseWhiteSpace(char: string, i: number, pos: number) {
        let res = "";
        const consumeChar = () => {
            res += char;
            i++;
            pos++;
            char = code[i];
        };
        while (isWhiteSpace(char))
            consumeChar();
        return { res, i: i - 1, pos, char, line };
    }

    function parseComment(char: string, i: number, pos: number) {
        let res = "", type: TokenType, _line = line;
        const consumeChar = () => {
            res += char;
            i++;
            pos++;
            char = code[i];
        };
        consumeChar(); // #
        if (char === "=") { // multiline comment
            type = TokenType.MultiLineComment
            consumeChar();
            void function parseMultilineComment() {
                while (char && char !== '=')
                    consumeChar();
                if (char === '=') {
                    consumeChar();
                    // @ts-ignore
                    if (char === '#' || i >= code.length-1)
                        consumeChar();
                    else
                        parseMultilineComment()
	            }
            }()
        }
        else { // singleline comment
            type = TokenType.SingleLineComment
            while(char && char !== '\n' && i <= code.length-1)
                consumeChar();
            if(isNewline(char)) {
                let nl: string;
                ({ res: nl, i, pos, char, line } = parseNewline(char, i, pos));
                i++;
                res += nl;
                line++;
            }
        }
        return { res, i: i - 1, pos, char, line: _line, type };
    }

    function parseOperator(char: string, i: number, pos: number) {
        let res = ""
        const consumeChar = () => {
            res += char;
            i++;
            pos++;
            char = code[i];
        };
        while (isOperator(char))
            consumeChar();
        return { res, i: i - 1, pos, char, line };
    }

    function parsePunctuator(char: string, i: number, pos: number) {
        let res = "";
        const consumeChar = () => {
            res += char;
            i++;
            pos++;
            char = code[i];
        };
        consumeChar();
        return { res, i: i - 1, pos, char, line };
    }

    function parseInlineFormatString(char: string, i: number, pos: number) {
        const res: Array<string | object> = [""];
        const consumeChar = () => {
            res[res.length-1] += char;
            i++;
            pos++;
            char = code[i];
        };
        consumeChar(); //  "
        while (i < code.length) {
            if(char == '\\') {
                const escSequence = parseEscapeSequence(char, i, pos);
                ({ i, pos, char } = escSequence);
                res.push(escSequence, "");
            }
            else if(char == '"') {
                consumeChar(); //  "
                break;
            }
            else if (char == '\n') {
                throw new Error(`Unexpected linebreak inside of an inline string on ${line}:${pos}`);
            }
            else {
                consumeChar();
            }
        }
        return { res, i: i - 1, pos, char, line, type: TokenType.InlineFormatString };
    }

    function parseInlineStringLiteral(char: string, i: number, pos: number) {
        const res: Array<string | object> = [""];
        const consumeChar = () => {
            res[res.length-1] += char;
            i++;
            pos++;
            char = code[i];
        };
        consumeChar(); //  "
        while (i < code.length) {
            if(char == '\\') {
                const escSequence = parseEscapeSequence(char, i, pos);
                ({ i, pos, char } = escSequence);
                res.push(escSequence, "");
            }
            else if(char == '"') {
                consumeChar(); //  "
                break;
            }
            else if (char == '\n') {
                throw new Error(`Unexpected linebreak inside of an inline string on ${line}:${pos}`);
            }
            else {
                consumeChar();
            }
        }
        return { res, i: i - 1, pos, char, line, type: TokenType.InlineStringLiteral };
    }

    function parseEscapeSequence(char: string, i: number, pos: number) {
        let raw = "", value = "";
        const consumeChar = () => {
            raw += char;
            i++;
            pos++;
            char = code[i];
        };
        consumeChar(); //  \
        if(/u/i.test(char)) { // parse unicode sequence
            let sequence = "";
            consumeChar(); // u
            const _consumeChar = () => {
                sequence += char;
                consumeChar();
            };
            for(let k = 1; k <= 6; k++) {
                if(/[0-9a-f]/i.test(char))
                    _consumeChar();
                else
                    throw new Error(`Invalid unicode escape sequence '${raw}' on ${line}:${pos}`);
            }
            value = String.fromCharCode(+`0x${sequence}`);
        }
        else { // parse regular escape sequence
            consumeChar();
        }
        return { raw, i, pos, char, line, value, type: TokenType.EscapeSequence };
    }

    console.dir(tokens);
    return new TokenStream(tokens);
}