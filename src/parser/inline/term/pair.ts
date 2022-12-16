import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, _skipables, type Node } from "../../utility.js"
import { generateExpression } from "../expression/expression.js"
import { generateGroupExpression } from "../expression/group-expression.js"
import { generatePrefixOperation } from "../expression/operation.ts/prefix-operation.js"
// import { generatePrefixOperation } from "../expression/operation.ts/prefix-operation.js"
import { generateLiteral } from "../literal/literal.js"
import { generateTerm } from "./term.js"

export function generatePair(context: Node, tokens: TokenStream): Pair | MismatchToken {
    const pair: Pair = {
        type: "Pair",
        key: null!,
        value: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const nodeGenerators = [
        generatePrefixOperation, /* generatePostfixOperation, */ generateTerm,
        generateLiteral, generateGroupExpression
    ]

    let key: PrefixOperation
        | PostfixOperation
        | GroupExpression
        | Term
        | Literal
        | MismatchToken = null!
    
    for(let nodeGenerator of nodeGenerators) {
        key = nodeGenerator(pair, tokens)
        currentToken = tokens.currentToken
        if(key.type != "MismatchToken") {
            break
        }
    }

    if (key.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return key
    }

    pair.key = key
    
    if(!isOperator(currentToken, ":")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = skip(tokens, skipables) // skip :
    const value = generateExpression(pair, tokens)

    if (value.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return value
    }

    pair.value = value

    return pair
}