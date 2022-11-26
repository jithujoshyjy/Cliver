import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"
import { generateExternalCallbackNotation } from "./externalCallbackNotation.js"
import { generateForInline } from "./forInline.js"
import { generateFunctionCall } from "./functionCall.js"
import { generateIfInline } from "./ifInline.js"
import { generateImplicitMultiplication } from "./implicitMultip.js"
import { generateInlineMacroApplication } from "./inlineMacroApplication.js"
import { generateInlineStringFragment } from "./inlineStringFragment.js"
import { generateMatchInline } from "./matchInline.js"
import { generateMetaDataInterpolation } from "./metaDataInterp.js"
import { generateObjectCascadeNotation } from "./objectCascadeNotation.js"
import { generateObjectExtendNotation } from "./objectExtendNotation.js"
import { generatePipelineNotation } from "./pipelineNotation.js"
import { generatePropertyAccess } from "./propertyAccess.js"
import { generateTaggedNumber } from "./taggedNumber.js"
import { generateTaggedString } from "./taggedString.js"
import { generateTaggedSymbol } from "./taggedSymbol.js"

export function generateTerm(context: Node, tokens: TokenStream): Term | MismatchToken {
    const term: Term = {
        type: "Term",
        value: null!,
        start: 0,
        end: 0
    }

    const generateNodes = [
        generatePipelineNotation, generateObjectCascadeNotation, generateObjectExtendNotation, 
        generateExternalCallbackNotation, generateMetaDataInterpolation, generateTaggedSymbol,
        generateTaggedString, generateInlineStringFragment, generateImplicitMultiplication,
        generateTaggedNumber, generateForInline, generateMatchInline, generateIfInline,
        generateInlineMacroApplication, generateFunctionCall, generatePropertyAccess
    ]
    
    for(let [i, generateNode] of generateNodes.entries()) {
        const node = generateNode(term, tokens)
        if(node.type == "MismatchToken") {
            if(i < generateNodes.length)
                continue
            return node
        }

        term.value = node
        term.start = node.start
        term.end = node.end
        break
    }

    return term
}