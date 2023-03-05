import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, _skipables, type Node, isPunctuator, PartialParse, lookAheadForFunctionCall, lookAheadForStringLiteral, lookAheadForSymbolLiteral, isBlockedType } from "../../utility.js"
import { generateGroupExpression } from "../expression/group-expression.js"
import { generateKeyword } from "../keyword.js"
import { generateArrayLiteral } from "../literal/array-literal.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateLiteral } from "../literal/literal.js"
import { generateIntegerLiteral } from "../literal/numeric-literal/integer-literal.js"
import { generateFunctionCall } from "./function-call.js"
import { generateImplicitMultiplication } from "./implicit-multiplication.js"
import { generateTaggedNumber } from "./tagged-number.js"
import { generateTaggedString } from "./tagged-string/tagged-string.js"
import { generateTaggedSymbol } from "./tagged-symbol.js"

export function generatePropertyAccess(context: string[], tokens: TokenStream): PropertyAccess | MismatchToken {
    let propertyAccess: PropertyAccess = {
        type: "PropertyAccess",
        accessor: null!,
        field: null!,
        optional: false,
        computed: false,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const accessorGenerators = [
        generateImplicitMultiplication, generateTaggedNumber, generateLiteral, generateGroupExpression
    ] as Array<(context: string[], tokens: TokenStream) => typeof propertyAccess.accessor | MismatchToken>

    if (lookAheadForSymbolLiteral(tokens))
        accessorGenerators.unshift(generateTaggedSymbol)
    else if (lookAheadForStringLiteral(tokens))
        accessorGenerators.unshift(generateTaggedString)

    const fieldGenerators = [
        generateIntegerLiteral, generateKeyword, generateIdentifier
    ]

    let accessor: PropertyAccess
        | Literal
        | TaggedSymbol
        | TaggedString
        | ImplicitMultiplication
        | TaggedNumber
        | FunctionCall
        | GroupExpression
        | MismatchToken = null!

    for (let accessorGenerator of accessorGenerators) {

        if (isBlockedType(accessorGenerator.name.replace("generate", '')))
            continue

        if (accessorGenerator.name.endsWith("PropertyAccess"))
            continue

        accessor = accessorGenerator(["PropertyAccess", ...context], tokens)
        currentToken = tokens.currentToken

        if (accessor.type != "MismatchToken")
            break

        if (accessor.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return accessor
        }
    }

    if (accessor.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return accessor
    }

    propertyAccess.start = accessor.start
    propertyAccess.line = accessor.line
    propertyAccess.column = accessor.column
    propertyAccess.accessor = accessor


    if (currentToken.type == "EOF") {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    let isInitial = true

    while (!tokens.isFinished) {
        currentToken = _skipables.includes(tokens.currentToken)
            ? skip(tokens, _skipables)
            : tokens.currentToken

        if (isOperator(currentToken, '?')) {
            propertyAccess.optional = true
            currentToken = skip(tokens, _skipables)
        }

        if (isPunctuator(currentToken, '[')) {
            propertyAccess.computed = true

            const field = generateArrayLiteral(["PropertyAccess", ...context], tokens)
            if (field.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return field
            }

            propertyAccess.end = field.end
            isInitial = false

            if (propertyAccess.field) {
                const parentPropertyAccess = Object.assign({}, propertyAccess)
                parentPropertyAccess.accessor = propertyAccess

                parentPropertyAccess.field = field
                propertyAccess = parentPropertyAccess
                continue
            }

            propertyAccess.field = field
            continue
        }

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        const isDotOperator = isOperator(currentToken, '.') || isOperator(currentToken, '?.')

        if (!isDotOperator && !isInitial)
            break

        if (!isDotOperator) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        if (isOperator(currentToken, '?.'))
            propertyAccess.optional = true

        currentToken = skip(tokens, skipables)

        let field: IntegerLiteral
            | Identifier
            | Keyword
            | MismatchToken = null!

        for (let fieldGenerator of fieldGenerators) {

            if (isBlockedType(fieldGenerator.name.replace("generate", '')))
                continue

            field = fieldGenerator(["PropertyAccess", ...context], tokens)
            currentToken = tokens.currentToken

            if (field.type != "MismatchToken")
                break

            if (field.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return field
            }
        }

        if (field.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return field
        }

        propertyAccess.end = field.end
        isInitial = false

        if (propertyAccess.field) {
            const parentPropertyAccess = Object.assign({}, propertyAccess)
            parentPropertyAccess.accessor = propertyAccess

            parentPropertyAccess.field = field
            propertyAccess = parentPropertyAccess
            continue
        }

        propertyAccess.field = field
    }

    const isFunctionCallAhead = lookAheadForFunctionCall(tokens)
    const isStringLiteralAhead = lookAheadForStringLiteral(tokens)
    const isSymbolLiteralAhead = lookAheadForSymbolLiteral(tokens)

    if ([isFunctionCallAhead, isStringLiteralAhead, isSymbolLiteralAhead].some(x => x)) {
        const partialParse: PartialParse = {
            result: propertyAccess,
            cursor: tokens.cursor,
            meta: {
                parentType: isFunctionCallAhead
                    ? "FunctionCall"
                    : isStringLiteralAhead
                        ? "TaggedString"
                        : "TaggedSymbol"
            }
        }

        // tokens.cursor = initialCursor
        return createMismatchToken(currentToken, partialParse)
    }

    return propertyAccess
}

export function printPropertyAccess(token: PropertyAccess, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = ' '.repeat(4)
    return "PropertyAccess\n"
}