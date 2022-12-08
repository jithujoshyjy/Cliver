import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, type Node } from "../../utility.js"
import { generateGroupExpression } from "../expression/group-expression.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateNumericLiteral } from "../literal/numeric-literal/numericLiteral.js"
import { generateFunctionCall } from "./function-call.js"
import { generatePropertyAccess } from "./property-access.js"

export function generateTaggedNumber(context: Node, tokens: TokenStream): TaggedNumber | MismatchToken {
    const taggedNumber: TaggedNumber = {
        type: "TaggedNumber",
        tag: null!,
        number: null!,
        start: 0,
        end: 0
    }

    let  currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const number = generateNumericLiteral(taggedNumber, tokens)
    if(number.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return number
    }

    taggedNumber.number = number
    tokens.advance()
    currentToken = tokens.currentToken

    if(!isOperator(currentToken, "!")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    tokens.advance()
    currentToken = tokens.currentToken

    const nodeGenerators = [
        generateFunctionCall, generatePropertyAccess,
        generateIdentifier, generateGroupExpression
    ]

    let tag: Identifier
        | PropertyAccess
        | FunctionCall
        | GroupExpression
        | MismatchToken = null!

    for (let nodeGenerator of nodeGenerators) {
        tag = nodeGenerator(taggedNumber, tokens)
        currentToken = tokens.currentToken
        if (tag.type != "MismatchToken")
            break
    }

    if (tag.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return tag
    }

    taggedNumber.tag = tag

    return taggedNumber
}