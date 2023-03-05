import { TokenStream } from "../../lexer/token.js"
import { generateAsExpression } from "../inline/expression/as-expression.js"
import { generateExpression } from "../inline/expression/expression.js"
import { generateInline } from "../inline/inline.js"
import { generateKeyword } from "../inline/keyword.js"
import { createMismatchToken, isKeyword, skip, skipables, _skipables, type Node, DiagnosticMessage, isOperator, isBlockedType } from "../utility.js"
import { generateBlock } from "./block.js"

export function generateIfBlock(context: string[], tokens: TokenStream): IfBlock | MismatchToken {
    const ifBlock: IfBlock = {
        type: "IfBlock",
        alternatives: [],
        body: [],
        condition: null!,
        fallback: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const nodeGenerators = [
        generateBlock, generateInline
    ]

    let blockHolder: IfBlock
        | ElseIfBlock
        | ElseBlock = ifBlock

    let blockHolderBody = ifBlock.body
    let isSingleItemBlock = false

    const ifKeyword = generateKeyword(["IfBlock", ...context], tokens)
    if (ifKeyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return ifKeyword
    }

    if (!isKeyword(ifKeyword, "if")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    ifBlock.start = ifKeyword.start
    ifBlock.line = ifKeyword.line
    ifBlock.column = ifKeyword.column

    const parseCondition = (conditional: IfBlock | ElseIfBlock) => {
        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        const conditionGenerators = [generateAsExpression, generateExpression]

        let condition: AsExpression
            | Expression
            | MismatchToken = null!

        for (const conditionGenerator of conditionGenerators) {
            if (isBlockedType(conditionGenerator.name.replace("generate", '')))
                continue

            condition = conditionGenerator([conditional.type, ...context], tokens)
            currentToken = tokens.currentToken

            if (condition.type != "MismatchToken")
                break

            if (condition.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return condition
            }
        }

        return condition
    }

    const condition = parseCondition(ifBlock)
    if (condition.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return condition
    }

    ifBlock.condition = condition

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    if (isOperator(currentToken, ":")) {
        currentToken = skip(tokens, skipables)
        isSingleItemBlock = true
    }

    while (currentToken.type != "EOF") {

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        const maybeKeyword = generateKeyword(["IfBlock", ...context], tokens)
        if (isKeyword(maybeKeyword, "elseif")) {

            if (ifBlock.fallback !== null) {
                tokens.cursor = initialCursor
                const error: DiagnosticMessage = "Unexpected {0} block on {1}:{2}"
                return createMismatchToken(tokens.currentToken, [error, "elseif", maybeKeyword.line, maybeKeyword.column])
            }

            const elseifBlock: ElseIfBlock = {
                type: "ElseIfBlock",
                body: [],
                condition: null!,
                line: maybeKeyword.line,
                column: maybeKeyword.column,
                start: maybeKeyword.start,
                end: 0
            }

            blockHolder = elseifBlock
            blockHolderBody = elseifBlock.body
            ifBlock.alternatives.push(elseifBlock)

            const maybeCondition = parseCondition(elseifBlock)
            if (maybeCondition.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return maybeCondition
            }

            blockHolder.condition = maybeCondition

            currentToken = skipables.includes(tokens.currentToken)
                ? skip(tokens, skipables)
                : tokens.currentToken

            if (isOperator(currentToken, ":")) {
                currentToken = skip(tokens, skipables)
                isSingleItemBlock = true
            }
        }
        else if (isKeyword(maybeKeyword, "else")) {

            if (ifBlock.fallback !== null) {
                tokens.cursor = initialCursor
                const error: DiagnosticMessage = "Unexpected {0} block on {1}:{2}"
                return createMismatchToken(tokens.currentToken, [error, "else", maybeKeyword.line, maybeKeyword.column])
            }

            const elseBlock: ElseBlock = {
                type: "ElseBlock",
                body: [],
                line: maybeKeyword.line,
                column: maybeKeyword.column,
                start: maybeKeyword.start,
                end: 0
            }

            blockHolder = elseBlock
            blockHolderBody = elseBlock.body
            ifBlock.fallback = elseBlock

            currentToken = skipables.includes(tokens.currentToken)
                ? skip(tokens, skipables)
                : tokens.currentToken

            if (isOperator(currentToken, ":")) {
                currentToken = skip(tokens, skipables)
                isSingleItemBlock = true
            }
        }
        else if (isKeyword(maybeKeyword, "end")) {
            ifBlock.end = blockHolder.end = maybeKeyword.end
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
            
            node = nodeGenerator(["IfBlock", ...context], tokens)
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

    return ifBlock
}

export function printIfBlock(token: IfBlock, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "IfBlock\n"
}