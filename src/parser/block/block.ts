import { TokenStream, TokenType } from "../../lexer/token.js"
import { createMismatchToken, isKeyword, isOperator, skip, skipables, _skipables, type Node } from "../utility.js"
import { generateBlockMacroApplication } from "./block-macro-application.js"
import { generateDoCatchBlock } from "./do-catch-block/do-catch-block.js"
import { generateForBlock } from "./for-block.js"
import { generateIfBlock } from "./if-block/if-block.js"
import { generateImportDeclaration } from "./import-declaration.js"
import { generateLabelDeclaration } from "./label-declaration.js"
import { generateNamedFunction } from "./named-function.js"
import { generateUseDeclaration } from "./use-declaration.js"
import { generateVariableDeclaration } from "./variable-declaration/variable-declaration.js"

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

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (skipables.includes(currentToken.type))
        currentToken = skip(tokens, skipables)

    let value: LabelDeclaration
        | BlockMacroApplication
        | UseDeclaration
        | DoCatchBlock
        | DoExpr
        | ForBlock
        | IfBlock
        | NamedFunction
        | ImportDeclaration
        | VariableDeclaration
        | MismatchToken = null!

    const captureDelimiter = () => {
        currentToken = skip(tokens, _skipables)
        const isDelimited = currentToken.type == TokenType.Newline
            || (currentToken.type == TokenType.Punctuator && currentToken.value == ";")
            || tokens.isFinished

        if (!isDelimited) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    if (currentToken.type == TokenType.Identifier) { // label-declaration
        value = generateLabelDeclaration(block, tokens)
    }
    else if (isOperator(currentToken, "@@")) { // block-macro
        value = generateBlockMacroApplication(block, tokens)
    }
    else if (isKeyword(currentToken, "use")) { // use-declaration
        value = generateUseDeclaration(block, tokens)

        const delimiter = captureDelimiter()

        if (delimiter.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return delimiter
        }
    }
    else if (isKeyword(currentToken, "do")) { // do-catch block
        const literal: Literal = {
            type: "Literal",
            value: null!,
            start: 0,
            end: 0
        }

        const expression: Expression = {
            type: "Expression",
            value: literal,
            start: 0,
            end: 0
        }

        value = generateDoCatchBlock(block, tokens)
        if (value.type == "DoExpr") {
            inline.start = literal.start = value.start
            inline.end = literal.end = value.end
            literal.value = value
            inline.value = expression
            return inline
        }
    }
    else if (isKeyword(currentToken, "for")) { // for-block
        value = generateForBlock(block, tokens)
    }
    else if (isKeyword(currentToken, "if")) { // if-block
        value = generateIfBlock(block, tokens)
    }
    else if (isKeyword(currentToken, "fun")) { // fun-declaration
        value = generateNamedFunction(block, tokens)
    }
    else if (isKeyword(currentToken, "import")) { // import-declaration
        value = generateImportDeclaration(block, tokens)

        const delimiter = captureDelimiter()

        if (delimiter.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return delimiter
        }
    }
    else if ((["var", "val"] as KeywordKind[]).some(x => isKeyword(currentToken, x))) { // variable-declaration
        value = generateVariableDeclaration(block, tokens)

        const delimiter = captureDelimiter()

        if (delimiter.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return delimiter
        }
    }
    else {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    if (value.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return value
    }

    block.value = value
    block.start = value.start
    block.end = value.end
    return block
}