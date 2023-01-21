import { TokenStream } from "../../lexer/token.js"
import { generatePattern } from "../inline/expression/pattern/pattern.js"
import { generateInline } from "../inline/inline.js"
import { generateKeyword } from "../inline/keyword.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { generateStringLiteral } from "../inline/literal/string-literal.js"
import { createMismatchToken, isKeyword, skip, skipables, type Node, DiagnosticMessage, _skipables, isPunctuator, isOperator, PartialParse } from "../utility.js"
import { generateBlock } from "./block.js"

export function generateDoCatchBlock(context: Node, tokens: TokenStream): DoCatchBlock | MismatchToken {
    const doCatchBlock: DoCatchBlock = {
        type: "DoCatchBlock",
        body: [],
        handlers: [],
        done: null,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const doKeyword = generateKeyword(doCatchBlock, tokens)

    if (doKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return doKeyword
    }

    if (!isKeyword(doKeyword, "do")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    doCatchBlock.start = doKeyword.start
    doCatchBlock.line = doKeyword.line
    doCatchBlock.column = doKeyword.column

    const parseCatchParams = (catchBlock: CatchBlock) => {

        const capturePattern = () => {
            currentToken = skipables.includes(tokens.currentToken)
                ? skip(tokens, skipables)
                : tokens.currentToken

            const pattern = generatePattern(catchBlock, tokens)
            return pattern
        }

        const captureComma = () => {
            currentToken = skipables.includes(tokens.currentToken)
                ? skip(tokens, skipables)
                : tokens.currentToken

            if (!isPunctuator(currentToken, ","))
                return createMismatchToken(currentToken)

            tokens.advance()
            return currentToken
        }

        const firstPattern = capturePattern()
        if (firstPattern.type == "MismatchToken")
            return firstPattern

        catchBlock.params.push(firstPattern)
        while (!tokens.isFinished) {
            const comma = captureComma()
            if (comma.type == "MismatchToken")
                break

            const pattern = capturePattern()
            if (pattern.type == "MismatchToken")
                return pattern

            catchBlock.params.push(pattern)
        }

        return catchBlock
    }

    const parseDoneParam = (doneBlock: DoneBlock) => {
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        let status: Identifier
            | StringLiteral
            | MismatchToken = generateIdentifier(doneBlock, tokens)

        if (status.type == "MismatchToken")
            status = generateStringLiteral(doneBlock, tokens)

        return status
    }

    const nodeGenerators = [
        generateBlock, generateInline
    ]

    let blockHolder: DoCatchBlock
        | CatchBlock
        | DoneBlock = doCatchBlock

    let blockHolderBody = doCatchBlock.body
    let isSingleItemBlock = false

    while (currentToken.type != "EOF") {

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        const maybeKeyword = generateKeyword(doCatchBlock, tokens)
        if (isKeyword(maybeKeyword, "catch")) {

            if (doCatchBlock.done !== null) {
                tokens.cursor = initialCursor
                const error: DiagnosticMessage = "Unexpected {0} block on {1}:{2}"
                return createMismatchToken(tokens.currentToken, [error, "catch", maybeKeyword.line, maybeKeyword.column])
            }

            const catchBlock: CatchBlock = {
                type: "CatchBlock",
                body: [],
                params: [],
                line: maybeKeyword.line,
                column: maybeKeyword.column,
                start: maybeKeyword.start,
                end: 0
            }

            blockHolder = catchBlock
            blockHolderBody = catchBlock.body
            doCatchBlock.handlers.push(catchBlock)

            const maybeCatch = parseCatchParams(catchBlock)
            if (maybeCatch.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return maybeCatch
            }

            currentToken = skipables.includes(tokens.currentToken)
                ? skip(tokens, skipables)
                : tokens.currentToken

            if (isOperator(currentToken, ":")) {
                currentToken = skip(tokens, skipables)
                isSingleItemBlock = true
            }
        }
        else if (isKeyword(maybeKeyword, "done")) {

            if (doCatchBlock.done !== null) {
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
            doCatchBlock.done = doneBlock

            currentToken = skipables.includes(tokens.currentToken)
                ? skip(tokens, skipables)
                : tokens.currentToken

            if (isOperator(currentToken, ":")) {
                currentToken = skip(tokens, skipables)
                isSingleItemBlock = true
            }
        }
        else if (isKeyword(maybeKeyword, "end")) {
            doCatchBlock.end = blockHolder.end = maybeKeyword.end
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
            node = nodeGenerator(doCatchBlock, tokens)
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

    if (doCatchBlock.body.length == 0) {
        const error: DiagnosticMessage = "Empty DoExpression on {0}:{1}"
        tokens.cursor = initialCursor
        return createMismatchToken(tokens.currentToken, [error, doCatchBlock.line, doCatchBlock.column])
    }

    if (doCatchBlock.handlers.length == 0 && doCatchBlock.done == null) {
        const partialParse: PartialParse = {
            cursor: tokens.cursor,
            result: doCatchBlock
        }
        tokens.cursor = initialCursor
        return createMismatchToken(tokens.currentToken, partialParse)
    }

    return doCatchBlock
}

export function printDoCatchBlock(token: DoCatchBlock, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "DoCatchBlock\n"
}