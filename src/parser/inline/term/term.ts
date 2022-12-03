import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"
import { generateExternalCallbackNotation } from "./external-callback-notation.js"
import { generateForInline } from "./for-inline.js"
import { generateFunctionCall } from "./function-call.js"
import { generateIfInline } from "./if-inline.js"
import { generateImplicitMultiplication } from "./implicit-multiplication.js"
import { generateInlineMacroApplication } from "./inline-macro-application.js"
import { generateInlineStringFragment } from "./inline-string-fragment.js"
import { generateMatchInline } from "./match-inline.js"
import { generateMetaDataInterpolation } from "./meta-data-interpolation.js"
import { generateObjectCascadeNotation } from "./object-cascade-notation.js"
import { generateObjectExtendNotation } from "./object-extend-notation.js"
import { generatePipelineNotation } from "./pipeline-notation.js"
import { generatePropertyAccess } from "./property-access.js"
import { generateTaggedNumber } from "./tagged-number.js"
import { generateTaggedString } from "./tagged-string.js"
import { generateTaggedSymbol } from "./tagged-symbol.js"

export function generateTerm(context: Node, tokens: TokenStream): Term | MismatchToken {
    const term: Term = {
        type: "Term",
        value: null!,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    const generateNodes = [
        generatePipelineNotation, generateObjectCascadeNotation, generateObjectExtendNotation,
        generateExternalCallbackNotation, generateMetaDataInterpolation, generateTaggedSymbol,
        generateTaggedString, generateInlineStringFragment, generateImplicitMultiplication,
        generateTaggedNumber, generateForInline, generateMatchInline, generateIfInline,
        generateInlineMacroApplication, generateFunctionCall, generatePropertyAccess
    ]

    for (let [i, generateNode] of generateNodes.entries()) {
        const node = generateNode(term, tokens)
        if (node.type == "MismatchToken") {
            if (i < generateNodes.length)
                continue

            tokens.cursor = initialCursor
            return node
        }

        term.value = node
        term.start = node.start
        term.end = node.end
        break
    }

    return term
}