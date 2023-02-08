import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, NodePrinter, pickPrinter, type Node, PartialParse, reparseIfNeeded } from "../../utility.js"
import { generateAnonFunction } from "./anon-function/anon-function.js"
import { generateUnitFunction, printUnitFunction } from "./unit-function.js"
import { generateTypeAssertion } from "../type/type-assertion.js"
import { generateExternalCallbackNotation } from "./external-callback-notation.js"
import { generateForInline, printForInline } from "./for-inline.js"
import { generateFunctionCall, printFunctionCall } from "./function-call.js"
import { generateIfInline, printIfInline } from "./if-inline.js"
import { generateImplicitMultiplication, printImplicitMultiplication } from "./implicit-multiplication.js"
import { generateInlineMacroApplication, printInlineMacroApplication } from "./inline-macro-application.js"
import { generateInlineStringFragment, printInlineStringFragment } from "./inline-string-fragment.js"
import { generateMatchInline, printMatchInline } from "./match-inline/match-inline.js"
import { generateMetaDataInterpolation } from "./meta-data-interpolation.js"
import { generateObjectCascadeNotation } from "./object-cascade-notation.js"
import { generateObjectExtendNotation } from "./object-extend-notation.js"
import { generatePipelineNotation } from "./pipeline-notation/pipeline-notation.js"
import { generatePropertyAccess, printPropertyAccess } from "./property-access.js"
import { generateTaggedNumber, printTaggedNumber } from "./tagged-number.js"
import { generateTaggedString, printTaggedString } from "./tagged-string/tagged-string.js"
import { generateTaggedSymbol, printTaggedSymbol } from "./tagged-symbol.js"
import { generateAssignExpr } from "../expression/assign-expression.js"
import { generateGroupExpression, printGroupExpression } from "../expression/group-expression.js"
import { generateSymbolFragment, printSymbolFragment } from "./symbol-fragment.js"

export function generateTerm(context: Node, tokens: TokenStream): Term | MismatchToken {
    const term: Term = {
        type: "Term",
        value: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0,
        meta: {}
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const partialParsables = [
        "FunctionCall", "PropertyAccess",
        "TaggedSymbol", "TaggedString"
    ]

    const nodeGenerators = [
        // generateTypeAssertion,
        // generatePipelineNotation, generateObjectCascadeNotation, generateObjectExtendNotation,
        /* generateExternalCallbackNotation, generateAnonFunction, */ generateUnitFunction,
        /* generateAssignExpr, generateMetaDataInterpolation,*/ /* generateTaggedSymbol, */
        generateSymbolFragment, /* generateTaggedString, */ generateInlineStringFragment, generateImplicitMultiplication, generateTaggedNumber, generateForInline,
        generateMatchInline, generateIfInline, generateGroupExpression, generateInlineMacroApplication,
        /* generateFunctionCall, generatePropertyAccess */
    ]

    let node: typeof term.value | MismatchToken = null!
    for (let nodeGenerator of nodeGenerators) {

        node = nodeGenerator(term, tokens)
        currentToken = tokens.currentToken

        if (node.type != "MismatchToken")
            break
        
        if (node.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return node
        }

        if (partialParsables.includes(node.partialParse?.result?.type)) {

            tokens.cursor = node.partialParse!.cursor

            const nodeGenerators = [
                generateTaggedSymbol, generateTaggedString,
                generateFunctionCall, generatePropertyAccess
            ]

            const [child, parent] = reparseIfNeeded(term, tokens, node.partialParse!, nodeGenerators)

            if (parent.type == "FunctionCall")
                parent.caller = child as any
            else if (parent.type == "PropertyAccess")
                parent.accessor = child as any
            else if (parent.type == "TaggedSymbol")
                parent.tag = child as any
            else if (parent.type == "TaggedString")
                parent.tag = child as any
            else {
                tokens.cursor = initialCursor
                return createMismatchToken(currentToken)
            }

            node = parent
        }
    }

    if (node.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return node
    }

    term.start = node.start
    term.end = node.end
    term.value = node

    term.line = node.line
    term.column = node.column

    return term
}

export function printTerm(token: Term, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const printers = [
        /* printMetaDataInterpolation, */ printTaggedSymbol, printSymbolFragment, printTaggedString, printInlineStringFragment, printImplicitMultiplication, printTaggedNumber, printForInline, printMatchInline, printIfInline, /* printAnonFunction, */ printUnitFunction, /* printObjectCascadeNotation, printObjectExtendNotation, printExternalCallbackNotation, printPipelineNotation, */printFunctionCall, printInlineMacroApplication, printPropertyAccess, /* printTypeAssertion, printAssignExpr, */ printGroupExpression
    ] as NodePrinter[]

    const printer = pickPrinter(printers, token.value)!

    const space = ' '.repeat(4)
    return "Term" +
        '\n' + space.repeat(indent) + endJoiner + printer(token.value, indent + 1)
}
