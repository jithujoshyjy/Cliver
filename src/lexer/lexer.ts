import { EOL } from "os";
import { operators, punctuators } from "../parser/utility.js";
import { TokenStream } from "./token.js";

export function tokenize(codeStr: string, file: string = '') {
    const tokens: LexicalToken[] = []
    const code = [...(codeStr.match(/[\s\S]/gu) ?? [])]

    const unicodeOperator = /[\u0021\u0025\u0026\u002A\u002B\u002D\u002E\u002F\u003A\u005C\u005E\u0060\u007C\u007E\u00D7\u00F7\u003C-\u0040\u00A1-\u00AC\u00AE-\u00BF\u2100-\u215F\u2180-\u21FF\u2500-\u25FF\u2200-\u22FF]/u

    const isDigit = (char: string) => (/\d/u).test(char)
    const isAlpha = (char: string) => (/[\p{L}\p{Emoji_Presentation}_]/u).test(char)
    const isAlNum = (char: string) => (/[\p{L}\p{Emoji}_\d]/u).test(char)
    const isNewline = (char: string) => (/[\r\n]/u).test(char)
    const isWhiteSpace = (char: string) => (/\s/u).test(char)
    const isOperator = (char: string) => operators.includes(char) || unicodeOperator.test(char)
    const isPunctuator = (char: string) => punctuators.includes(char)

    const tokenGenerators = [
        generateInteger, generateNewline,
        generateWhitespace, generatePunctuator,
        generateOperator, generateWord,
        generateUnknownToken
    ]

    let line = +!!code.length, column = line, start = 0, end = 0
    while (code.length) {
        let token: LexicalToken = null!
        for (let tokenGenerator of tokenGenerators) {
            token = tokenGenerator(code)
            if (token.type != "EmptyToken")
                break
        }
        if (token.type == "EmptyToken")
            break
        tokens.push(token)
    }

    return new TokenStream(codeStr, tokens)
    function generateInteger(code: string[]) {
        const integer: LexicalToken = {
            type: "Integer",
            value: null!,
            file,
            line,
            column,
            start,
            end
        }

        const value = parseWhile(code, isDigit)
        if (value === "")
            return generateEmptyToken(code)

        integer.value = value
        integer.end = end-1
        start = end

        return integer
    }

    function generateWord(code: string[]) {
        const word: LexicalToken = {
            type: "Word",
            value: null!,
            file,
            line,
            column,
            start,
            end
        }

        const value = parseWhile(code, isAlpha)
        if (value === "")
            return generateEmptyToken(code)

        word.value = value
        word.end = end-1
        start = end

        return word
    }

    function generateWhitespace(code: string[]) {
        const whitespace: LexicalToken = {
            type: "Whitespace",
            value: null!,
            file,
            line,
            column,
            start,
            end
        }

        const value = parseWhile(code, isWhiteSpace)
        if (value === "")
            return generateEmptyToken(code)

        whitespace.value = value
        whitespace.end = end-1
        start = end

        return whitespace
    }

    function generateOperator(code: string[]) {
        const _operator: LexicalToken = {
            type: "Operator",
            value: null!,
            file,
            line,
            column,
            start,
            end
        }
        const value = parseWhile(code, isOperator)
        if (value === "")
            return generateEmptyToken(code)

        _operator.value = value
        _operator.end = end-1
        start = end

        return _operator
    }

    function generatePunctuator(code: string[]) {
        const punctuator: LexicalToken = {
            type: "Punctuator",
            value: null!,
            file,
            line,
            column,
            start,
            end
        }

        const value = isPunctuator(code[0]) ? code.shift()! : ""
        if (value === "")
            return generateEmptyToken(code)

        punctuator.value = value
        punctuator.end = end
        start = ++end
        column++

        return punctuator
    }

    function generateNewline(code: string[]) {
        const newline: LexicalToken = {
            type: "Newline",
            value: null!,
            file,
            line,
            column,
            start,
            end
        }

        let value = ""
        while (code.length) {
            if (value === EOL)
                break

            const char = code[0]
            if (!isNewline(char))
                break

            end++
            value += char
            code.shift()
        }

        if (value === "")
            return generateEmptyToken(code)

        newline.value = value
        line++
        newline.end = end-1
        start = end
        column = 1

        return newline
    }

    function generateUnknownToken(code: string[]) {
        const unknownToken: LexicalToken = {
            type: "UnknownToken",
            value: null!,
            file,
            line,
            column,
            start,
            end
        }

        const value = code.shift()
        if (!value)
            return generateEmptyToken(code)

        unknownToken.value = value
        unknownToken.end = end
        start = end++
        column++

        return unknownToken
    }

    function generateEmptyToken(code: string[]) {
        const emptyToken: LexicalToken = {
            type: "EmptyToken",
            value: "",
            file,
            line,
            column,
            start,
            end
        }

        return emptyToken
    }

    function parseWhile(code: string[], predecate: (char: string) => boolean) {
        let res = ""
        while (code.length) {
            const char = code[0]
            if (!predecate(char))
                break

            res += char
            column++
            end++
            code.shift()
        }
        return res
    }
}