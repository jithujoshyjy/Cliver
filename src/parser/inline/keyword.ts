import { TokenStream } from "../../lexer/token.js"
import { createDiagnosticMessage, createMismatchToken, DiagnosticMessage, isOperator, isPunctuator, keywords, PartialParse, type Node } from "../utility.js"
import { generateIdentifier } from "./literal/identifier.js"

export function generateKeyword(context: Node, tokens: TokenStream): Keyword | MismatchToken {
    const keyword: Keyword = {
        type: "Keyword",
        name: "",
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const maybeKeyword = generateIdentifier(keyword, tokens)
    if(maybeKeyword.type != "MismatchToken" || !maybeKeyword.partialParse) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    tokens.cursor = maybeKeyword.partialParse.cursor
    const identifier = maybeKeyword.partialParse.result as Identifier
    
    keyword.name = identifier.name
    keyword.start = identifier.start
    keyword.end = identifier.end

    keyword.line = identifier.line
    keyword.column = identifier.column

    return keyword
}