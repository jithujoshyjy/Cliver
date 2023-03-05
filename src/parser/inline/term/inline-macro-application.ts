import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, _skipables, type Node, skipables, NodePrinter, pickPrinter, isBlockedType } from "../../utility.js"
import { generateGroupExpression, printGroupExpression } from "../expression/group-expression.js"
import { printInfixOperation } from "../expression/operation.ts/infix-operation.js"
import { generatePostfixOperation, printPostfixOperation } from "../expression/operation.ts/postfix-operation.js"
import { generatePrefixOperation, printPrefixOperation } from "../expression/operation.ts/prefix-operation.js"
import { generateIdentifier, printIdentifier } from "../literal/identifier.js"
import { generateLiteral, printLiteral } from "../literal/literal.js"
import { generateCallSiteArgsList, printCallSiteArgsList } from "./call-site-args-list.js"
import { generatePropertyAccess, printPropertyAccess } from "./property-access.js"
import { generateTerm, printTerm } from "./term.js"

export function generateInlineMacroApplication(context: string[], tokens: TokenStream): InlineMacroApplication | MismatchToken {
    const inlineMacroApplication: InlineMacroApplication = {
        type: "InlineMacroApplication",
        arguments: null,
        body: null!,
        caller: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (isOperator(currentToken, "@")) {

        inlineMacroApplication.start = currentToken.start
        inlineMacroApplication.line = currentToken.line
        inlineMacroApplication.column = currentToken.column

        currentToken = skip(tokens, _skipables) // skip @
        const identifier = generateIdentifier(["InlineMacroApplication", ...context], tokens)

        if (identifier.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return identifier
        }

        inlineMacroApplication.caller = identifier
    }
    else {

        let caller: Identifier
            | PropertyAccess
            | MismatchToken = null!

        const nodeGenerators = [
            generatePropertyAccess, generateIdentifier
        ]

        for (let nodeGenerator of nodeGenerators) {
            if (isBlockedType(nodeGenerator.name.replace("generate", '')))
                continue
            caller = nodeGenerator(["InlineMacroApplication", ...context], tokens)
            currentToken = tokens.currentToken
            if (caller.type != "MismatchToken") {
                break
            }

            if (caller.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return caller
            }
        }

        if (caller.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return caller
        }

        inlineMacroApplication.start = caller.start
        inlineMacroApplication.line = caller.line
        inlineMacroApplication.column = caller.column
        inlineMacroApplication.caller = caller

        currentToken = _skipables.includes(tokens.currentToken)
            ? skip(tokens, _skipables)
            : tokens.currentToken

        if (!isOperator(currentToken, "@")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }
        currentToken = skip(tokens, _skipables) // skip @

        const args = generateCallSiteArgsList(["InlineMacroApplication", ...context], tokens)

        if (args.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return args
        }

        inlineMacroApplication.arguments = args
    }

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const nodeGenerators = [
        generatePrefixOperation, generatePostfixOperation, generateTerm,
        generateLiteral, generateGroupExpression
    ]

    let body: PrefixOperation
        | PostfixOperation
        | GroupExpression
        | Term
        | Literal
        | MismatchToken = null!

    for (let nodeGenerator of nodeGenerators) {
        if (isBlockedType(nodeGenerator.name.replace("generate", '')))
            continue
        body = nodeGenerator(["InlineMacroApplication", ...context], tokens)
        currentToken = tokens.currentToken

        if (body.type != "MismatchToken")
            break

        if (body.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return body
        }
    }

    if (body.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return body
    }

    inlineMacroApplication.body = body
    inlineMacroApplication.end = body.end

    return inlineMacroApplication
}

export function printInlineMacroApplication(token: InlineMacroApplication, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const callerPrinters = [printPropertyAccess, printIdentifier] as NodePrinter[]
    const callerPrinter = pickPrinter(callerPrinters, token.caller)!

    const bodyPrinters = [
        printInfixOperation, printPrefixOperation, printPostfixOperation,
        printTerm, printLiteral, printGroupExpression
    ] as NodePrinter[]

    const bodyPrinter = pickPrinter(bodyPrinters, token.body)!

    const space = ' '.repeat(4)
    return "InlineMacroApplication" +
        '\n' + space.repeat(indent) + middleJoiner + "caller" +
        '\n' + space.repeat(indent + 1) + endJoiner +
        callerPrinter(token.caller, indent + 2) +
        (token.arguments
            ? '\n' + space.repeat(indent) + middleJoiner + "arguments" +
            '\n' + space.repeat(indent + 1) + endJoiner +
            printCallSiteArgsList(token.arguments, indent + 2)
            : "") +
        '\n' + space.repeat(indent) + endJoiner + "body" +
        '\n' + space.repeat(indent + 1) + endJoiner +
        bodyPrinter(token.body, indent + 2)
}