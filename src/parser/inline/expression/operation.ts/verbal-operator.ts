import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, operatorPrecedence, type Node } from "../../../utility.js"
import { generateKeyword } from "../../keyword.js"

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

    const isOpKeword = (op: Keyword) =>
        op.name in operatorPrecedence.infix.left
        || op.name in operatorPrecedence.infix.right
        || op.name in operatorPrecedence.prefix

    const keyword: Keyword | MismatchToken = generateKeyword(verbalOperator, tokens)
    currentToken = tokens.currentToken
    
    if (keyword.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    if (!isOpKeword(keyword) || excludedOperators.includes(keyword.name)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    verbalOperator.name = keyword.name as VerbalOperatorKind
    verbalOperator.start = keyword.start
    verbalOperator.end = keyword.end

    verbalOperator.line = keyword.line
    verbalOperator.column = keyword.column

    return verbalOperator
}

export function printVerbalOperator(token: VerbalOperator, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    return `${token.kind}__${token.precedence}__(${token.name})`
}