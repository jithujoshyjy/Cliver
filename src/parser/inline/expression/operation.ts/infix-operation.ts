import { TokenStream } from "../../../../lexer/token.js"
import { skip, skipables, operatorPrecedence, type Node, createMismatchToken } from "../../../utility"
import { generateLiteral } from "../../literal/literal.js"
import { generateTerm } from "../../term/term.js"
import { generateInfixCallOperator } from "./infix-call-operator.js"
import { generateNonVerbalOperator } from "./non-verbal-operator.js"
// import { generatePostfixOperation } from "./postfix-operation.js"
import { generatePrefixOperation } from "./prefix-operation.js"
import { generateVerbalOperator } from "./verbal-operator.js"

export function generateInfixOperation(context: Node, tokens: TokenStream): InfixOperation | MismatchToken {
    const infixOperation: InfixOperation = {
        type: "InfixOperation",
        left: null!,
        operator: null!,
        right: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const operands: Array<typeof infixOperation.left> = []
    const operators: Array<typeof infixOperation.operator> = []

    const operandGenerators = [
        generatePrefixOperation, /* generatePostfixOperation, */ generateLiteral, generateTerm
    ]

    const operatorGenerators = [
        generateInfixCallOperator, generateNonVerbalOperator, generateVerbalOperator
    ]

    const captureOperand = () => {

        let operand: PrefixOperation
            // | PostfixOperation
            | Literal
            | Term
            | Expression
            | MismatchToken = null!

        for (let operandGenerator of operandGenerators) {
            operand = operandGenerator(infixOperation, tokens)
            if (operand.type != "MismatchToken") {
                break
            }
        }

        return operand
    }

    const getPrecidence = (op: typeof operators[0]): number => {
        switch (op.type) {
            case "InfixCallOperator":
                return 9
            case "VerbalOperator":
            case "NonVerbalOperator":
                return op.precedence = operatorPrecedence.infix[op.name] ?? 10
        }
    }

    const captureOperator = () => {
        currentToken = skip(tokens, skipables) // operator

        let _operator: InfixCallOperator
            | NonVerbalOperator
            | VerbalOperator
            | MismatchToken = null!

        for (let operatorGenerator of operatorGenerators) {
            _operator = operatorGenerator(infixOperation, tokens)
            if (_operator.type != "MismatchToken") {
                break
            }
        }

        return _operator
    }

    let prevOprPrecedence = 0
    while (!tokens.isFinished) {
        const operand = captureOperand()

        if (operand.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return operand
        }

        operands.unshift(operand)

        const _operator = captureOperator()
        if (operators.length === 0 && _operator.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return _operator
        }
        if (_operator.type == "MismatchToken") {
            break
        }

        const currentOprPrecedence = getPrecidence(_operator)
        if (prevOprPrecedence >= currentOprPrecedence) {
            const right = operands.shift()!
            const left = operands.shift()!
            const _operator = operators.shift()!

            const _infixOperation: InfixOperation = {
                type: "InfixOperation",
                left: left,
                operator: _operator,
                right: right,
                start: 0,
                end: 0
            }
            operands.unshift(_infixOperation)
        }

        operators.unshift(_operator)
        prevOprPrecedence = currentOprPrecedence
        currentToken = skip(tokens, skipables) // skip operator
    }

    if(operators.length < 1) {
        tokens.cursor = initialCursor
        return createMismatchToken(tokens.currentToken)
    }

    for (let _operator of operators) {
        const right = operands.shift()!
        const left = operands.shift()!
        const _operator = operators.shift()!

        const _infixOperation: InfixOperation = {
            type: "InfixOperation",
            left: left,
            operator: _operator,
            right: right,
            start: 0,
            end: 0
        }
        operands.unshift(_infixOperation)
    }

    const _infixOperation = operands.shift()! as InfixOperation
    infixOperation.left = _infixOperation.left
    infixOperation.right = _infixOperation.right
    infixOperation.operator = _infixOperation.operator

    return infixOperation
}