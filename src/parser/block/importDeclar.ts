import { TokenStream, TokenType } from "../../lexer/token.js"
import { generateTaggedSymbol } from "../inline/term/taggedSymbol.js"
import { skip, skipables, type Node } from "../utility"

export function generateImportDeclaration(context: Node, tokens: TokenStream): ImportDeclaration | MismatchToken {
    const importDeclr = {
        type: "ImportDeclaration",
        specifiers: [],
        source: {},
        start: 0,
        end: 0
    }

    let token = skip(tokens, skipables)
    if (token.type == TokenType.Identifier) {
        generateTaggedSymbol(context, tokens)
    }

    return importDeclr as unknown as ImportDeclaration
}