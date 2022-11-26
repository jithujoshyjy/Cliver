import { TokenStream, TokenType } from "../../lexer/token.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { createMismatchToken, isKeyword, skip, skipables, _skipables, type Node } from "../utility"
import { generateDoCatchBlock } from "./doCatchBlock/doCatchBlock.js"
import { generateForBlock } from "./forBlock.js"
import { generateIfBlock } from "./ifBlock.js"

export function generateLabelDeclaration(context: Node, tokens: TokenStream): LabelDeclaration | MismatchToken {
    const labelDeclar: LabelDeclaration = {
        type: "LabelDeclaration",
        body: null!,
        name: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const labelName = generateIdentifier(labelDeclar, tokens)

    if (labelName.type == "MismatchToken")
        return labelName

    labelDeclar.name = labelName
    labelDeclar.start = labelName.start

    currentToken = skip(tokens, _skipables) // as

    if (!isKeyword(currentToken, "as")) {
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables)

    if (isKeyword(currentToken, "do")) { // do-catch block
        const value = generateDoCatchBlock(labelDeclar, tokens)
        if (value.type == "MismatchToken")
            return value
    }
    else if (isKeyword(currentToken, "for")) { // for-block
        const value = generateForBlock(labelDeclar, tokens)
        if (value.type == "MismatchToken")
            return value
    }
    else if (isKeyword(currentToken, "if")) { // if-block
        const value = generateIfBlock(labelDeclar, tokens)
        if (value.type == "MismatchToken")
            return value
    }
    else if (isKeyword(currentToken, "match")) { // match-inline
        const value = generateIfBlock(labelDeclar, tokens)
        if (value.type == "MismatchToken")
            return value
    }
    else if (isKeyword(currentToken, "fun")) { // anon-function
        const value = generateIfBlock(labelDeclar, tokens)
        if (value.type == "MismatchToken")
            return value
    }
    else if (currentToken.type == TokenType.Identifier || TokenType.ParenEnclosed) { // unit-function
        const value = generateIfBlock(labelDeclar, tokens)
        if (value.type == "MismatchToken")
            return value
    }
    else
        return createMismatchToken(currentToken)

    return labelDeclar
}