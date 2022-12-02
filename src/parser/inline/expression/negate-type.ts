import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, _skipables, type Node } from "../../utility"
import { generateTypeExpression } from "./type-expression.js"

export function generateNegateType(context: Node, tokens: TokenStream): NegateType | MismatchToken {
    const negateType: NegateType = {
        type: "NegateType",
        operand: null!,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    if(!isOperator(currentToken, "!")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, _skipables)
    const typeMember = generateTypeExpression(negateType, tokens)

    if(typeMember.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return typeMember
    }

    negateType.operand = typeMember

    return negateType
}