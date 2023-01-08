import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, _skipables, type Node } from "../../../utility.js"
import { generateExpression } from "../../expression/expression.js"
import { generateGroupExpression } from "../../expression/group-expression.js"
import { generateIdentifier } from "../../literal/identifier.js"
import { generateFunctionCall } from "../function-call.js"
import { generatePair } from "../pair.js"
import { generatePropertyAccess } from "../property-access.js"

export function generateInlineTaggedString(context: Node, tokens: TokenStream): InlineTaggedString | MismatchToken {

    const inlineTaggedString: InlineTaggedString = {
        type: "InlineTaggedString",
        fragments: [],
        tag: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor
    return inlineTaggedString
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
        tag = nodeGenerator(inlineTaggedString, tokens)
        
        currentToken = tokens.currentToken
        if (tag.type != "MismatchToken")
            break
    }

    if (tag.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return tag
    }

    inlineTaggedString.tag = tag
    
    while (!tokens.isFinished) {

        const fstring = parseFstring()
        if(fstring.type == "MismatchToken" && inlineTaggedString.fragments.length == 0) {
            tokens.cursor = initialCursor
            return fstring
        }

        if(fstring.type == "MismatchToken") {
            break
        }

        inlineTaggedString.fragments.push(fstring)
    }

    if(inlineTaggedString.fragments.length == 0) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }
    
    return inlineTaggedString

    function parseFstring() {

        const fstring: InlineFString = {
            type: "InlineFString",
            fragments: [],
            start: 0,
            end: 0
        }

        currentToken = skip(tokens, _skipables)

        if (currentToken.type != TokenType.InlineFormatString) {
            return createMismatchToken(currentToken)
        }

        const fstringFragments = currentToken.value as Array<string | typeof currentToken>
        for (let fragment of fstringFragments) {
            if (typeof fragment == "string") {
                const stringLiteral: InlineStringLiteral = {
                    type: "StringLiteral",
                    text: fragment,
                    charset: /^\p{ASCII}+$/u.test(fragment) ? "ascii" : "unicode",
                    kind: "inline",
                    start: 0,
                    end: 0
                }

                fstring.fragments.push(stringLiteral)
            }
            else if (fragment.type == TokenType.EscapeSequence) {
                const escapedVal = fragment.value as string
                const stringLiteral: InlineStringLiteral = {
                    type: "StringLiteral",
                    text: escapedVal,
                    charset: /^\p{ASCII}+$/u.test(escapedVal) ? "ascii" : "unicode",
                    kind: "inline",
                    start: 0,
                    end: 0
                }

                fstring.fragments.push(stringLiteral)
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

                fstring.fragments.push(instringId)
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

                fstring.fragments.push(instringExpr)
            }
        }
        return fstring
    } */
}