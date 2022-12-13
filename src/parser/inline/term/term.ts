import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility.js"
import { generateAnonFunction } from "./anon-function/anon-function.js"
import { generateUnitFunction } from "./unit-function.js"
import { generateTypeAssertion } from "../type/type-assertion.js"
import { generateExternalCallbackNotation } from "./external-callback-notation.js"
import { generateForInline } from "./for-inline.js"
import { generateFunctionCall } from "./function-call.js"
import { generateIfInline } from "./if-inline/if-inline.js"
import { generateImplicitMultiplication } from "./implicit-multiplication.js"
import { generateInlineMacroApplication } from "./inline-macro-application.js"
import { generateInlineStringFragment } from "./inline-string-fragment.js"
import { generateMatchInline } from "./match-inline/match-inline.js"
import { generateMetaDataInterpolation } from "./meta-data-interpolation.js"
import { generateObjectCascadeNotation } from "./object-cascade-notation.js"
import { generateObjectExtendNotation } from "./object-extend-notation.js"
import { generatePipelineNotation } from "./pipeline-notation/pipeline-notation.js"
import { generatePropertyAccess } from "./property-access.js"
import { generateTaggedNumber } from "./tagged-number.js"
import { generateTaggedString } from "./tagged-string/tagged-string.js"
import { generateTaggedSymbol } from "./tagged-symbol.js"

export function generateTerm(context: Node, tokens: TokenStream): Term | MismatchToken {
    const term: Term = {
        type: "Term",
        value: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const nodeGenerators = [
        // generateTypeAssertion,
        /* generatePipelineNotation, generateObjectCascadeNotation, */ /* generateObjectExtendNotation *//* ,
        generateExternalCallbackNotation, */ generateAnonFunction, /* generateUnitFunction, */generateMetaDataInterpolation, generateTaggedSymbol,
        generateTaggedString, generateInlineStringFragment, generateImplicitMultiplication,
        generateTaggedNumber, generateForInline, generateMatchInline, generateIfInline,
        generateInlineMacroApplication, generateFunctionCall, generatePropertyAccess
    ]

    let node: typeof term.value | MismatchToken = null!
    for (let nodeGenerator of nodeGenerators) {
        node = nodeGenerator(term, tokens)
        currentToken = tokens.currentToken
        
        if (node.type != "MismatchToken") {
            break
        }
    }

    if (node.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return node
    }

    term.start = node.start
    term.end = node.end
    term.value = node

    return term
}