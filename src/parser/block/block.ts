import { Token, TokenStream, TokenType } from "../../lexer/token.js"
import { createMismatchToken, isKeyword, isOperator, skip, skipables, type Node } from "../utility.js"
import { generateBlockMacroApplication } from "./blockMacroApplic.js"
import { generateDoCatchBlock } from "./doCatchBlock/doCatchBlock.js"
import { generateForBlock } from "./forBlock.js"
import { generateIfBlock } from "./ifBlock.js"
import { generateImportDeclaration } from "./importDeclar.js"
import { generateLabelDeclaration } from "./labelDeclar.js"
import { generateNamedFunction } from "./namedFunction.js"
import { generateUseDeclaration } from "./useDeclar.js"
import { generateVariableDeclaration } from "./varDeclar.js"

export function generateBlock(context: Node, tokens: TokenStream): Inline | Block | MismatchToken {
    const block: Block = {
        type: "Block",
        value: null!,
        start: 0,
        end: 0
    }

    const inline: Inline = {
        type: "Inline",
        value: null!,
        start: 0,
        end: 0
    }

    const startToken = skip(tokens, skipables)
    const initialCursor = tokens.cursor

    if (startToken.type == TokenType.Identifier) { // label-declaration
        const value = generateLabelDeclaration(block, tokens)
        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }

        block.value = value
        block.start = value.start
        block.end = value.end
        return block
    }
    else if (isOperator(startToken, "@@")) { // block-macro
        const value = generateBlockMacroApplication(block, tokens)
        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }

        block.value = value
        block.start = value.start
        block.end = value.end
        return block
    }
    else if (isKeyword(startToken, "use")) { // use-declaration
        const value = generateUseDeclaration(block, tokens)
        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }

        block.value = value
        block.start = value.start
        block.end = value.end
        return block
    }
    else if (isKeyword(startToken, "do")) { // do-catch block
        const literal: Literal = {
            type: "Literal",
            value: null!,
            start: 0,
            end: 0
        }
        const value = generateDoCatchBlock(block, tokens)
        if (value.type == "DoExpr") {
            inline.start = literal.start = value.start
            inline.end = literal.end = value.end
            literal.value = value
            inline.value = literal
            return inline
        }
        else if (value.type == "DoCatchBlock") {
            block.value = value
            block.start = value.start
            block.end = value.end
            return block
        }

        tokens.cursor = initialCursor
        return value // mismatch-token
    }
    else if (isKeyword(startToken, "for")) { // for-block
        const value = generateForBlock(block, tokens)
        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }

        block.value = value
        block.start = value.start
        block.end = value.end
        return block
    }
    else if (isKeyword(startToken, "if")) { // if-block
        const value = generateIfBlock(block, tokens)
        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }

        block.value = value
        block.start = value.start
        block.end = value.end
        return block
    }
    else if (isKeyword(startToken, "fun")) { // fun-declaration
        const value = generateNamedFunction(block, tokens)
        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }

        /* block.value = value
        block.start = value.start
        block.end = value.end
        return block */
    }
    else if (isKeyword(startToken, "import")) { // import-declaration
        const value = generateImportDeclaration(block, tokens)
        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }
    }
    else if ((["var", "val"] as KeywordKind[]).some(x => isKeyword(startToken, x))) { // variable-declaration
        const value = generateVariableDeclaration(block, tokens)
        if (value.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return value
        }
    }

    tokens.cursor = initialCursor
    return createMismatchToken(startToken)
}