import { type TokenStream } from "../lexer/token"

type Token = (Identifier
    | TopLevel
    | Assignment
    | FunctionCall
    | Group
    | SemiGroup
    | RawValue
    | OneOrMoreQuantifier
    | ZeroOrMoreQuantifier
    | AtmostOneQuantifier
    | Either)
    & { type: string, parent?: Token }

type TermsArray = Array<Exclude<Token, TopLevel | Assignment | RawValue>>

type Identifier = {
    type: "Identifier"
    value: string,
}

type TopLevel = {
    type: "TopLevel",
    value: Assignment[]
}

type Assignment = {
    type: "Assignment",
    left: Identifier,
    right: Array<Exclude<Token, TopLevel | RawValue>>
}

type FunctionCall = {
    type: "FunctionCall",
    caller: string,
    args: Array<Exclude<Token, TopLevel | Assignment>>
}

type Group = {
    type: "Group",
    value: TermsArray
}

type RawValue = {
    type: "RawValue",
    value: string
}

type SemiGroup = {
    type: "SemiGroup",
    value: TermsArray
}

type OneOrMoreQuantifier = {
    value: Identifier | FunctionCall | Group,
    type: "OneOrMoreQuantifier"
}

type ZeroOrMoreQuantifier = {
    value: Identifier | FunctionCall | Group,
    type: "ZeroOrMoreQuantifier"
}

type AtmostOneQuantifier = {
    value: Identifier | FunctionCall | Group,
    type: "AtmostOneQuantifier"
}

type Either = {
    type: "Either",
    left: TermsArray,
    right: TermsArray
}

export function grammaticParse(grammar: string, tokenStream: TokenStream) {

    const isUpperCase = (char: string) => char && /[A-Z]/u.test(char)
    const isLowerCase = (char: string) => char && /[a-z]/u.test(char)
    const isAlnum = (char: string) => char && /[\p{Letter}0-9_]/u.test(char)
    const isLParan = (char: string) => char && /\(/u.test(char)
    const isRParan = (char: string) => char && /\)/u.test(char)
    const isDollar = (char: string) => char && /\$/u.test(char)
    const isPlus = (char: string) => char && /\+/u.test(char)
    const isStar = (char: string) => char && /\*/u.test(char)
    const isQuest = (char: string) => char && /\?/u.test(char)
    const isPipe = (char: string) => char && /\|/u.test(char)
    const isAssign = (char: string) => char && /=/u.test(char)
    const isNonSpace = (char: string) => char && /\S/u.test(char)
    const isNewline = (char: string) => char && /\n/u.test(char)
    const isComma = (char: string) => char && /,/u.test(char)
    const isQuote = (char: string) => char && /"/u.test(char)
    const isBackslash = (char: string) => char && /\\/u.test(char)

    const topLevel: TopLevel = { type: "TopLevel", value: [] }
    let context: Token = topLevel

    const addToContext = (token: Token) => {
        token.parent = context
        if (context.type == "TopLevel")
            (context.value as Token[]).push(token)
        else if (context.type == "Assignment")
            (context.right as Token[]).push(token)
        else if (context.type == "Group")
            (context.value as Token[]).push(token)
        else if (context.type == "SemiGroup")
            (context.value as Token[]).push(token)
        else if (context.type == "Either")
            (context.right as Token[]).push(token)
        else if (context.type == "FunctionCall")
            (context.args as Token[]).push(token)
    }

    const popContext = () => {
        if (context.type == "Assignment")
            return (context.right as Token[]).pop()
        else if (context.type == "Group")
            return (context.value as Token[]).pop()
        else if (context.type == "SemiGroup")
            return (context.value as Token[]).pop()
        else if (context.type == "Either")
            return (context.right as Token[]).pop()
        else if (context.type == "FunctionCall")
            return (context.args as Token[]).pop()
        throw new Error(`Cannot pop value from the current context: ${context.type}`)
    }

    const throwable = (expectedCtx: string | string[], char: string) => {
        if (typeof expectedCtx == "string"
            && context.type != expectedCtx
            || !expectedCtx.includes(context.type))
            throw new Error(`Unexpected character '${char}'`)
    }

    let i = 0;
    while (i < grammar.length) {
        let char = grammar[i]

        const consumeChar = () => {
            const _char = char;
            i++; char = grammar[i];

            return _char
        }

        if (context.type == "TopLevel") {
            if (isLowerCase(char)) {
                let res = ''

                while (isAlnum(char))
                    res += consumeChar()

                const left: Identifier = { value: res, type: "Identifier" }
                const token: Assignment = { left, right: [], type: "Assignment" }

                addToContext(token)
                context = token
            }
            else if (isNonSpace(char)) {
                throwable("", char)
            }
            else consumeChar()
        }
        else if (isAssign(char)) {

            throwable("Assignment", char)
            consumeChar()
        }
        else if (isLowerCase(char)) {
            let res = ''

            while (isAlnum(char))
                res += consumeChar()

            const token: Identifier = { value: res, type: "Identifier" }
            addToContext(token)
        }
        else if (isUpperCase(char)) {
            let res = ''
            res += consumeChar()

            while (isAlnum(char))
                res += consumeChar()

            const token: FunctionCall = { caller: res, args: [], type: "FunctionCall" }
            addToContext(token)

            context = token
        }
        else if (isLParan(char)) {
            consumeChar()

            const token: Group = { value: [], type: "Group" }
            addToContext(token)

            context = token
        }
        else if (isRParan(char)) {

            while (context.type != "Assignment") {
                throwable(["Group", "SemiGroup", "Either"], char)
                if (context.type == "Group") {
                    const { value } = context
                    context = context.parent!

                    if (context.type == "FunctionCall") {
                        context.args = value as Array<Exclude<Token, TopLevel | Assignment>>
                        context = context.parent!
                    }
                    break
                }
            }

            consumeChar()
        }
        else if (isComma(char)) {
            throwable("Group", char)
            consumeChar()
        }
        else if (isQuote(char)) {
            let res = ''
            consumeChar()

            while (i < grammar.length) {
                if (isBackslash(char) && i + 1 < grammar.length)
                    res += consumeChar() + consumeChar()
                else if (isQuote(char)) {
                    consumeChar()
                    break
                }
                else
                    res += consumeChar()
            }

            const token: RawValue = { value: res, type: "RawValue" }
            addToContext(token)
        }
        else if (isDollar(char)) {
            consumeChar()

            const token: SemiGroup = { value: [], type: "SemiGroup" }
            addToContext(token)

            context = token
        }
        else if (isPlus(char)) {

            throwable(["Assignment", "Group", "SemiGroup", "Either", "FunctionCall"], char)

            const value = popContext() as Identifier | FunctionCall | Group
            if (value === undefined) {
                throwable("", char)
            }

            const token: OneOrMoreQuantifier = { value, type: "OneOrMoreQuantifier" }
            addToContext(token)

            consumeChar()
        }
        else if (isStar(char)) {
            throwable(["Assignment", "Group", "SemiGroup", "Either", "FunctionCall"], char)

            const value = popContext() as Identifier | FunctionCall | Group
            if (value === undefined) {
                throwable("", char)
            }

            const token: ZeroOrMoreQuantifier = { value, type: "ZeroOrMoreQuantifier" }
            addToContext(token)

            consumeChar()
        }
        else if (isQuest(char)) {
            throwable(["Assignment", "Group", "SemiGroup", "Either", "FunctionCall"], char)

            const value = popContext() as Identifier | FunctionCall | Group
            if (value === undefined)
                throwable("", char)

            const token: AtmostOneQuantifier = { value, type: "AtmostOneQuantifier" }
            addToContext(token)

            consumeChar()
        }
        else if (isPipe(char)) {
            consumeChar()

            const left: TermsArray = []
            let value: Token | undefined

            while (value = popContext() as TermsArray[0])
                left.push(value)

            const token: Either = { left, right: [], type: "Either" }
            addToContext(token)

            context = token
        }
        else if (isNewline(char) && context.type == "Assignment") {

            consumeChar()
            if (context.right?.length)
                context = topLevel

        }
        else if (isNonSpace(char)) {
            throwable("", char)
        }
        else consumeChar()
    }

    const rules = topLevel.value
    const main = rules.find(rule => rule.left.value == "main")

    if (!main)
        throw new Error(`Entry point 'main' is not specified`)

    new Visitable(main).accept(new Visitor())

    return topLevel
}

class Visitor {
    rules: string[] = []
    visit(term: Visitable) {
        term.accept(this)
    }
    visitMain(term: Assignment) {
        const ruleName = term.left.value

        if (this.rules.includes(ruleName))
            throw new Error(`Duplicate rule '${ruleName}'`)
        
        this.rules.push(ruleName)

        for (let subTerm of term.right)
            new Visitable(subTerm).accept(this);

        const topLevel = (term as Token).parent!
        new Visitable(topLevel).accept(this);
    }
    visitRule(term: Assignment) {
        const ruleName = term.left.value
        if (this.rules.includes(ruleName))
            throw new Error(`Duplicate rule '${ruleName}'`)
        this.rules.push(ruleName)
        for (let subTerm of term.right)
            new Visitable(subTerm).accept(this)
    }
    visitAtmostOneQuantifier(term: AtmostOneQuantifier) {
        new Visitable(term.value).accept(this)
    }
    visitEither(term: Either) {
        for (let subTerm of term.left)
            new Visitable(subTerm).accept(this)

        for (let subTerm of term.right)
            new Visitable(subTerm).accept(this)
    }
    visitFunctionCall(term: FunctionCall) {
        for (let subTerm of term.args)
            new Visitable(subTerm).accept(this)
    }
    visitGroup(term: Group) {
        for (let subTerm of term.value)
            new Visitable(subTerm).accept(this)
    }
    visitIdentifier(term: Identifier) {

    }
    visitOneOrMoreQuantifier(term: OneOrMoreQuantifier) {
        new Visitable(term.value).accept(this)
    }
    visitRawValue(term: RawValue) {

    }
    visitSemiGroup(term: SemiGroup) {
        for (let subTerm of term.value)
            new Visitable(subTerm).accept(this)
    }
    visitTopLevel(term: TopLevel) {
        const subterms = term.value.filter(x => x.left.value !== "main")
        for (let subTerm of subterms)
            new Visitable(subTerm).accept(this)
    }
    visitZeroOrMoreQuantifier(term: ZeroOrMoreQuantifier) {
        new Visitable(term.value).accept(this)
    }
}

class Visitable {
    constructor(public token: Token) { }
    dispatch(visitor: Visitor) {
        switch (this.token.type) {
            case "Assignment":
                return this.token.left.value == "main" ?
                    visitor.visitMain(this.token) : visitor.visitRule(this.token)
            case "AtmostOneQuantifier":
                return visitor.visitAtmostOneQuantifier(this.token)
            case "Either":
                return visitor.visitEither(this.token)
            case "FunctionCall":
                return visitor.visitFunctionCall(this.token)
            case "Group":
                return visitor.visitGroup(this.token)
            case "Identifier":
                return visitor.visitIdentifier(this.token)
            case "OneOrMoreQuantifier":
                return visitor.visitOneOrMoreQuantifier(this.token)
            case "RawValue":
                return visitor.visitRawValue(this.token)
            case "SemiGroup":
                return visitor.visitSemiGroup(this.token)
            case "TopLevel":
                return visitor.visitTopLevel(this.token)
            case "ZeroOrMoreQuantifier":
                return visitor.visitZeroOrMoreQuantifier(this.token)
        }
    }
    accept(visitor: Visitor) {
        return this.dispatch(visitor)
    }
}