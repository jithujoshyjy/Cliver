import { TokenStream } from "../../../../lexer/token.js"
import { operatorPrecedence, skip, skipables, type Node, createMismatchToken, pickPrinter, NodePrinter, PartialParse, isBlockedType } from "../../../utility.js"
import { generateLiteral, printLiteral } from "../../literal/literal.js"
import { generateTerm, printTerm } from "../../term/term.js"
import { printGroupExpression } from "../group-expression.js"
import { printInfixOperation } from "./infix-operation.js"
import { generateNonVerbalOperator, printNonVerbalOperator } from "./non-verbal-operator.js"
import { printPrefixOperation } from "./prefix-operation.js"
import { generateVerbalOperator, printVerbalOperator } from "./verbal-operator.js"

export function generatePostfixOperation(context: string[], tokens: TokenStream): PostfixOperation | MismatchToken {
    const postfixOperation: PostfixOperation = {
        type: "PostfixOperation",
        operand: null!,
        operator: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const operandGenerators = [
        generateTerm, generateLiteral
    ]

    let operand: Literal | Term | MismatchToken = null!
    for (let operandGenerator of operandGenerators) {
        if (isBlockedType(operandGenerator.name.replace("generate", '')))
            continue
        operand = operandGenerator(["PostfixOperation", ...context], tokens)
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

    postfixOperation.operand = operand
    postfixOperation.start = operand.start
    postfixOperation.line = operand.line
    postfixOperation.column = operand.column

    const partialParse: PartialParse = {
        cursor: tokens.cursor,
        result: operand
    }

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken // skip operand

    let _operator: NonVerbalOperator
        | VerbalOperator
        | MismatchToken = generateNonVerbalOperator(["PostfixOperation", ...context], tokens)

    if (_operator.type == "MismatchToken")
        _operator = generateVerbalOperator(["PostfixOperation", ...context], tokens)
        
    if (_operator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        _operator.partialParse = partialParse
        return _operator
    }

    currentToken = tokens.currentToken
    if (!(_operator.name in operatorPrecedence.postfix)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken, partialParse)
    }

    const getPrecidence = (op: NonVerbalOperator | VerbalOperator): number => {
        switch (op.type) {
            case "VerbalOperator":
            case "NonVerbalOperator": {
                const defaultPreced = op.type == "VerbalOperator" ? 2 : 10
                return operatorPrecedence.postfix[op.name] ?? defaultPreced
            }
        }
    }


    postfixOperation.end = _operator.end
    _operator.kind = "postfix"
    _operator.precedence = getPrecidence(_operator)
    postfixOperation.operator = _operator

    return postfixOperation
}

export function printPostfixOperation(token: PostfixOperation, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const operandPrinters = [
        printInfixOperation, printPrefixOperation,
        printTerm, printLiteral, printGroupExpression
    ] as NodePrinter[]

    const operatorPrinters = [
        printNonVerbalOperator, printVerbalOperator
    ] as NodePrinter[]

    const operandPrinter = pickPrinter(operandPrinters, token.operand)!
    const operatorPrinter = pickPrinter(operatorPrinters, token.operator)!
    const space = ' '.repeat(4)
    return "PostfixOperation\n" +
        space.repeat(indent) + middleJoiner + "operand\n" +
        space.repeat(indent + 1) + endJoiner + operandPrinter(token.operand, indent + 2) + '\n' +
        space.repeat(indent) + endJoiner + "operator\n" +
        space.repeat(indent + 1) + endJoiner + operatorPrinter(token.operator, indent + 2)
}