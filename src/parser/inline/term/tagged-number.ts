import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, type Node, _skipables, NodePrinter, pickPrinter, isBlockedType } from "../../utility.js"
import { generateGroupExpression, printGroupExpression } from "../expression/group-expression.js"
import { generateIdentifier, printIdentifier } from "../literal/identifier.js"
import { generateNumericLiteral, printNumericLiteral } from "../literal/numeric-literal/numericLiteral.js"
import { generateFunctionCall } from "./function-call.js"
import { generatePropertyAccess } from "./property-access.js"

export function generateTaggedNumber(context: string[], tokens: TokenStream): TaggedNumber | MismatchToken {
    const taggedNumber: TaggedNumber = {
        type: "TaggedNumber",
        tag: null!,
        number: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const number = generateNumericLiteral(["TaggedNumber", ...context], tokens)
    if (number.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return number
    }

    taggedNumber.start = number.start
    taggedNumber.line = number.line
    taggedNumber.column = number.column
    taggedNumber.number = number

    currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    if (!isOperator(currentToken, "!")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    tokens.advance()
    currentToken = _skipables.includes(tokens.currentToken)
        ? skip(tokens, _skipables)
        : tokens.currentToken

    const nodeGenerators = [
        generateIdentifier, generateGroupExpression
    ]

    let tag: Identifier
        | GroupExpression
        | MismatchToken = null!

    for (let nodeGenerator of nodeGenerators) {
        if (isBlockedType(nodeGenerator.name.replace("generate", '')))
            continue
        
        tag = nodeGenerator(["TaggedNumber", ...context], tokens)
        currentToken = tokens.currentToken
        if (tag.type != "MismatchToken")
            break

        if (tag.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return tag
        }
    }

    if (tag.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return tag
    }

    taggedNumber.tag = tag
    taggedNumber.end = tag.end

    return taggedNumber
}

export function printTaggedNumber(token: TaggedNumber, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const printers = [
        printIdentifier, printGroupExpression
    ] as NodePrinter[]

    const printer = pickPrinter(printers, token.tag)!

    const space = ' '.repeat(4)
    return "TaggedNumber" +
        '\n' + space.repeat(indent) + middleJoiner + "tag" +
        '\n' + space.repeat(indent + 1) + endJoiner +
        printer(token.tag, indent + 2) +
        '\n' + space.repeat(indent) + endJoiner +
        printNumericLiteral(token.number, indent + 1)
}