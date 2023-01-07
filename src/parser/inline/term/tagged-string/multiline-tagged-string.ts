import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, _skipables, type Node } from "../../../utility.js"
import { generateExpression } from "../../expression/expression.js"
import { generateGroupExpression } from "../../expression/group-expression.js"
import { generateIdentifier } from "../../literal/identifier.js"
import { generateFunctionCall } from "../function-call.js"
import { generatePair } from "../pair.js"
import { generatePropertyAccess } from "../property-access.js"

export function generateMultilineTaggedString(context: Node, tokens: TokenStream): MultilineTaggedString | MismatchToken {

    const multilineTaggedString: MultilineTaggedString = {
        type: "MultilineTaggedString",
        fragments: null!,
        tag: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor
    
    /* const nodeGenerators = [
        generateFunctionCall, generatePropertyAccess,
        generateIdentifier, generateGroupExpression
    ]

    let tag: Identifier
        | PropertyAccess
        | FunctionCall
        | GroupExpression
        | MismatchToken = null!

    for (let nodeGenerator of nodeGenerators) {
        tag = nodeGenerator(multilineTaggedString, tokens)
        currentToken = tokens.currentToken
        if (tag.type != "MismatchToken")
            break
    }

    if (tag.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return tag
    }

    multilineTaggedString.tag = tag
    const fragments = parseFstring()

    if(!Array.isArray(fragments)) {
        tokens.cursor = initialCursor
        return fragments
    }

    multilineTaggedString.fragments = fragments */

    return multilineTaggedString

    /* function parseFstring() {

        const fragments: Array<MultilineStringLiteral | InstringExpr | InstringId> = []

        currentToken = skip(tokens, _skipables)

        if (currentToken.type != TokenType.MultilineFormatString) {
            return createMismatchToken(currentToken)
        }

        const fstringFragments = currentToken.value as Array<string | typeof currentToken>
        for (let fragment of fstringFragments) {
            if (typeof fragment == "string") {
                const stringLiteral: MultilineStringLiteral = {
                    type: "StringLiteral",
                    text: fragment,
                    charset: /^\p{ASCII}+$/u.test(fragment) ? "ascii" : "unicode",
                    kind: "multiline",
                    start: 0,
                    end: 0
                }

                fragments.push(stringLiteral)
            }
            else if (fragment.type == TokenType.EscapeSequence) {
                const escapedVal = fragment.value as string
                const stringLiteral: MultilineStringLiteral = {
                    type: "StringLiteral",
                    text: escapedVal,
                    charset: /^\p{ASCII}+$/u.test(escapedVal) ? "ascii" : "unicode",
                    kind: "multiline",
                    start: 0,
                    end: 0
                }

                fragments.push(stringLiteral)
            }
            else if (fragment.type == TokenType.Identifier) {

                const identifierText = fragment.value as string
                const identifier: Identifier = {
                    type: "Identifier",
                    name: identifierText,
                    start: 0,
                    end: 0
                }

                const instringId: InstringId = {
                    type: "InstringId",
                    value: identifier,
                    start: 0,
                    end: 0
                }

                fragments.push(instringId)
            }
            else if (fragment.type == TokenType.BraceEnclosed) {
                const braceTokens = new TokenStream((fragment as typeof currentToken).value as Array<typeof currentToken>)
                const instringExpr: InstringExpr = {
                    type: "InstringExpr",
                    body: [],
                    start: 0,
                    end: 0
                }

                const captureComma = () => {
                    currentToken = skip(tokens, skipables)
                    if (!isPunctuator(currentToken, ",")) {
                        tokens.cursor = initialCursor
                        return createMismatchToken(currentToken)
                    }

                    return currentToken
                }

                const parseArg = () => {
                    currentToken = braceTokens.currentToken

                    if (skipables.includes(currentToken.type) || isOperator(currentToken, ","))
                        currentToken = skip(braceTokens, skipables)

                    let arg: Pair | Expression | MismatchToken = generatePair(instringExpr, braceTokens)

                    if (arg.type == "MismatchToken")
                        arg = generateExpression(instringExpr, braceTokens)

                    return arg
                }

                while (!braceTokens.isFinished) {
                    const arg = parseArg()

                    if (arg.type == "MismatchToken") {
                        tokens.cursor = initialCursor
                        return arg
                    }

                    instringExpr.body.push(arg)
                    if (!braceTokens.isFinished) {
                        const comma = captureComma()

                        if (comma.type == "MismatchToken") {
                            tokens.cursor = initialCursor
                            return comma
                        }
                    }
                }

                fragments.push(instringExpr)
            }
        }
        return fragments
    } */
}