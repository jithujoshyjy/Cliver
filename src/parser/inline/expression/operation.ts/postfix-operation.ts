import { TokenStream } from "../../../../lexer/token.js"
import { operatorPrecedence, skip, skipables, type Node, createMismatchToken, pickPrinter, NodePrinter } from "../../../utility.js"
import { generateLiteral, printLiteral } from "../../literal/literal.js"
import { generateTerm, printTerm } from "../../term/term.js"
import { generateGroupExpression, printGroupExpression } from "../group-expression.js"
import { generateInfixOperation, printInfixOperation } from "./infix-operation.js"
import { generateNonVerbalOperator, printNonVerbalOperator } from "./non-verbal-operator.js"
import { generatePrefixOperation, printPrefixOperation } from "./prefix-operation.js"
import { generateVerbalOperator, printVerbalOperator } from "./verbal-operator.js"

export function generatePostfixOperation(context: Node, tokens: TokenStream): PostfixOperation | MismatchToken {
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
        generateTerm, generateLiteral, generateGroupExpression, generatePrefixOperation
    ]

    let operand: InfixOperation | Literal | Term | GroupExpression | PrefixOperation | MismatchToken = null!
    for (let operandGenerator of operandGenerators) {
        operand = operandGenerator(postfixOperation, tokens)
        currentToken = tokens.currentToken
        if (operand.type != "MismatchToken") {
            break
        }
    }
    
    if (operand.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return operand
    }

    currentToken = skipables.includes(tokens.currentToken)
        ? skip(tokens, skipables)
        : tokens.currentToken // skip operand
    
    const skipNpeek = () => {
        let idx = 1
        let nextToken = tokens.peek(idx)
        while (nextToken && nextToken.type != "EOF" && skipables.includes(nextToken)) {
            idx++
            nextToken = tokens.peek(idx)
        }
        return nextToken
    }

    let _operator: NonVerbalOperator
        | MismatchToken = generateNonVerbalOperator(postfixOperation, tokens)
    
    if (_operator.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return _operator
    }

    if(!(_operator.name in operatorPrecedence.postfix)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    postfixOperation.start = _operator.start

    const getPrecidence = (op: NonVerbalOperator): number => {
        const isVerbalOperator = /^\p{Letter}+$/gu.test(op.name as string)
        const defaultPreced = isVerbalOperator ? 2 : 5
        switch (op.type) {
            // case "VerbalOperator":
            case "NonVerbalOperator":
                return operatorPrecedence.postfix[op.name] ?? defaultPreced
        }
    }

    _operator.kind = "postfix"
    _operator.precedence = getPrecidence(_operator)

    postfixOperation.operator = _operator
    const resetCursorPoint = tokens.cursor

    const nextToken = skipables.includes(currentToken) ? skipNpeek() : currentToken
    if (nextToken && nextToken.type == "Operator") {

        const getPrecidence = (op: typeof currentToken) =>
            operatorPrecedence.infix.left[op.value as string] ??
            operatorPrecedence.infix.right[op.value as string] ?? 10

        const isRightAssociative = (op: typeof currentToken) =>
            Object.keys(operatorPrecedence.infix.right).includes(op.value as string)

        const nextOpPrecedence = getPrecidence(nextToken)
        const nextHasMorePreced = nextOpPrecedence > _operator.precedence
        const isNextRightAssoc = nextOpPrecedence == _operator.precedence
            && isRightAssociative(nextToken)

        if (nextHasMorePreced || isNextRightAssoc) {
            tokens.cursor = resetCursorPoint
            const infixOperation = generateInfixOperation(postfixOperation, tokens)
            if (infixOperation.type == "MismatchToken") {
                tokens.cursor = initialCursor
                return infixOperation
            }
            operand = infixOperation
        }
    }

    postfixOperation.operand = operand
    postfixOperation.end = operand.end

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

    return "PostfixOperation\n" + '\t'.repeat(indent) +
        middleJoiner + operatorPrinter(token.operator, indent+1) + '\n' +
        endJoiner + operandPrinter(token.operand, indent+1) + '\n'
}