import { type Token, TokenType, type TokenStream } from "../lexer/token.js";
import { generateBlock } from "./block/block.js";
import { generateInline } from "./inline/inline.js";
import { generateBlockMacroApplication } from "./block/blockMacroApplic.js";
import { generateDoCatchBlock } from "./block/doCatchBlock.js";
import { generateForBlock } from "./block/forBlock.js";
import { generateIfBlock } from "./block/ifBlock.js";
import { generateImportDeclaration } from "./block/importDeclar.js";
import { generateLabelDeclaration } from "./block/labelDeclar.js";
import { generateNamedFunction } from "./block/namedFunction.js";
import { generateUseDeclaration } from "./block/useDeclar.js";
import { generateVariableDeclaration } from "./block/varDeclar.js";
import { generateTerm } from "./inline/term/term.js";
import { generateLiteral } from "./inline/literal/literal.js";
import { skip, skipables, type Node } from "./utility.js";
import { generateArrayLiteral } from "./inline/literal/arrayLiteral.js";
import { generateMapLiteral } from "./inline/literal/mapLiteral.js";
import { stringLiterals } from "./utility.js";
import { generateTupleLiteral } from "./inline/literal/tupleLiteral.js";
import { generateMetaDataInterpolation } from "./inline/term/metaDataInterp.js";
import { generatePair } from "./inline/term/pair.js";
import { generateTaggedSymbol } from "./inline/term/taggedSymbol.js";
import { generateTaggedString } from "./inline/term/taggedString.js";
import { generateInlineStringFragment } from "./inline/term/inlineStringFragment.js";
import { generateTaggedNumber } from "./inline/term/taggedNumber.js";
import { generateImplicitMultiplication } from "./inline/term/implicitMultip.js";
import { generateForInline } from "./inline/term/forInline.js";
import { generateIfInline } from "./inline/term/ifInline.js";
import { generateMatchInline } from "./inline/term/matchInline.js";
import { generateObjectCascadeNotation } from "./inline/term/objectCascadeNotation.js";
import { generateObjectExtendNotation } from "./inline/term/objectExtendNotation.js";
import { generateExternalCallbackNotation } from "./inline/term/externalCallbackNotation.js";
import { generatePipelineNotation } from "./inline/term/pipelineNotation.js";
import { generateFunctionCall } from "./inline/term/functionCall.js";
import { generateInlineMacroApplication } from "./inline/term/inlineMacroApplication.js";
import { generateNumericLiteral } from "./inline/literal/numericLiteral.js";
import { generateDoExpr } from "./inline/literal/doExpr.js";
import { generateAnonFunction } from "./inline/literal/anonFunction.js";
import { generateUnitFunction } from "./inline/literal/unitFunction.js";
import { generateIdentifier } from "./inline/literal/identifier.js";
import { generateProgram } from "./program.js";

let context: Node = {
    type: "Program",
    value: [],
    start: 0,
    end: 0
} as Program

export function generateAST(tokens: TokenStream): Program {
    const program = context as Program

    skip(tokens, skipables)
    const value = generateProgram(context, tokens)

    if (!Array.isArray(value))
        throw new Error(value.error);

    program.value = value

    return program
}