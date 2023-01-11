import { TokenStream } from "../../../../lexer/token.js"
import { skip, skipables, operatorPrecedence, type Node, createMismatchToken, PartialParse, NodePrinter, pickPrinter, isRightAssociative } from "../../../utility.js"
import { generateLiteral, printLiteral } from "../../literal/literal.js"
import { generateTerm, printTerm } from "../../term/term.js"
import { generateGroupExpression } from "../group-expression.js"
import { generateInfixCallOperator, printInfixCallOperator } from "./infix-call-operator.js"
import { generateNonVerbalOperator, printNonVerbalOperator } from "./non-verbal-operator.js"
import { generatePostfixOperation, printPostfixOperation } from "./postfix-operation.js"
// import { generatePostfixOperation } from "./postfix-operation.js"
import { generatePrefixOperation, printPrefixOperation } from "./prefix-operation.js"
import { generateVerbalOperator, printVerbalOperator } from "./verbal-operator.js"

export function generateInfixOperation(context: Node, tokens: TokenStream): InfixOperation | MismatchToken {
    let infixOperation: InfixOperation = {
        type: "InfixOperation",
        left: null!,
        operator: null!,
        right: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    type OperandGenerator = Array<(context: Node, tokens: TokenStream) => typeof infixOperation.left | MismatchToken>

    let operandGenerators: OperandGenerator = [
        generatePrefixOperation, generatePostfixOperation, generateTerm, generateLiteral
    ]

    const generateOperand = () => {
        let operand: typeof infixOperation.left
            | MismatchToken = null!

        for (let operandGenerator of operandGenerators) {
            operand = operandGenerator(infixOperation, tokens)
            currentToken = tokens.currentToken

            if (operand.type != "MismatchToken")
                break

            if (operand.errorDescription.severity <= 3) {
                tokens.cursor = initialCursor
                return operand
            }
        }

        return operand
    }

    let operand: typeof infixOperation.left
        | MismatchToken = generateOperand()

    if (operand.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return operand
    }

    currentToken = tokens.currentToken
    infixOperation.left = operand

    infixOperation.start = operand.start
    infixOperation.line = operand.line
    infixOperation.column = operand.column

    const getPrecidence = (op: InfixCallOperator | NonVerbalOperator | VerbalOperator) => {
        const value = op.type == "InfixCallOperator" ? "`" : op.name
        return operatorPrecedence.infix.left[value]
            ?? operatorPrecedence.infix.right[value]
            ?? 10
    }

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    const operatorGenerators = [
        generateInfixCallOperator, generateNonVerbalOperator, generateVerbalOperator
    ]

    let _operator: InfixCallOperator
        | NonVerbalOperator
        | VerbalOperator
        | MismatchToken = null!;

    for (let operatorGenerator of operatorGenerators) {
        _operator = operatorGenerator(infixOperation, tokens)
        currentToken = tokens.currentToken

        if (_operator.type != "MismatchToken")
            break

        if (_operator.errorDescription.severity <= 3) {
            tokens.cursor = initialCursor
            return _operator
        }
    }

    currentToken = tokens.currentToken
    if (_operator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return _operator
    }

    _operator.precedence = getPrecidence(_operator)
    infixOperation.operator = _operator

    if (infixOperation.left.type == "PrefixOperation") {
        const thisOpPreced = _operator.precedence
        let lhsPrefixOpr = infixOperation.left as PrefixOperation

        const lhsPrefixOprPreced = infixOperation.left.operator.precedence

        if (thisOpPreced > lhsPrefixOprPreced) {
            infixOperation.left = lhsPrefixOpr.operand
            lhsPrefixOpr.operand = infixOperation

            const partialParse: PartialParse = {
                result: lhsPrefixOpr,
                cursor: tokens.cursor
            }

            tokens.cursor = initialCursor
            return createMismatchToken(currentToken, partialParse)
        }
    }

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken

    operandGenerators = [
        generateInfixOperation, ...operandGenerators
    ]

    operand = generateOperand()
    if (operand.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return operand
    }

    infixOperation.end = operand.end
    currentToken = tokens.currentToken

    if (operand.type == "InfixOperation") {
        const thisOpPreced = _operator.precedence
        const otherOpPreced = operand.operator.precedence

        if (thisOpPreced > otherOpPreced || thisOpPreced == otherOpPreced && !isRightAssociative(operand.operator)) {

            operand.line = infixOperation.line
            operand.column = infixOperation.column

            operand.start = infixOperation.start
            infixOperation.end = operand.start

            infixOperation.right = operand.left
            operand.left = infixOperation
            infixOperation = operand
        }
        else {
            infixOperation.right = operand
            infixOperation.end = operand.end
        }
    }
    else {
        infixOperation.right = operand
        infixOperation.end = operand.end
    }

    return infixOperation
}

export function printInfixOperation(token: InfixOperation, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"

    const operandPrinters = [
        printInfixOperation, printPostfixOperation,
        printTerm, printLiteral, printPrefixOperation
    ] as NodePrinter[]

    const operatorPrinters = [
        printNonVerbalOperator, printVerbalOperator, printInfixCallOperator
    ] as NodePrinter[]

    const lhsPrinter = pickPrinter(operandPrinters, token.left)!
    const rhsPrinter = pickPrinter(operandPrinters, token.right)!
    const operatorPrinter = pickPrinter(operatorPrinters, token.operator)!

    return "InfixOperation\n" +
        '\t'.repeat(indent) + middleJoiner + "left\n" +
        '\t'.repeat(indent + 1) + endJoiner + lhsPrinter(token.left, indent + 2) + '\n' +
        '\t'.repeat(indent) + middleJoiner + "operator\n" +
        '\t'.repeat(indent + 1) + endJoiner + operatorPrinter(token.operator, indent + 2) + '\n' +
        '\t'.repeat(indent) + endJoiner + "right\n" +
        '\t'.repeat(indent + 1) + endJoiner + rhsPrinter(token.right, indent + 2)
}