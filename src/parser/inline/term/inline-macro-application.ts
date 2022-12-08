import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, _skipables, type Node } from "../../utility.js"
import { generateGroupExpression } from "../expression/group-expression.js"
// import { generatePostfixOperation } from "../expression/operation.ts/postfix-operation.js"
import { generatePrefixOperation } from "../expression/operation.ts/prefix-operation.js"
import { generateIdentifier } from "../literal/identifier.js"
import { generateLiteral } from "../literal/literal.js"
import { generateCallSiteArgsList } from "./call-site-args-list.js"
import { generatePropertyAccess } from "./property-access.js"
import { generateTerm } from "./term.js"

export function generateInlineMacroApplication(context: Node, tokens: TokenStream): InlineMacroApplication | MismatchToken {
    const inlineMacroApplication: InlineMacroApplication = {
        type: "InlineMacroApplication",
        arguments: null,
        body: null!,
        caller: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (isOperator(currentToken, "@")) {
        currentToken = skip(tokens, _skipables) // skip @
        const identifier = generateIdentifier(inlineMacroApplication, tokens)
        if (identifier.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return identifier
        }
        inlineMacroApplication.caller = identifier
    }
    else {
        let caller: Identifier
            | PropertyAccess
            | MismatchToken = generatePropertyAccess(inlineMacroApplication, tokens)

        if (caller.type == "MismatchToken") {
            caller = generateIdentifier(inlineMacroApplication, tokens)
        }

        if (caller.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return caller
        }

        inlineMacroApplication.caller = caller
        currentToken = skip(tokens, _skipables) // @

        if (!isOperator(currentToken, "@")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        currentToken = skip(tokens, _skipables) // skip @
        if (currentToken.type != TokenType.ParenEnclosed) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        const args = generateCallSiteArgsList(inlineMacroApplication, tokens)
        if (args.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return args
        }

        inlineMacroApplication.arguments = args
    }

    const nodeGenerators = [
        generatePrefixOperation, /* generatePostfixOperation, */ generateTerm,
        generateLiteral, generateGroupExpression
    ]

    let body: MismatchToken | PrefixOperation | PostfixOperation | GroupExpression | Term | Literal = null!
    for(let nodeGenerator of nodeGenerators) {
        body = nodeGenerator(inlineMacroApplication, tokens)
        currentToken = tokens.currentToken
        if(body.type != "MismatchToken") {
            break
        }
    }

    if (body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    inlineMacroApplication.body = body

    return inlineMacroApplication
}