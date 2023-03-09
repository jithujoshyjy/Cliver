import { TokenStream } from "../../../../lexer/token.js"
import { operatorPrecedence, skip, skipables, NodePrinter, pickPrinter, isBlockedType } from "../../../utility.js"
import { generateLiteral, printLiteral } from "../../literal/literal.js"
import { generateTerm, printTerm } from "../../term/term.js"
import { printInfixOperation } from "./infix-operation.js"
import { generateNonVerbalOperator, printNonVerbalOperator } from "./non-verbal-operator.js"
import { generatePostfixOperation, printPostfixOperation } from "./postfix-operation.js"
import { generateVerbalOperator, printVerbalOperator } from "./verbal-operator.js"

export function generatePrefixOperation(context: string[], tokens: TokenStream): PrefixOperation | MismatchToken {
    const prefixOperation: PrefixOperation = {
        type: "PrefixOperation",
        operand: null!,
        operator: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    let _operator: NonVerbalOperator
        | VerbalOperator
        | MismatchToken = generateNonVerbalOperator(["PrefixOperation", ...context], tokens)

    if (_operator.type == "MismatchToken")
        _operator = generateVerbalOperator(["PrefixOperation", ...context], tokens)

    if (_operator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return _operator
    }

    prefixOperation.start = _operator.start
    prefixOperation.line = _operator.line
    prefixOperation.column = _operator.column

    const getPrecidence = (op: NonVerbalOperator | VerbalOperator): number => {
        switch (op.type) {
            case "VerbalOperator":
            case "NonVerbalOperator": {
                const defaultPreced = op.type == "VerbalOperator" ? 2 : 10
                return operatorPrecedence.prefix[op.name] ?? defaultPreced
            }
        }
    }

    _operator.kind = "prefix"
    _operator.precedence = getPrecidence(_operator)

    prefixOperation.operator = _operator

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const operandGenerators = [
        generatePrefixOperation, generatePostfixOperation, generateTerm, generateLiteral
    ]

    let operand: Literal
        | Term
        | PostfixOperation
        | PrefixOperation
        | MismatchToken = null!

    for (let operandGenerator of operandGenerators) {
        if (isBlockedType(operandGenerator.name.replace("generate", '')))
            continue

        operand = operandGenerator(["PrefixOperation", ...context], tokens)
        currentToken = tokens.currentToken

        if (operand.type != "MismatchToken")
            break

        if (operand.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return operand
        }
    }

    if (operand.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return operand
    }

    prefixOperation.operand = operand
    prefixOperation.end = operand.end

    return prefixOperation
}

export function printPrefixOperation(token: PrefixOperation, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const operandPrinters = [
        printInfixOperation, printPrefixOperation, printPostfixOperation,
        printTerm, printLiteral,
    ] as NodePrinter[]

    const operatorPrinters = [
        printNonVerbalOperator, printVerbalOperator
    ] as NodePrinter[]

    const operandPrinter = pickPrinter(operandPrinters, token.operand)!
    const operatorPrinter = pickPrinter(operatorPrinters, token.operator)!
    const space = ' '.repeat(4)
    return "PrefixOperation\n" +
        space.repeat(indent) + middleJoiner + "operator\n" +
        space.repeat(indent + 1) + endJoiner + operatorPrinter(token.operator, indent + 2) + '\n' +
        space.repeat(indent) + endJoiner + "operand\n" +
        space.repeat(indent + 1) + endJoiner + operandPrinter(token.operand, indent + 2)
}