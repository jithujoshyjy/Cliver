import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, _skipables, type Node } from "../../utility.js"
import { generateGroupExpression } from "../expression/group-expression.js"
import { generateArrayLiteral } from "../literal/array-literal.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateLiteral } from "../literal/literal.js"
import { generateNumericLiteral } from "../literal/numeric-literal/numericLiteral.js"
import { generateFunctionCall } from "./function-call.js"
import { generateImplicitMultiplication } from "./implicit-multiplication.js"
import { generateTaggedNumber } from "./tagged-number.js"
import { generateTaggedString } from "./tagged-string/tagged-string.js"
import { generateTaggedSymbol } from "./tagged-symbol.js"

export function generatePropertyAccess(context: Node, tokens: TokenStream): PropertyAccess | MismatchToken {

    type Accessor = Literal
        | TaggedSymbol
        | TaggedString
        | ImplicitMultiplication
        | TaggedNumber
        | FunctionCall
        | GroupExpression
        | MismatchToken

    let propertyAccess: PropertyAccess | Accessor = null!
    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const accessorGenerators = [
        generateTaggedSymbol, generateTaggedString, generateImplicitMultiplication, generateTaggedNumber, generateFunctionCall, generateLiteral, generateGroupExpression
    ]

    let accessor: Accessor = null!

    for (let accessorGenerator of accessorGenerators) {
        accessor = accessorGenerator(propertyAccess, tokens)
        currentToken = tokens.currentToken
        if (accessor.type != "MismatchToken") {
            break
        }
    }

    if (accessor.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return accessor
    }

    propertyAccess = accessor

    while (!tokens.isFinished) {

        const maybeField = captureField()
        currentToken = tokens.currentToken

        if (!Array.isArray(maybeField) && propertyAccess.type != "PropertyAccess") {
            tokens.cursor = initialCursor
            return maybeField
        }

        if (!Array.isArray(maybeField)) {
            break
        }

        const [isOptional, field] = maybeField

        propertyAccess = {
            type: "PropertyAccess",
            accessor: propertyAccess,
            field: field,
            optional: isOptional,
            computed: field.type == "ArrayLiteral",
            start: 0,
            end: 0
        }
    }

    return propertyAccess as PropertyAccess

    function captureField(): MismatchToken | [boolean, NumericLiteral | Identifier | ArrayLiteral] {
        currentToken = skip(tokens, _skipables) // . | ?.
        const isDotOperator = isOperator(currentToken, ".") || isOperator(currentToken, "?.")

        let field: Identifier
            | NumericLiteral
            | ArrayLiteral
            | MismatchToken = null!
        
        let isOptional = false
        const parseBracketAccess = () => {
            const field = generateArrayLiteral(propertyAccess, tokens)
            return field
        }

        if (!isDotOperator && isOperator(currentToken, "?")) {
            isOptional = true
            currentToken = skip(tokens, _skipables) // skip ?
            field = parseBracketAccess()

            if (field.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return field
            }

            return [isOptional, field]
        }

        if (!isDotOperator && currentToken.type == TokenType.BracketEnclosed) {
            field = parseBracketAccess()

            if (field.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return field
            }

            return [isOptional, field]
        }

        if (!isDotOperator && currentToken.type != TokenType.BracketEnclosed) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        isOptional = isOperator(currentToken, "?.")

        currentToken = skip(tokens, skipables) // skip . | ?.
        const fieldGenerators = [
            generateNumericLiteral, generateIdentifier
        ]

        for (let fieldGenerator of fieldGenerators) {
            field = fieldGenerator(propertyAccess, tokens)
            currentToken = tokens.currentToken
            if (field.type != "MismatchToken") {
                break
            }
        }

        if (field.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return field
        }

        return [isOptional, field]
    }
}