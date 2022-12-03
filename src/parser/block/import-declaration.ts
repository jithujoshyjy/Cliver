import { TokenStream } from "../../lexer/token.js"
import { generateAsExpression } from "../inline/expression/as-expression.js"
import { generateNonVerbalOperator } from "../inline/expression/non-verbal-operator.js"
import { generatePrefixOperation } from "../inline/expression/prefix-operation.js"
import { generateIdentifier } from "../inline/literal/identifier.js"
import { generateStringLiteral } from "../inline/literal/stringLiteral.js"
import { generateObjectExtendNotation } from "../inline/term/object-extend-notation.js"
import { generateTaggedSymbol } from "../inline/term/tagged-symbol.js"
import { createMismatchToken, isKeyword, isOperator, skip, skipables, _skipables, type Node } from "../utility"

export function generateImportDeclaration(context: Node, tokens: TokenStream): ImportDeclaration | MismatchToken {
    const importDeclr: ImportDeclaration = {
        type: "ImportDeclaration",
        specifiers: [],
        sources: [],
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = skip(tokens, skipables) // skip import

    const captureComma = () => {
        currentToken = skip(tokens, skipables)
        if (!isOperator(currentToken, ",")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    const captureSpecifier = () => {
        currentToken = tokens.currentToken
        let specifierGenerators = [
            generateObjectExtendNotation, generateAsExpression,
            generateIdentifier, generatePrefixOperation, generateNonVerbalOperator
        ]

        let specifier: AsExpression
            | Identifier
            | ObjectExtendNotation
            | PrefixOperation
            | NonVerbalOperator
            | MismatchToken = null!

        for (let specifierGenerator of specifierGenerators) {
            specifier = specifierGenerator(importDeclr, tokens)
            if (specifier.type != "MismatchToken")
                break
        }

        return specifier
    }

    while (!tokens.isFinished) {
        const specifier = captureSpecifier()

        if (specifier.type == "MismatchToken")
            break

        importDeclr.specifiers.push(specifier)
        if (["PrefixOperation", "NonVerbalOperator"].includes(specifier.type))
            break
        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }
    }

    const parseSource = () => {
        let source: MismatchToken
            | TaggedSymbol
            | StringLiteral = generateTaggedSymbol(importDeclr, tokens)

        if (source.type == "MismatchToken") {
            source = generateStringLiteral(importDeclr, tokens)
        }

        if (source.type == "StringLiteral" && source.kind != "inline") {
            tokens.cursor = initialCursor
            return createMismatchToken(tokens.currentToken)
        }

        return source
    }

    const parseSources = () => {
        const sources: Array<TaggedSymbol | StringLiteral> = []
        while (!tokens.isFinished) {
            const source = parseSource()
    
            if (source.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return source
            }
    
            sources.push(source)

            const comma = captureComma()
    
            if (comma.type == "MismatchToken") {
                break
            }
            currentToken = skip(tokens, skipables)
        }
        return sources
    }

    if (importDeclr.specifiers.length === 0) {
        const sources = parseSources()
        if(!Array.isArray(sources)) {
            tokens.cursor = initialCursor
            return sources
        }

        importDeclr.sources = sources
    }
    else {
        currentToken = skip(tokens, skipables) // from

        if(!isKeyword(currentToken, "from") && importDeclr.specifiers.every(x => x.type == "Identifier")) {
            importDeclr.sources = importDeclr.specifiers as Identifier[]
            importDeclr.specifiers = []
        }

        currentToken = skip(tokens, skipables) // skip from

        const sources = parseSources()
        if(!Array.isArray(sources)) {
            tokens.cursor = initialCursor
            return sources
        }

        importDeclr.sources = sources
    }

    return importDeclr
}