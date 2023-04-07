import { TokenStream } from "../../lexer/token.js"
import { generateInline } from "../inline/inline.js"
import { generateKeyword } from "../inline/keyword.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { generateKindList } from "../inline/term/kind-list.js"
import { generateParamList } from "../inline/term/param-list.js"
import { generatePropertyAccess } from "../inline/term/property-access.js"
import { generateTypeExpression } from "../inline/type/type-expression.js"
import { createMismatchToken, isKeyword, isOperator, skip, skipables, isBlockedType, generateOneOf, withBlocked } from "../utility.js"
import { generateBlock } from "./block.js"

export function generateNamedFunction(context: string[], tokens: TokenStream): NamedFunction | MismatchToken {
    const namedFunction: NamedFunction = {
        type: "NamedFunction",
        body: [],
        kinds: null!,
        name: null!,
        parameters: null!,
        signature: null,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const maybeKeyword = generateKeyword(["NamedFunction", ...context], tokens)

    if (!isKeyword(maybeKeyword, "fun")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    namedFunction.start = maybeKeyword.start
    namedFunction.line = maybeKeyword.line
    namedFunction.column = maybeKeyword.column

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const nameBlockers = [
        "FunctionCall", "ImplicitMultiplication", "TaggedNumber",
        "GroupExpression", "MapLiteral", "TupleLiteral", "ArrayLiteral", "StringLiteral",
        "CharLiteral", "SymbolLiteral", "NumericLiteral", "OperatorRef"
    ]

    const nameGenerators = [
        (context: string[], tokens: TokenStream) =>
            withBlocked(nameBlockers, () => generatePropertyAccess(context, tokens)),
        generateIdentifier
    ]

    const name: PropertyAccess
        | Identifier
        | MismatchToken = generateOneOf(tokens, ["NamedFunction", ...context], nameGenerators)

    if (name.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return name
    }

    namedFunction.name = name

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    if (isOperator(currentToken, "<")) {
        const defaultReturnKindId: Identifier = {
            type: "Identifier",
            name: "return",
            line: currentToken.line,
            column: -1,
            start: -1,
            end: -1
        }

        const kindList: KindList
            | MismatchToken = generateKindList(["NamedFunction", ...context], tokens)

        if (kindList.type == "MismatchToken") {
            const defaultKindList: KindList = {
                type: "KindList",
                kinds: [defaultReturnKindId],
                line: currentToken.line,
                column: -1,
                start: -1,
                end: -1
            }

            namedFunction.kinds = defaultKindList
            tokens.cursor = initialCursor
            return kindList
        }

        kindList.kinds.unshift(defaultReturnKindId)
        namedFunction.kinds = kindList

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken
    }

    const paramList = generateParamList(["NamedFunction", ...context], tokens)
    if (paramList.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return paramList
    }

    namedFunction.parameters = paramList
    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    if (isOperator(currentToken, "::")) {
        currentToken = skip(tokens, skipables) // skip ::
        const typeExpression = generateTypeExpression(["NamedFunction", ...context], tokens)

        if (typeExpression.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return typeExpression
        }

        namedFunction.signature = typeExpression
    }

    const nodeGenerators = [
        generateBlock, generateInline
    ]

    while (currentToken.type != "EOF") {

        currentToken = skipables.includes(tokens.currentToken)
            ? skip(tokens, skipables)
            : tokens.currentToken

        const resetCursorPoint = tokens.cursor
        const endKeyword = generateKeyword(["NamedFunction", ...context], tokens)

        if (isKeyword(endKeyword, "end")) {
            namedFunction.end = endKeyword.end
            break
        }

        let node: Block
            | Inline
            | MismatchToken = null!

        tokens.cursor = resetCursorPoint
        for (const nodeGenerator of nodeGenerators) {

            if (isBlockedType(nodeGenerator.name.replace("generate", "")))
                continue

            node = nodeGenerator(["NamedFunction", ...context], tokens)
            currentToken = tokens.currentToken

            if (node.type != "MismatchToken")
                break

            if (node.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return node
            }
        }

        if (node.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return node
        }

        namedFunction.body.push(node)
    }

    return namedFunction
}

export function printNamedFunction(token: NamedFunction, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const space = " ".repeat(4)
    return "NamedFunction\n"
}
