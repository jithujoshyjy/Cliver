import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, operatorPrecedence, type Node } from "../../../utility.js"
import { generateIdentifier } from "../../literal/identifier.js"

export function generateVerbalOperator(context: Node, tokens: TokenStream): VerbalOperator | MismatchToken {
    const verbalOperator: VerbalOperator = {
        type: "VerbalOperator",
        kind: "infix",
        precedence: 10,
        name: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const excludedOperators: string[] = [
        "as"
    ]

    const isOpKeword = (op: Identifier) =>
        op.name in operatorPrecedence.infix.left
        || op.name in operatorPrecedence.infix.right
        || op.name in operatorPrecedence.prefix

    const identifier: Identifier | MismatchToken = generateIdentifier(verbalOperator, tokens)
    currentToken = tokens.currentToken
    
    if (identifier.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    if (!isOpKeword(identifier) || excludedOperators.includes(identifier.name)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    verbalOperator.name = identifier.name as VerbalOperatorKind
    verbalOperator.start = identifier.start
    verbalOperator.end = identifier.end

    verbalOperator.line = identifier.line
    verbalOperator.column = identifier.column

    return verbalOperator
}

export function printVerbalOperator(token: VerbalOperator, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    return `${token.kind}__${token.precedence}__(${token.name})`
}