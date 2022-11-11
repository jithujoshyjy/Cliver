import { type Token, TokenStream, TokenType } from "./token.js";
import { EOL } from "os";

export function tokenize(codeStr: string | string[], fileName: string = ''): Token | TokenStream {

    function* _tokenize(i: number, _line: number, _pos: number): Generator<Token | TokenStream> {

        const tokens: Token[] = [];
        const code = typeof codeStr == 'string' ? [...(codeStr.trim().match(/[\s\S]/gu) ?? [])] : codeStr;

        let line = _line;
        let pos = _pos;

        const isAlpha = (char: string) => (/[\p{L}_]/u).test(char);
        const isAlNum = (char: string) => (/[\p{L}\d_]/u).test(char);
        const isDigit = (char: string) => (/\d/u).test(char);
        const isDotFloat = (char: string, i: number) => {
            if (char == '.') {
                const nextChar = code[i + 1];
                return !!nextChar && isDigit(nextChar);
            }
            return false;
        }

        const isUnderscore = (char: string, res: string) => (/\d$/gu).test(res) && char == '_';
        const isNumber = (numStr: string) => (/^(?:(?:\d+(?:_?\d+)*|\d)?\.)?(?:\d+(?:_?\d+)*|\d)$/ug).test(numStr);
        const isNewline = (char: string) => (/[\r\n]/u).test(char);
        const isWhiteSpace = (char: string) => (/\s/u).test(char);
        const isComment = (char: string) => char == '#';
        const isOperator = (char: string) => operators.includes(char) || unicodeOpr.test(char);
        const isPunctuator = (char: string) => punctuators.includes(char);
        const isString = (char: string) => char == '"';
        const isChar = (char: string) => char == "'";
        const isSymbol = (char: string) => char == '\\';
        const isMultilineString = (char: string, i: number) => code.slice(i, i + 3).every(x => x == char)

        const keywords = [
            "done", "do", "fun", "var", "val", "type",
            "data", "expr", "end", "ref", "stmt", "static",
            "return", "yield", "break", "continue", "case",
            "if", "elseif", "else", "for", "try", "catch",
            "throw", "in!", "in", "self", "meta", "payload",
            "of", "use!", "use", "import", "export", "from",
            "getter", "setter", "to", "is!", "is", "as", "await"
        ];

        const collPunches = { '(': ')', '[': ']', '{': '}' };
        const punctuators = ['(', ')', '[', ']', '{', '}', ',', ';', '\'', '"', '`'];
        const operators = [
            "=", ":", "@", "~", ".", "?", "|", "&", "~", "!", "+", "-", "*", "^", "/",
            "%", "<", ">", "\\"
        ];
        const unicodeOpr = /[\u0021\u0025\u0026\u002A\u002B\u002D\u002E\u002F\u003A\u005C\u005E\u0060\u007C\u007E\u00D7\u00F7\u003C-\u0040\u00A1-\u00AC\u00AE-\u00BF\u2100-\u215F\u2180-\u21FF\u2500-\u25FF\u2200-\u22FF]/u;

        for (i = i; i < code.length; i++) {
            let char = code[i];
            if (isAlpha(char)) { // identifier | keyword
                let res = '';
                const startPos = pos;
                ({ res, i, pos, char } = parseIdentifier(char, i, pos));
                const token = {
                    value: res,
                    type: keywords.includes(res)
                        ? TokenType.Keyword
                        : TokenType.Identifier,
                    line,
                    i,
                    column: startPos,
                    file: fileName,
                    toString() {
                        return `${this.type}(${this.value})`;
                    }
                };
                tokens.push(token);
                yield token;
            }
            else if (isDigit(char) || isDotFloat(char, i)) { // integer | float

                let res = '', type: TokenType;
                const startPos = pos;
                const parsedNum = parseNumber(char, i, pos);

                if (!isNumber(parsedNum.res))
                    throw new Error(`Unexpected token '${parsedNum.res}' on ${line}:${startPos}`);

                ({ res, i, pos, char, type } = parsedNum);
                const token = {
                    value: res,
                    type,
                    line,
                    i,
                    column: startPos,
                    file: fileName,
                    toString() {
                        return `${this.type}(${this.value})`;
                    }
                };
                tokens.push(token);
                yield token;
            }
            else if (isNewline(char)) { // newline
                let res = '';
                const startPos = pos;

                ({ res, i, pos, char, line } = parseNewline(char, i, pos));
                const token = {
                    value: res,
                    type: TokenType.Newline,
                    line,
                    i,
                    column: startPos,
                    file: fileName,
                    toString() {
                        return `${this.type}('\\n')`;
                    }
                };
                tokens.push(token);
                line++;
                yield token;
            }
            else if (isWhiteSpace(char)) { // whitespace
                let res = '';
                const startPos = pos;

                ({ res, i, pos, char, line } = parseWhiteSpace(char, i, pos));
                const token = {
                    value: res,
                    type: TokenType.WhiteSpace,
                    line,
                    i,
                    column: startPos,
                    file: fileName,
                    toString() {
                        const wsCodePoints = (this.value as string)
                            .split('')
                            .map(x => '\\u' + x.codePointAt(0)?.toString().padStart(6, '0'))
                            .join('');
                        return `${this.type}(${wsCodePoints})`;
                    }
                };
                tokens.push(token);
                yield token;
            }
            else if (isComment(char)) { // singleline | multiline comment
                let res = '', type: TokenType;
                const startPos = pos;

                ({ res, i, pos, char, type, line } = parseComment(char, i, pos));
                const token = {
                    value: res,
                    type,
                    line,
                    i,
                    column: startPos,
                    file: fileName,
                    toString() {
                        return `${this.type}(${this.value})`;
                    }
                };

                tokens.push(token);

                if (type === TokenType.SingleLineComment)
                    line++;

                yield token;
            }
            else if (isString(char)) { // inline | multiline string
                let res: Array<string | object> = [''], type = TokenType.InlineASCIIStringLiteral;
                const startPos = pos;

                const skipables = [
                    TokenType.MultiLineComment,
                    TokenType.WhiteSpace,
                ];

                const strTagEndsWith = [
                    TokenType.ParenEnclosed,
                    TokenType.BracketEnclosed,
                    TokenType.Identifier
                ];

                const isMultiStr = isMultilineString(char, i);

                for (let j = tokens.length - 1; j >= 0; j--) {
                    const token = tokens[j];

                    if (!skipables.includes(token.type)) {

                        if (isMultiStr) { // multiline string
                            if (strTagEndsWith.includes(token.type)) { // format string
                                ({ res, i, pos, char, line, type } = parseMultilineFormatString(char, i, pos));
                            }
                            else { // regular string
                                ({ res, i, pos, char, line, type } = parseMultilineStringLiteral(char, i, pos));
                            }
                        }
                        else { // inline string
                            if ([TokenType.InlineFormatString, ...strTagEndsWith].includes(token.type)) {
                                // format string
                                ({ res, i, pos, char, line, type } = parseInlineFormatString(char, i, pos));
                            }
                            else { // regular string
                                ({ res, i, pos, char, line, type } = parseInlineStringLiteral(char, i, pos));
                            }
                        }
                        break;
                    }
                }

                if (tokens.length === 0) {
                    if (isMultiStr) { // regular multiline string
                        ({ res, i, pos, char, line, type } = parseMultilineStringLiteral(char, i, pos));
                    }
                    else { // regular inline string
                        ({ res, i, pos, char, line, type } = parseInlineStringLiteral(char, i, pos));
                    }
                }


                const token = {
                    value: res,
                    type,
                    line,
                    i,
                    column: startPos,
                    file: fileName,
                    toString() {
                        return `${this.type}(${res.join(', ')})`;
                    }
                };
                tokens.push(token);
                yield token;
            }
            else if (isChar(char)) { // ASCII character | Unicode character
                let res: Array<string | object> = [''], type: TokenType;
                const startPos = pos;

                ({ res, i, pos, char, line, type } = parseChar(char, i, pos));
                const token = {
                    value: res,
                    type,
                    line,
                    i,
                    column: startPos,
                    file: fileName,
                    toString() {
                        return `${this.type}(${this.value.toString()})`;
                    }
                };
                tokens.push(token);
                yield token;
            }
            else if (isSymbol(char)) { // symbolic (ASCII | Unicode) character | symbolic (ASCII | Unicode) string
                let res = '', type: TokenType;
                const startPos = pos;

                ({ res, i, pos, char, line, type } = parseSymbol(char, i, pos));
                const token = {
                    value: res,
                    type,
                    line,
                    i,
                    column: startPos,
                    file: fileName,
                    toString() {
                        return `${this.type}(${this.value})`;
                    }
                };
                tokens.push(token);
                yield token;
            }
            else if (isOperator(char)) { // operator
                let res = '';
                const startPos = pos;

                ({ res, i, pos, char, line } = parseOperator(char, i, pos));
                const token = {
                    value: res,
                    type: TokenType.Operator,
                    line,
                    i,
                    column: startPos,
                    file: fileName,
                    toString() {
                        return `${this.type}(${this.value})`;
                    }
                };
                tokens.push(token);
                yield token;
            }
            else if (isPunctuator(char)) { // punctuator | collection
                if (char in collPunches) { // collection
                    let res: Array<string | object> = [], type: TokenType;
                    const startPos = pos;

                    ({ res, i, pos, char, line, type } = parseCollection(code, char, i, pos));
                    const token = {
                        value: res,
                        type,
                        line,
                        i,
                        column: startPos,
                        file: fileName,
                        toString() {
                            return `${this.type}(${res.join(', ')})`;
                        }
                    };
                    tokens.push(token);
                    yield token;
                }
                else { // punctuator
                    let res = '';
                    const startPos = pos;

                    ({ res, i, pos, char, line } = parsePunctuator(char, i, pos));
                    const token = {
                        value: res,
                        type: TokenType.Punctuator,
                        line,
                        i,
                        column: startPos,
                        file: fileName,
                        toString() {
                            return `${this.type}('${this.value}')`;
                        }
                    };
                    tokens.push(token);
                    yield token;
                }
            }
            else {
                pos++;
            }
        }

        return new TokenStream(tokens);

        function parseIdentifier(char: string, i: number, pos: number) {
            let res = '';
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
            let res = '';
            const consumeChar = (omit = false) => {
                if (!omit) {
                    res += char;
                }
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
            let res = '';
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
            let res = '';
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
            let res = '', type: TokenType, _line = line;
            const consumeChar = (omit = false) => {
                if (!omit) {
                    res += char;
                }
                i++;
                pos++;
                char = code[i];
            };
            consumeChar(true); // #
            if (char === "=") { // multiline comment
                type = TokenType.MultiLineComment
                consumeChar(true);
                void function parseMultilineComment() {
                    while (char && char !== '=') {
                        if (isNewline(char)) {
                            line++;
                            pos = 0;
                        }
                        consumeChar();
                    }
                    if (char === '=') {
                        consumeChar(true);
                        // @ts-ignore
                        if (char === '#' || i >= code.length - 1)
                            consumeChar(true);
                        else
                            parseMultilineComment()
                    }
                }()
            }
            else { // singleline comment
                type = TokenType.SingleLineComment
                while (char && !isNewline(char) && i <= code.length - 1)
                    consumeChar();
                if (isNewline(char)) {
                    let nl: string;
                    ({ res: nl, i, pos, char, line } = parseNewline(char, i, pos));
                    i++;
                    res += nl;
                }
            }
            return { res, i: i - 1, pos, char, line: _line, type };
        }

        function parseOperator(char: string, i: number, pos: number) {
            let res = ''
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
            let res: string = '';
            const consumeChar = (omit = false) => {
                if (!omit) {
                    res += char;
                }
                i++;
                pos++;
                char = code[i];
            };
            consumeChar();
            return { res, i: i - 1, pos, char, line, type: TokenType.Punctuator };
        }

        function parseInlineFormatString(char: string, i: number, pos: number) {
            const res: Array<string | object> = [''];
            const consumeChar = (omit = false) => {
                i++;
                pos++;
                if (!omit) {
                    res[res.length - 1] += char;
                }
                char = code[i];
            };
            consumeChar(true); //  "
            while (i < code.length) {
                if (char == '\\') {
                    const escSequence = parseEscapeSequence(char, i, pos);
                    ({ i, pos, char } = escSequence);
                    res.push(escSequence, '');
                }
                else if (char == '"') {
                    consumeChar(true); //  "
                    break;
                }
                else if (char == '$') {
                    consumeChar(true); //  $
                    if (isAlpha(char)) { // identifier
                        let _res = '';
                        const startPos = pos;
                        ({ res: _res, pos, char } = parseIdentifier(char, i, pos));

                        if (keywords.includes(_res))
                            throw new Error(`Unexpected keyword '${_res}' on ${line}:${pos}`);


                        i += _res.length;

                        char = code[i];

                        if (res[res.length - 1] === '')
                            res.pop();

                        res.push({
                            value: _res,
                            type: TokenType.Identifier,
                            line,
                            column: startPos,
                            file: fileName,
                        }, '');
                    }
                    else {
                        throw new Error(`Unexpected character '${char}' on ${line}:${pos}`);
                    }
                }
                else if (char == '{') {
                    const startPos = pos;

                    const interExpr = parseCollection(code, char, i, pos);
                    i = interExpr.i;

                    char = code[i];

                    if (res[res.length - 1] === '')
                        res.pop();

                    const token = {
                        value: interExpr.res,
                        type: interExpr.type,
                        line,
                        i,
                        column: startPos,
                        file: fileName,
                        toString() {
                            return `${this.type}(${this.value.join(', ')})`;
                        }
                    };

                    res.push(token, '');
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
            const res: Array<string | object> = [''];
            let containsUnicodeChar = false;
            const consumeChar = (omit = false) => {
                if (!omit) {
                    res[res.length - 1] += char;
                }
                i++;
                pos++;
                char = code[i];
            };
            consumeChar(true); //  "
            while (i < code.length) {
                if (char == '\\') {
                    const j = i + 1;
                    const escSequence = parseEscapeSequence(char, i, pos);
                    ({ i, pos, char } = escSequence);
                    containsUnicodeChar = containsUnicodeChar || !!code[j] && /u/i.test(code[j]);
                    res.push(escSequence, '');
                }
                else if (char == '"') {
                    consumeChar(true); //  "
                    break;
                }
                else if (char == '\n') {
                    throw new Error(`Unexpected linebreak inside of an inline string on ${line}:${pos}`);
                }
                else {
                    containsUnicodeChar = containsUnicodeChar || !!char && char.codePointAt(0)! > 127;
                    consumeChar();
                }
            }
            return {
                res, i: i - 1, pos, char, line,
                type: containsUnicodeChar
                    ? TokenType.InlineUnicodeStringLiteral
                    : TokenType.InlineASCIIStringLiteral
            };
        }

        function parseMultilineStringLiteral(char: string, i: number, pos: number) {
            const res: Array<string | object> = [];
            let containsUnicodeChar = false;
            const consumeChar = (omit = false) => {
                if (!omit) {
                    res[res.length - 1] += char;
                }
                i++, pos++, char = code[i];
            };

            let quotesCount = 0;
            while (char == '"') {
                consumeChar(true);
                quotesCount++;
            }

            if(i < code.length && res.length == 0)
                res.push('');

            while (i < code.length) {
                
                if (char == '\\') {
                    const j = i + 1;
                    const escSequence = parseEscapeSequence(char, i, pos);
                    ({ i, pos, char } = escSequence);
                    containsUnicodeChar = containsUnicodeChar || !!code[j] && /u/i.test(code[j]);
                    res.push(escSequence, '');
                }
                else if (char == '"' && isMultilineString(char, i)) {

                    let _quotesCount = 0;
                    while (char === '"') {
                        consumeChar(true);
                        _quotesCount++;
                    }
                    if (quotesCount !== _quotesCount) {
                        if (i >= code.length - 1) {
                            throw new Error(`Expected the multiline string to end with ${quotesCount} quotes on ${line}:${pos-1}`);
                        }
                        res[res.length - 1] += '"'.repeat(_quotesCount);
                        continue;
                    }
                    break;
                }
                else if (isNewline(char)) {
                    let nl: string;
                    ({ res: nl, i, pos, char, line } = parseNewline(char, i, pos));
                    i++;
                    res[res.length - 1] += nl;
                }
                else {
                    containsUnicodeChar = containsUnicodeChar || !!char && char.codePointAt(0)! > 127;
                    consumeChar();
                }
            }
            

            if(res.length === 0) {
                throw new Error(`Expected the multiline string to end with ${quotesCount} quotes on ${line}:${pos-1}`);
            }
            
            return {
                res, i: i - 1, pos, char, line,
                type: containsUnicodeChar
                    ? TokenType.MultilineUnicodeStringLiteral
                    : TokenType.MultilineASCIIStringLiteral
            };
        }

        function parseMultilineFormatString(char: string, i: number, pos: number) {
            const res: Array<string | object> = [''];
            const consumeChar = (omit = false) => {
                i++;
                pos++;
                if (!omit) {
                    res[res.length - 1] += char;
                }
                char = code[i];
            };

            let quotesCount = 0;
            while (char == '"') {
                consumeChar(true);
                quotesCount++;
            }

            if(i < code.length && res.length == 0)
                res.push('');

            while (i < code.length) {
                if (char == '\\') {
                    const escSequence = parseEscapeSequence(char, i, pos);
                    ({ i, pos, char } = escSequence);
                    res.push(escSequence, '');
                }
                else if (char == '"' && isMultilineString(char, i)) {
                    let _quotesCount = 0;
                    while (char === '"') {
                        consumeChar(true);
                        _quotesCount++;
                    }
                    if (quotesCount !== _quotesCount) {
                        if (i >= code.length - 1) {
                            throw new Error(`Expected the multiline string to end with ${quotesCount} quotes on ${line}:${pos-1}`);
                        }
                        continue;
                    }
                    break;
                }
                else if (char == '$') {
                    consumeChar(true); //  $
                    if (isAlpha(char)) { // identifier
                        let _res = '';
                        const startPos = pos;
                        ({ res: _res, pos, char } = parseIdentifier(char, i, pos));

                        if (keywords.includes(_res))
                            throw new Error(`Unexpected keyword '${_res}' on ${line}:${pos}`);


                        i += _res.length;

                        char = code[i];

                        if (res[res.length - 1] === '')
                            res.pop();

                        res.push({
                            value: _res,
                            type: TokenType.Identifier,
                            line,
                            column: startPos,
                            file: fileName,
                        }, '');
                    }
                    else {
                        throw new Error(`Unexpected character '${char}' on ${line}:${pos}`);
                    }
                }
                else if (char == '{') {
                    const startPos = pos;

                    const interExpr = parseCollection(code, char, i, pos);
                    i = interExpr.i;

                    char = code[i];

                    if (res[res.length - 1] === '')
                        res.pop();

                    const token = {
                        value: interExpr.res,
                        type: interExpr.type,
                        line,
                        i,
                        column: startPos,
                        file: fileName,
                        toString() {
                            return `${this.type}(${this.value.join(', ')})`;
                        }
                    };

                    res.push(token, '');
                }
                else if (isNewline(char)) {
                    let nl: string;
                    ({ res: nl, i, pos, char, line } = parseNewline(char, i, pos));
                    i++;
                    res[res.length - 1] += nl;
                }
                else {
                    consumeChar();
                }
            }

            if(res.length === 0) {
                throw new Error(`Expected the multiline string to end with ${quotesCount} quotes on ${line}:${pos-1}`);
            }

            return { res, i: i - 1, pos, char, line, type: TokenType.MultilineFormatString };
        }

        function parseEscapeSequence(char: string, i: number, pos: number) {
            let raw = '', value = '';
            const consumeChar = (omit = false) => {
                if (!omit) {
                    raw += char;
                }
                i++;
                pos++;
                char = code[i];
            };
            consumeChar(true); //  \
            if (/u/i.test(char)) { // parse unicode sequence
                let sequence = '';
                consumeChar(true); // u
                const _consumeChar = () => {
                    sequence += char;
                    consumeChar();
                };
                for (let k = 1; k <= 6; k++) {
                    if (/[0-9a-f]/i.test(char))
                        _consumeChar();
                    else
                        throw new Error(`Invalid unicode escape sequence '\\u${raw}' on ${line}:${pos}`);
                }
                value = String.fromCharCode(+`0x${sequence}`);
            }
            else { // parse regular escape sequence
                value = eval(`"\\${char}"`);
                consumeChar();
            }
            return { raw, i, pos, char, line, value, type: TokenType.EscapeSequence };
        }

        function parseCollection(code: string | string[], char: string, i: number, pos: number) {
            const res: Array<string | object> = [];
            const type = char === '('
                ? TokenType.ParenEnclosed
                : char === '['
                    ? TokenType.BracketEnclosed
                    : TokenType.BraceEnclosed;

            i++, pos++; // skip (

            const tokenGenerator = _tokenize(i, line, pos);
            let closingSigilFound = false;
            type openingPunches = '(' | '[' | '{';
            const closingPunch = collPunches[char as openingPunches];
            for (let token of tokenGenerator) {
                token = token as Token;
                if (token.value === closingPunch) {
                    pos = token.column;
                    line = token.line;
                    i = token.i - 1;
                    char = token.value;

                    closingSigilFound = true;
                    break;
                } else {
                    res.push(token);
                }
            }

            if (!closingSigilFound) {
                const lastToken = res[res.length - 1] as Token;
                throw new Error(`Expected a closing '${closingPunch}' after line ${lastToken.line}`)
            }

            return { res, i: i + 1, pos, char, line, type };
        }

        function parseChar(char: string, i: number, pos: number) {
            const res: Array<string | object> = [''];
            let isUnicodeChar = false;
            const startPos = pos;
            const consumeChar = (omit = false) => {
                if (!omit) {
                    res[res.length - 1] += char;
                }
                i++;
                pos++;
                char = code[i];
            };
            consumeChar(true); // '
            if (char == '\\') {
                const j = i + 1;
                const escSequence = parseEscapeSequence(char, i, pos);
                ({ i, pos, char } = escSequence);
                isUnicodeChar = !!code[j] && /u/i.test(code[j]);
                res.push(escSequence);
            }
            else {
                isUnicodeChar = !!char && char.codePointAt(0)! > 127;
                if (char == "'")
                    throw new Error(`Invalid character literal on ${line}:${startPos}`);
                consumeChar();
            }

            if (char == "'") {
                consumeChar(true); //  '
            }
            else {
                throw new Error(`Unexpected character '${char}' on ${line}:${pos}`);
            }

            return {
                res, i: i - 1, pos, char, line,
                type: isUnicodeChar
                    ? TokenType.UnicodeCharLiteral
                    : TokenType.ASCIICharLiteral
            };
        }

        function parseSymbol(char: string, i: number, pos: number) {
            let res = '', containsUnicodeChar = false;

            const consumeChar = (omit = false) => {
                if (!omit) {
                    res += char;
                }
                i++;
                pos++;
                char = code[i];
            };

            consumeChar(true); // \
            while (char && isAlNum(char)) {
                containsUnicodeChar = char.codePointAt(0)! > 127;
                consumeChar();
            }

            if (res.length === 0)
                throw new Error(`Unexpected character '\\' on ${line}:${pos - 1}`)

            const isSymStr = res.length > 1;

            return {
                res, i: i - 1, pos, char, line,
                type: containsUnicodeChar
                    ? isSymStr ? TokenType.SymUnicodeStringLiteral : TokenType.SymUnicodeCharLiteral
                    : isSymStr ? TokenType.SymASCIIStringLiteral : TokenType.SymASCIICharLiteral
            };
        }
    }

    const tokenGenerator = _tokenize(0, 1, 1);
    let done = false, value = new TokenStream([]);

    while (!done) {
        ({ done = false, value } = tokenGenerator.next());
    }

    return value;
}