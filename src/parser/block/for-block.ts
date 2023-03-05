import { TokenStream } from "../../lexer/token.js"
import { generateExpression } from "../inline/expression/expression.js"
import { generateInline } from "../inline/inline.js"
import { generateKeyword } from "../inline/keyword.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { generateStringLiteral } from "../inline/literal/string-literal.js"
import { isKeyword, skip, skipables, type Node, createMismatchToken, DiagnosticMessage, PartialParse, isOperator, isBlockedType } from "../utility.js"
import { generateBlock } from "./block.js"

export function generateForBlock(context: string[], tokens: TokenStream): ForBlock | MismatchToken {
    const forBlock: ForBlock = {
        type: "ForBlock",
        body: [],
        condition: null!,
        done: null,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    let isSingleItemBlock = false
    let blockHolder: ForBlock
        | DoneBlock = forBlock
    let blockHolderBody = forBlock.body

    const nodeGenerators = [
        generateBlock, generateInline
    ]

    const forKeyword = generateKeyword(["ForBlock", ...context], tokens)
    if (forKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return forKeyword
    }

    if (!isKeyword(forKeyword, "for")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    forBlock.start = forKeyword.start
    forBlock.line = forKeyword.line
    forBlock.column = forKeyword.column

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const expression = generateExpression(["ForBlock", ...context], tokens)
    if (expression.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return expression
    }

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    if (isOperator(currentToken, ":")) {
        currentToken = skip(tokens, skipables)
        isSingleItemBlock = true
    }

    const parseDoneParam = (doneBlock: DoneBlock) => {
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        let status: Identifier
            | StringLiteral
            | MismatchToken = generateIdentifier(["DoneBlock", ...context], tokens)

        if (status.type == "MismatchToken")
            status = generateStringLiteral(["DoneBlock", ...context], tokens)

        return status
    }

    while (currentToken.type != "EOF") {

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        const maybeKeyword = generateKeyword(["ForBlock", ...context], tokens)
        if (isKeyword(maybeKeyword, "done")) {

            if (forBlock.done !== null) {
                tokens.cursor = initialCursor
                const error: DiagnosticMessage = "Unexpected {0} block on {1}:{2}"
                return createMismatchToken(tokens.currentToken, [error, "done", maybeKeyword.line, maybeKeyword.column])
            }

            const doneBlock: DoneBlock = {
                type: "DoneBlock",
                body: [],
                status: null!,
                line: maybeKeyword.line,
                column: maybeKeyword.column,
                start: maybeKeyword.start,
                end: 0
            }

            const doneBlockParam = parseDoneParam(doneBlock)
            if (doneBlockParam.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return doneBlockParam
            }

            doneBlock.status = doneBlockParam
            blockHolder = doneBlock
            blockHolderBody = doneBlock.body
            forBlock.done = doneBlock

            currentToken = skipables.includes(tokens.currentToken)
                ? skip(tokens, skipables)
                : tokens.currentToken

            if (isOperator(currentToken, ":")) {
                currentToken = skip(tokens, skipables)
                isSingleItemBlock = true
            }
        }
        else if (isKeyword(maybeKeyword, "end")) {
            forBlock.end = blockHolder.end = maybeKeyword.end
            break
        }
        else if (maybeKeyword.type != "MismatchToken") {
            const error = "Unexpected Keyword '{0}' on {1}:{2}"
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken, [error, maybeKeyword.name, maybeKeyword.line, maybeKeyword.column])
        }

        let node: Block
            | Inline
            | MismatchToken = null!

        for (const nodeGenerator of nodeGenerators) {
            if (isBlockedType(nodeGenerator.name.replace("generate", '')))
                continue
            node = nodeGenerator(["ForBlock", ...context], tokens)
            currentToken = tokens.currentToken
            if (node.type != "MismatchToken")
                break

            if (node.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return node
            }
        }

        currentToken = tokens.currentToken
        if (node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        blockHolder.end = node.end
        blockHolderBody.push(node)

        if (isSingleItemBlock)
            break
    }

    return forBlock
}

export function printForBlock(token: ForBlock, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "ForBlock\n"
}