{
    const req = () => { throw Error("Missing required argment") }

    function pipe(x=req(), f=req(), ...fs) {
        const [_f, ..._fs] = fs
        return fs.length == 0 ? f(x) : pipe(f(x), _f, ..._fs)
    }

    function getAstObjects(arr=req(), flatCount=1) {
        return arr.flat(flatCount).filter(x => x !== null && typeof x === "object")
    }

    function createObject(type=req(), value=req()) {
        const _obj = Object.create(null)
        _obj.type = type

        const valInstance = Object.getPrototypeOf(value)
        if(value !== null && typeof value == "object" && valInstance === null || Object.getPrototypeOf(valInstance) === null)
            Object.assign(_obj, value)
        else
            _obj.value = value

        return Object.freeze(_obj)
    }

    function createProgram(program=req()) {
        return createObject("program", getAstObjects(program))
    }

    function createWhiteSpace(whitespace=req()) {
        return createObject("whitespace", whitespace)
    }

    function createSinglelineComment(comment=req()) {
        return createObject("singleline-comment", comment)
    }

    function createMultilineComment(comment=req()) {
        return createObject("multiline-comment", comment)
    }

    function createComment(comment=req()) {
        return createObject("comment", comment)
    }

    function createNotSoftKeywordId(notSoftKeywordId=req()) {
        return createObject("not-soft-keyword-identifier", notSoftKeywordId)
    }

    function createIdentifier(identifier=req()) {
        return createObject("identifier", identifier)
    }

    function createReservedIdentifier(reservedIdentifier=req()) {
        return createObject("reserved-identifier", reservedIdentifier)
    }

    function createReservedWord(reservedWord=req()) {
        return createObject("reserved-word", reservedWord)
    }

    function createKeyWord(keyword=req()) {
        return createObject("keyword", keyword)
    }

    function createSoftKeyword(softKeyword=req()) {
        return createObject("soft-keyword", softKeyword)
    }

    function createExpression(expr=req()) {
        return createObject("expression", expr)
    }

    function createTerm(term=req()) {
        return createObject("term", term)
    }

    function createLiteral(literal=req()) {
        return createObject("literal", literal)
    }

    function createBlock(block=req()) {
        return createObject("block", block)
    }

    function createBlockUnits(blockUnits=req()) {
        return createObject("block-units", blockUnits)
    }

    function createBoolean(bool=req()) {
        return createObject("boolean", bool == "True")
    }

    function createNumber(number=req()) {
        return createObject("number", number)
    }

    function createInteger(integer=req()) {
        return createObject("integer", new Number(integer))
    }

    function createFloat(float=req()) {
        return createObject("float", new Number(float))
    }

    function createBinary(binary=req()) {
        return createObject("binary", new Number("0b"+binary))
    }

    function createOctal(octal=req()) {
        return createObject("octal", new Number("0o"+octal))
    }

    function createHex(hex=req()) {
        return createObject("hex", new Number("0x"+hex))
    }

    function createExponent(exp=req()) {
        return createObject("exp", new Number(exp) * 10)
    }

    function createImplicitMultipWithExpr(multExpr=req()) {
        // const [number, id, expr] = multExpr
        // const term = pipe(number, createNumber, createLiteral, createTerm)
        // const infopr = pipe("*", createArithmeticOperator, createInfixOperator)
        // const infoprn = createInfixOperation("infix-operation", [term, [infopr, [id, [infopr, expr]]]])
        // return createObject("implicit-multiplication-with-expression", infoprn)
        return createObject("implicit-multiplication-with-expression", multExpr)
    }

    function createImplicitMultipWithIdent(multExpr=req()) {
        // const [number, id] = multExpr
        // const term = pipe(number, createNumber, createLiteral, createTerm)
        // const infopr = pipe("*", createArithmeticOperator, createInfixOperator)
        // const infoprn = createInfixOperation("infix-operation", [term, [infopr, [id]]])
        // return createObject("implicit-multiplication-with-identifier", infoprn)
        return createObject("implicit-multiplication-with-identifier", multExpr)
    }

    function createTaggedNumber(taggedNumber=req()) {
        let [head, tail] = taggedNumber
        head = typeof head[0] == "string" ? head[2] : head

        const nativeTags = [
            {name: "b", create: createBinary},
            {name: "o", create: createOctal},
            {name: "x", create: createHex},
            {name: "e", create: createExponent},
        ]

        let matchedNativeTag;
        if(nativeTags.some(tag => tag.name == tail.value && (matchedNativeTag = tag)))
            return matchedNativeTag.create(head.value)
        
        return createObject("tagged-number", {head, tail})
    }

    function createSymbolicChar(symbolicChar=req()) {
        return createObject("symbolic-character", symbolicChar)
    }

    function createQuotedChar(quotedChar=req()) {
        return createObject("quoted-character", quotedChar)
    }

    function createHexChar(hexChar=req()) {
        return createObject("hex-character", String.fromCodePoint(hexChar))
    }

    function createChar(_char=req()) {
        return createObject("character", _char)
    }

    function createMultiQuotedString(multiQuotedString=req()) {
        return createObject("multi-quoted-string", multiQuotedString)
    }

    function createString(string=req()) {
        return createObject("string", string)
    }

    function createSymbol(symbol=req()) {
        return createObject("symbol", symbol)
    }

    function createStringFragment(stringFragment=req()) {
        return createObject("string-fragment", getAstObjects(stringFragment))
    }

    function createInStringExpr(inStringExpr=req()) {
        let [head, tail] = inStringExpr
        tail = getAstObjects(tail)
        return createObject("in-string-expression", {head, tail})
    }

    function createDoubleQuotedFstring(doubleQuotedFstring=req()) {
        return createObject("double-quoted-fstring", doubleQuotedFstring)
    }

    function createMultiQuotedFstring(multiQuotedFstring=req()) {
        return createObject("multi-quoted-fstring", multiQuotedFstring)
    }

    function createTaggedString(taggedString=req()) {
        let [head, tail] = taggedString
        tail = getAstObjects(tail)
        return createObject("tagged-string", {head, tail})
    }

    function createLeadingParenUnit(leadingParenUnit=req()) {
        let [head, tail] = leadingParenUnit
        tail = getAstObjects(tail)
        return createObject("leading-parenthesized-unit", {head, tail})
    }

    function createTrailingParenUnit(trailingParenUnit=req()) {
        const [head, tail] = [trailingParenUnit.head, trailingParenUnit.tail]
        return createObject("trailing-parenthesized-unit", {head, tail})
    }

    function createParenthesesEnclosed(parenthesesEnclosed=req()) {
        let [head, tail] = getAstObjects(parenthesesEnclosed)
        tail = getAstObjects(tail)
        return createObject("parentheses-enclosed", {head, tail})
    }

    function createPair(pair=req()) {
        const [head, tail] = pair
        return createObject("pair", {head, tail})
    }

    function createPairedParanUnit(pairedParanUnit=req()) {
        let [head, tail] = pairedParanUnit
        tail = getAstObjects(tail)
        return createObject("paired-parenthesized-unit", {head, tail})
    }

    function createLeadingBracketUnit(leadingBracketUnit=req()) {
        let [head, tail] = leadingBracketUnit
        tail = getAstObjects(tail)
        return createObject("leading-bracket-unit", {head, tail})
    }

    function createTrailingBracketUnit(trailingBracketUnit=req()) {
        let [head, tail] = getAstObjects(trailingBracketUnit)
        tail = getAstObjects(tail)
        return createObject("trailing-bracket-unit", {head, tail})
    }

    function createSquareBracketEnclosed(squareBracketEnclosed=req()) {
        let [head, tail] = getAstObjects(squareBracketEnclosed)
        tail = tail !== undefined ? getAstObjects(tail) : []
        return createObject("bracket-enclosed", {head, tail})
    }

    function createCurlyBracedBlockUnit(curlyBracedBlockUnit=req()) {
       return createObject("curly-braced-block-unit", getAstObjects(curlyBracedBlockUnit))
    }

    function createCurlyBracedInlineUnit(curlyBracedInlineUnit=req()) {
        let [head, tail] = curlyBracedInlineUnit
        tail = getAstObjects(tail)
        return createObject("curly-braced-inline-unit", {head, tail})
    }

    function createCurlyBracedUnit(curlyBracedUnit=req()) {

        if(!Array.isArray(curlyBracedUnit))
            return createObject("curly-braced-unit", curlyBracedUnit)

        let [head, tail] =  getAstObjects(curlyBracedUnit)
        return createObject("curly-braced-unit", {head, tail})
    }

    function createCurlyBraceEnclosed(curlyBraceEnclosed=req()) {
        return createObject("curly-braced-enclosed", curlyBraceEnclosed)
    }

    function createAssignExpr(assignExpr=req()) {
        const [head, tail] = assignExpr
        return createObject("assignment-expression", {head, tail})
    }

    function createAssignExprLhs(assignExprLhs=req()) {
        return createObject("assignment-expression-left-hand-side", assignExprLhs)
    }

    function createAssignExprLhsPair(assignExprLhsPair=req()) {
        const [head, tail] = assignExprLhsPair
        return createObject("assignment-expression-left-hand-side-pair", {head, tail})
    }

    function createAssignExprLhsPairedParanUnit(assignExprLhsPairedParanUnit=req()) {
        let [head, tail] = assignExprLhsPairedParanUnit
        tail = getAstObjects(tail)
        return createObject("assignment-expression-left-hand-side-paired-parenthesized-unit", {head, tail})
    }

    function createAssignExprLhsMixPairedParanUnit(assignExprLhsMixPairedParanUnit=req()) {
        let [head, tail] = assignExprLhsMixPairedParanUnit
        tail = getAstObjects(tail)
        return createObject("assignment-expression-left-hand-side-mixed-paired-parenthesized-unit", {head, tail})
    }

    function createAssignExprLhsLeadingParenUnit(assignExprLhsLeadingParenUnit=req()) {

        if(!Array.isArray(assignExprLhsLeadingParenUnit))
            return createObject("assignment-expression-left-hand-side-leading-parenthesized-unit",
            {head: assignExprLhsLeadingParenUnit, tail: []})
        
        let [head, tail] = assignExprLhsLeadingParenUnit
        tail = tail !== undefined ? getAstObjects(tail) : []
        return createObject("assignment-expression-left-hand-side-leading-parenthesized-unit", {head, tail})
    }

    function createAssignExprLhsTrailingParenUnit(assignExprLhsTrailingParenUnit=req()) {
        const [head, tail] = [assignExprLhsTrailingParenUnit.head, assignExprLhsTrailingParenUnit.tail]
        return createObject("assignment-expression-left-hand-side-trailing-parenthesized-unit", {head, tail})
    }

    function createAssignExprLhsParens(assignExprLhsParens=req()) {
        let [head, tail] = getAstObjects(assignExprLhsParens)
        tail = getAstObjects(tail)
        return createObject("assignment-expression-left-hand-side-parenthesized", {head, tail})
    }

    function createAssignExprLhsBrackets(assignExprLhsBrackets=req()) {
        let [head, tail] = getAstObjects(assignExprLhsBrackets)
        tail = getAstObjects(tail)
        return createObject("assignment-expression-left-hand-side-bracketed", {head, tail})
    }

    function createAssignExprLhsBracketsLeadingBracketUnit(assignExprLhsBracketsLeadingBracketUnit=req()) {
        let [head, tail] = getAstObjects(assignExprLhsBracketsLeadingBracketUnit)
        tail = getAstObjects(tail)
        return createObject("assignment-expression-left-hand-side-bracketed-leading-bracket-unit", {head, tail})
    }

    function createAssignExprLhsBracketsTrailingBracketUnit(assignExprLhsBracketsTrailingBracketUnit=req()) {
        let [head, tail] = getAstObjects(assignExprLhsBracketsTrailingBracketUnit)
        tail = getAstObjects(tail)
        return createObject("assignment-expression-left-hand-side-bracketed-trailing-bracket-unit", {head, tail})
    }

    function createAssignExprLhsCurlies(assignExprLhsCurlies=req()) {
        return createObject("assignment-expression-left-hand-side-curly-braced", assignExprLhsCurlies)
    }

    function createAssignExprLhsCurlyBracedUnit(assignExprLhsCurlyBracedUnit=req()) {
        let [head, tail] = getAstObjects(assignExprLhsCurlies)
        tail = getAstObjects(tail)
        return createObject("assignment-expression-left-hand-side-curly-braced-unit", {head, tail})
    }

    function createAssignExprRhs(assignExprRhs=req()) {
        return createObject("assignment-expression-right-hand-side", assignExprRhs)
    }

    function createAccession(accession=req()) {
        return createObject("accession", accession)
    }

    function createAccessionWithSoftKeyword(accessionWithSoftKeyword=req()) {
        return createObject("accession-with-soft-keyword", accessionWithSoftKeyword)
    }

    function createPropertyDotAccess(propertyDotAccess=req()) {
        const [head, tail] = getAstObjects(propertyDotAccess)
        return createObject("property-dot-access", {head, tail})
    }

    function createDotAccessableProperty(dotAccessableProperty=req()) {
        return createObject("dot-accessable-property", dotAccessableProperty)
    }

    function createDotAccessedProperty(dotAccessedProperty=req()) {
        return createObject("dot-accessed-property", dotAccessedProperty)
    }

    function createPropertyDotAccessLiteral(propertyDotAccessLiteral=req()) {
        return createObject("property-dot-access-literal", propertyDotAccessLiteral)
    }

    function createPropertyBracketAccess(propertyBracketAccess=req()) {
        let [head, _, rest] = propertyBracketAccess
        let [genericType, tail] = getAstObjects(rest || [])
        genericType = genericType ? genericType : null
        return createObject("property-bracket-access", {head, genericType, tail})
    }

    function createPropertyBracketAccessWithSoftKeyword(propertyBracketAccessWithSoftKeyword=req()) {
        let [head, _, rest] = propertyBracketAccessWithSoftKeyword
        let [genericType, tail] = getAstObjects(rest)
        genericType = genericType ? genericType : null
        return createObject("property-bracket-access-with-soft-keyword", {head, genericType, tail})
    }

    function createPropertyBracketAccessLiteral(propertyBracketAccessLiteral=req()) {
        return createObject("property-bracket-access-literal", propertyBracketAccessLiteral)
    }

    function createUnitFunction(unitFunction=req()) {
        let [head, tail] = getAstObjects(unitFunction)
        if(head.type == "expression" && (tail = head))
            return createObject("unit-function", {head: null, tail})
        
        head = Array.isArray(head) ? getAstObjects(head) : head
        return createObject("unit-function", {head, tail})
    }

    function createFunctionArgList(functionArgList=req()) {
        let [leading, trailing] = functionArgList;
        [leading, trailing] = [getAstObjects(leading), getAstObjects(trailing || [])]
        const [head, tail] = [getAstObjects(leading), getAstObjects(trailing)]
        return createObject("function-argument-list", {head, tail})
    }

    function createFunctionArg(functionArg=req()) {
        return createObject("function-argument", functionArg)
    }

    function createParametricDataArgument(parametricDataArgument=req()) {
        const [head, tail] = parametricDataArgument
        return createObject("parametric-data-argument", {head, tail})
    }
    
    function createParametricProperty(parametricProperty=req()) {
        let [[head], _, tail] = parametricProperty
        return createObject("parametric-property", {head, tail})
    }

    function createRestParameter(restParameter=req()) {
        return createObject("rest-parameter", {value: restParameter})
    }
    
    function createAnonBlockFunction(anonBlockFunction=req()) {
        const value = getAstObjects(anonBlockFunction)
            .reduce((acc, curr) => {
                if(curr) {
                    if(Array.isArray(curr))
                        return {...acc, tail: getAstObjects(curr)}
                    else if(curr.type == "function-argument-list")
                        return {...acc, head: curr}
                    else if(curr.type == "function-special-args")
                        return {...acc, specialArgs: curr}
                }
            }, {});
        [value.head, value.specialArgs, value.tail] = [value.head, value.specialArgs, value.tail].map(x => x ? x : null)
        value.tail = value.tail ? value.tail : []
        return createObject("anon-block-function", value)
    }

    function createFunctionSpecialArgs(functionSpecialArgs=req()) {
        let [head, tail] = functionSpecialArgs
        tail = tail ? getAstObjects(tail) : []
        return createObject("function-special-arguments", {head, tail})
    }

    function createAnonInlineFunction(anonInlineFunction=req()) {
        const value = getAstObjects(anonInlineFunction)
            .reduce((acc, curr) => {
                if(curr) {
                    if(curr.type == "function-argument-list")
                        return {...acc, head: curr}
                    else if(curr.type == "function-special-arguments")
                        return {...acc, specialArgs: curr}
                    else
                        return {...acc, tail: curr}
                }
            }, {});
        [value.head, value.specialArgs, value.tail] = [value.head, value.specialArgs, value.tail].map(x => x ? x : null)
        value.tail = value.tail ? value.tail : []
        return createObject("anonymous-inline-function", value)
    }

    function createAnonFunction(anonFunction) {
        return createObject("anonymous-function", {value: anonFunction})
    }

    function createFunctionCall(functionCall=req()) {
        let [head, tail] = functionCall
        tail = getAstObjects(tail)
        return createObject("function-call", {head, tail})
    }

    function createGenericTypeArguments(genericTypeArguments=req()) {
        const {head, tail} = genericTypeArguments
        return createObject("generic-type-arguments", {head, tail})
    }

    function createGenericTypeArgList(genericTypeArgList=req()) {
        let [head, tail] = genericTypeArgList
        tail = getAstObjects(tail)
        return createObject("generic-type-argument-list", {head, tail})
    }

    function createGenericTypeArg(genericTypeArg=req()) {
        let [head, tail] = genericTypeArg
        tail = getAstObjects(tail)
        return createObject("generic-type-argument", {head, tail})
    }

    function createGenericTypePair(genericTypePair=req()) {
        let [head, tail] = genericTypePair
        return createObject("generic-type-pair", {head, tail})
    }

    function createFunctionCallWithSoftKeyword(functionCallWithSoftKeyword=req()) {
        let [head, tail] = functionCallWithSoftKeyword
        tail = getAstObjects(tail)
        return createObject("function-call", {head, tail})
    }

    function createFunctionCaller(functionCaller=req()) {
        return createObject("function-caller", {value: functionCaller})
    }

    function createFunctionCallArgs(functionCallArgs=req()) {
        let [head, typeArgs, ...tail] = functionCallArgs
        head = getAstObjects(head)
        tail = getAstObjects(tail)
        return createObject("function-call-arguments", {head, typeArgs, tail})
    }

    function createBracketedCallArgs(bracketedCallArgs=req()) {
        let [head, _, tail] = bracketedCallArgs
        tail = tail ? tail : []
        return createObject("bracketed-call-arguments", {head, tail})
    }

    function createFunctionCallArgList(functionCallArgList=req()) {
        if(!Array.isArray(functionCallArgList))
            return createObject("function-call-argument-list", {head: null, tail: functionCallArgList})
        let [head, _, tail] = functionCallArgList
        tail = tail ? tail : []
        return createObject("function-call-argument-list", {head, tail})
    }

    function createFunctionCallLeadingArg(functionCallLeadingArg=req()) {
        let [head, tail] = functionCallLeadingArg
        tail = tail ? getAstObjects(tail) : []
        return createObject("function-call-leading-argument", {head, tail})
    }

    function createFunctionCallTrailingArg(functionCallTrailingArg=req()) {
        let [head, tail] = getAstObjects(functionCallTrailingArg)
        tail = tail ? getAstObjects(tail) : []
        return createObject("function-call-trailing-argument", {head, tail})
    }

    function createFunctionCallPairedArg(functionCallPairedArg=req()) {
        let [head, tail] = functionCallPairedArg
        tail = getAstObjects(tail)
        return createObject("function-call-paired-argument", {head, tail})
    }

    function createFunctionCallPair(functionCallPair=req()) {
        let [head, tail] = functionCallPair
        return createObject("function-call-pair", {head, tail})
    }

    function createDoExpr(doExpr=req()) {
        return createObject("do-expression", {value: doExpr})
    }

    function createMacroInvocation(macroInvocation=req()) {
        return createObject("macro-invocation", {value: macroInvocation})
    }

    function createMacroInlineInvocation(macroInlineInvocation=req()) {
        return createObject("macro-inline-invocation", {value: macroInlineInvocation})
    }

    function createMacroExpression(macroExpression=req()) {
        return createObject("macro-expression", {value: macroExpression})
    }

    function createMacroExpressionNoArg(macroExpressionNoArg=req()) {
        let [head, typeArgs, tail] = macroExpressionNoArg
        typeArgs = typeArgs ? getAstObjects(typeArgs) : null
        return createObject("macro-expression-with-no-argument", {head, typeArgs, tail})
    }

    function createMacroExpressionNoArgInvoker(macroExpressionNoArgInvoker=req()) {
        return createObject("macro-expression-with-no-argument-invoker", {value: macroExpressionNoArgInvoker})
    }

    function createMacroExpressionWithArg(macroExpressionWithArg=req()) {
        let [head, typeArgs, macroArgs, tail] = macroExpressionWithArg;
        typeArgs = typeArgs ? getAstObjects(typeArgs)[0] : null
        return createObject("macro-expression-with-argument", {head, typeArgs, macroArgs, tail})
    }

    function createMacroExpressionWithArgInvoker(macroExpressionWithArgInvoker=req()) {
        return createObject("macro-expression-with-argument-invoker", {value: macroExpressionWithArgInvoker})
    }

    function createMacroExpressionArgs(macroExpressionArgs=req()) {
        return createObject("macro-expression-arguments", {value: macroExpressionArgs})
    }

    function createMacroStatement(macroStatement=req()) {
        return createObject("macro-statement", {value: macroStatement})
    }

    function createMacroStatementNoArg(macroExpressionNoArg=req()) {
        let [head, typeArgs, tail] = macroExpressionNoArg;
        typeArgs = typeArgs ? getAstObjects(typeArgs)[0] : null
        return createObject("macro-expression-with-no-argument", {head, typeArgs, tail})
    }

    function createMacroStatementWithArg(macroExpressionWithArg=req()) {
        let [head, typeArgs, macroArgs, tail] = macroExpressionWithArg;
        typeArgs = typeArgs ? getAstObjects(typeArgs)[0] : null
        console.log({head, typeArgs, macroArgs, tail})
        return createObject("macro-expression-with-argument", {head, typeArgs, macroArgs, tail})
    }

    function createMacroBlockInvocation(macroBlockInvocation=req()) {
        let [head, tail] = macroBlockInvocation
        tail = tail ? getAstObjects(tail, 2) : []
        return createObject("macro-block-invocation", {head, tail})
    }

    function createMetaDataInterpolation(metaDataInterpolation=req()) {
        return createObject("meta-data-interpolation", {value: metaDataInterpolation})
    }

    function createOperatorRef(operatorRef=req()) {
        return createObject("operator-reference", {value: operatorRef})
    }

    function createAsExpr(asExpr=req()) {
        let [head, tail] = asExpr
        head = Array.isArray(head) ? getAstObjects(head)[0] : head
        return createObject("as-expression", {head, tail})
    }

    function createPipelineConstruct(pipelineConstruct=req()) {
        return createObject("pipeline-construct", pipelineConstruct)
    }

    function createPointFreePipeline(pointFreePipeline=req()) {
        let [head, tail, lst] = pointFreePipeline
        tail = tail.flat()
        if(lst) tail = [...tail, lst]
        return createObject("point-free-pipeline", {head, tail})
    }

    function createPointedPipeline(pointedPipeline=req()) {
        let [head, tail, lst] = pointedPipeline
        tail = tail.flatMap(x => getAstObjects(x, 3))
        if(lst) tail = [...tail, lst]
        return createObject("pointed-pipeline", {head, tail})
    }

    function createPipelineOperator(pipelineOperator=req()) {
        return createObject("pipeline-operator", {value: pipelineOperator})
    }

    function createObjectCascadeNotation(objectCascadeNotation=req()) {
        let [head, ...tail] = getAstObjects(objectCascadeNotation)
        tail = getAstObjects(tail, 2)
        return createObject("object-cascade-notation", arguments[0])
    }

    function createFunctionCallExternCallback(functionCallExternCallback=req()) {
        
        return createObject("function-call-external-callback", arguments[0])
    }

    function createFunctionCallExternCallbackReciever(functionCallExternCallbackReciever=req()) {

        return createObject("function-call-external-callback-reciever", arguments[0])
    }

    function createFunctionCallExternCallerArgs(functionCallExternCallerArgs=req()) {

        return createObject("function-call-external-caller-arguments", arguments[0])
    }

    function createFunctionCallExternCallerArgList(functionCallExternCallerArgList=req()) {

        return createObject("function-call-external-caller-argument-list", arguments[0])
    }

    function createFunctionCallExternCallerLeadingArg(functionCallExternCallerLeadingArg=req()) {

        return createObject("function-call-external-caller-leading-argument", arguments[0])
    }

    function createFunctionCallExternCallerTrailingArg(functionCallExternCallerTrailingArg=req()) {

        return createObject("function-call-external-caller-trailing-argument", arguments[0])
    }

    function createFunctionCallExternCallerPairedArg(functionCallExternCallerPairedArg=req()) {

        return createObject("function-call-external-caller-paired-argument", arguments[0])
    }

    function createFunctionCallExternCallerPair(functionCallExternCallerPair=req()) {

        return createObject("function-call-external-caller-pair", arguments[0])
    }

    function createFunctionCallExternCallerArg(functionCallExternCallerArg=req()) {
        console.log(functionCallExternCallerArg)
        return createObject("function-call-external-caller-argument", arguments[0])
    }

    function createFunctionCallExternCaller(functionCallExternCaller=req()) {
        return createObject("function-call-external-caller", {value: functionCallExternCaller})
    }

    function createOperator(_operator=req()) {

        return createObject("operator", arguments[0])
    }

    function createInfixOperation(infixOperation=req()) {

        return createObject("infix-operation", arguments[0])
    }

    function createInfixOperator(infixOperator=req()) {

        return createObject("infix-operator", arguments[0])
    }

    function createCustomInfixOperator(customInfixOperator=req()) {

        return createObject("custom-infix-operator", arguments[0])
    }

    function createCustomInfixOperatorChar(customInfixOperatorChar=req()) {

        return createObject("custom-infix-operator-character", arguments[0])
    }

    function createInfixVerbalOperator(infixVerbalOperator=req()) {

        return createObject("infix-verbal-operator", arguments[0])
    }

    function createInfixFuntionCall(infixFuntionCall=req()) {

        return createObject("infix-funtion-call", arguments[0])
    }

    function createPrefixOperation(prefixOperation=req()) {

        return createObject("prefix-operation", arguments[0])
    }

    function createPrefixOperator(prefixOperator=req()) {

        return createObject("prefix-operator", arguments[0])
    }

    function createPrefixVerbalOperator(prefixVerbalOperator=req()) {

        return createObject("prefix-verbal-operator", arguments[0])
    }

    function createArithmeticOperator(arithmeticOperator=req()) {

        return createObject("arithmetic-operator", arguments[0])
    }

    function createRelationalOperator(relationalOperator=req()) {

        return createObject("relational-operator", arguments[0])
    }

    function createLogicalOperator(logicalOperator=req()) {

        return createObject("logical-operator", arguments[0])
    }

    function createCompoundAssignOperator(compoundAssignOperator=req()) {

        return createObject("compound-assignment-operator", arguments[0])
    }

    function createIterableOperator(iterableOperator=req()) {

        return createObject("iterable-operator", arguments[0])
    }

    function createIterableAssignOperator(iterableAssignOperator=req()) {

        return createObject("iterable-assignment-operator", arguments[0])
    }

    function createCollectionOperator(collectionOperator=req()) {

        return createObject("collection-operator", arguments[0])
    }

    function createLexicalOperator(lexicalOperator=req()) {

        return createObject("lexical-operator", arguments[0])
    }

    function createStructuralOperator(structuralOperator=req()) {

        return createObject("structural-operator", arguments[0])
    }

    function createDelimiterOperator(delimiterOperator=req()) {

        return createObject("delimiter-operator", arguments[0])
    }

    function createMiscellanyOperator(miscellanyOperator=req()) {

        return createObject("miscellany-operator", arguments[0])
    }

    function createDelimiter(delimiter=req()) {

        return createObject("delimiter", arguments[0])
    }

    function createStatement(statement=req()) {

        return createObject("statement", arguments[0])
    }

    function createAssignStatement(assignStatement=req()) {

        return createObject("assign-statement", arguments[0])
    }

    function createSingleAssignStmt(singleAssignStmt=req()) {

        return createObject("single-assignment-statement", arguments[0])
    }

    function createAssignStmtLhs(assignStmtLhs=req()) {

        return createObject("assign-statement-left-hand-side", arguments[0])
    }

    function createAssignStmtRhs(assignStmtRhs=req()) {

        return createObject("assign-statement-right-hand-side", arguments[0])
    }

    function createIfConditional(ifConditional=req()) {

        return createObject("if-conditional", arguments[0])
    }

    function createIfElseExpr(ifElseExpr=req()) {

        return createObject("if-else-expression", arguments[0])
    }

    function createIfCaseConditional(ifCaseConditional=req()) {

        return createObject("if-case-conditional", arguments[0])
    }

    function createCaseCondition(caseCondition=req()) {

        return createObject("case-condition", arguments[0])
    }

    function createCaseMatchConditions(caseMatchConditions=req()) {

        return createObject("case-match-conditions", arguments[0])
    }

    function createCaseMatchFailExpr(caseMatchFailExpr=req()) {

        return createObject("case-match-fail-expression", arguments[0])
    }

    function createIfBlockExpr(ifBlockExpr=req()) {

        return createObject("if-block-expression", arguments[0])
    }

    function createIfInlineExpr(ifInlineExpr=req()) {

        return createObject("if-inline-expression", arguments[0])
    }

    function createIfBlock(ifBlock=req()) {

        return createObject("if-block", arguments[0])
    }

    function createElseIfBlock(elseIfBlock=req()) {

        return createObject("else-if-block", arguments[0])
    }

    function createElseBlock(elseBlock=req()) {

        return createObject("else-block", arguments[0])
    }

    function createIfInline(ifInline=req()) {

        return createObject("if-inline", arguments[0])
    }

    function createElseIfInline(elseIfInline=req()) {

        return createObject("else-if-inline", arguments[0])
    }

    function createElseIfOptionalInline(elseIfOptionalInline=req()) {

        return createObject("else-if-optional-inline", arguments[0])
    }

    function createElseInline(elseInline=req()) {

        return createObject("else-inline", arguments[0])
    }

    function createForIterator(forIterator=req()) {

        return createObject("for-iterator", arguments[0])
    }

    function createBlockExpr(forBlockExpr=req()) {

        return createObject("for-block-expression", arguments[0])
    }

    function createForInlineExpr(forInlineExpr=req()) {

        return createObject("for-inline-expression", arguments[0])
    }

    function createForExpr(forExpr=req()) {

        return createObject("for-expression", arguments[0])
    }

    function createForBlock(forBlock=req()) {

        return createObject("for-block", arguments[0])
    }

    function createForInline(forInline=req()) {

        return createObject("for-inline", arguments[0])
    }

    function createForLoopHead(forLoopHead=req()) {

        return createObject("for-loop-head", arguments[0])
    }

    function createForCounterLoopHeadUnit(forCounterLoopHeadUnit=req()) {

        return createObject("for-counter-loop-head-unit", arguments[0])
    }

    function createForInLoopHeadUnit(forInLoopHeadUnit=req()) {

        return createObject("for-in-loop-head-unit", arguments[0])
    }

    function createDoneInline(doneInline=req()) {

        return createObject("done-inline", arguments[0])
    }

    function createDoneBlock(doneBlock=req()) {

        return createObject("done-block", arguments[0])
    }

    function createTryErrorHandleConstruct(tryErrorHandleConstruct=req()) {

        return createObject("try-error-handle-construct", arguments[0])
    }

    function createTryCatchExpr(tryCatchExpr=req()) {

        return createObject("try-catch-expression", arguments[0])
    }

    function createTryBlockExpr(tryBlockExpr=req()) {

        return createObject("try-block-expression", arguments[0])
    }

    function createTryInlineExpr(tryInlineExpr=req()) {

        return createObject("try-inline-expression", arguments[0])
    }

    function createTryBlock(tryBlock=req()) {

        return createObject("try-block", arguments[0])
    }

    function createTryCatchInline(tryCatchInline=req()) {

        return createObject("try-catch-inline", arguments[0])
    }

    function createCatchInline(catchInline=req()) {

        return createObject("catch-inline", arguments[0])
    }

    function createCatchBlock(catchBlock=req()) {

        return createObject("catch-block", arguments[0])
    }

    function createNamedFunction(namedFunction=req()) {

        return createObject("named-function", arguments[0])
    }

    function createNamedFunctionBlock(namedFunctionBlock=req()) {

        return createObject("named-function-block", arguments[0])
    }

    function createNamedFunctionInline(namedFunctionInline=req()) {

        return createObject("named-function-inline", arguments[0])
    }

    function createReturnStatement(functionReturnStatement=req()) {

        return createObject("function-return-statement", arguments[0])
    }

    function createBreakStatement(breakStatement=req()) {

        return createObject("break-statement", arguments[0])
    }

    function createContinueStatement(continueStatement=req()) {

        return createObject("continue-statement", arguments[0])
    }

    function createLabelStatement(labelStatement=req()) {

        return createObject("label-statement", arguments[0])
    }

    function createImportStatement(importStatement=req()) {

        return createObject("import-statement", arguments[0])
    }

    function createImportUnit(importUnit=req()) {

        return createObject("import-unit", arguments[0])
    }

    function createPackageImport(packageImport=req()) {

        return createObject("package-import", arguments[0])
    }

    function createUseStatement(useStatement=req()) {

        return createObject("use-statement", arguments[0])
    }

    function createUseNotStatement(useNotStatement=req()) {

        return createObject("use-not-statement", arguments[0])
    }

    function createTypeExpr(typeExpr=req()) {

        return createObject("type-expression", arguments[0])
    }

    function createRawExpr(rawExpr=req()) {

        return createObject("raw-expression", arguments[0])
    }

    function createRawStmt(rawStmt=req()) {

        return createObject("raw-statement", arguments[0])
    }

    function createTypeAssertion(typeAssertion=req()) {

        return createObject("type-assertion", arguments[0])
    }

    function createTypeAssertionLhs(typeAssertionLhs=req()) {

        return createObject("type-assertion-left-hand-side", arguments[0])
    }

    function createTypeAssertionRhs(typeAssertionRhs=req()) {

        return createObject("type-assertion-right-hand-side", arguments[0])
    }

    function createGenericTypes(genericTypes=req()) {

        return createObject("generic-types", arguments[0])
    }

    function createGenericTypeUnit(genericTypeUnit=req()) {

        return createObject("generic-type-unit", arguments[0])
    }

    function createTypeLiteral(typeLiteral=req()) {

        return createObject("type-literal", arguments[0])
    }

    function createCompositType(compositType=req()) {

        return createObject("composit-type", arguments[0])
    }

    function createIdentityType(identityType=req()) {

        return createObject("identity-type", arguments[0])
    }

    function createParametricType(parametricType=req()) {

        return createObject("parametric-type", arguments[0])
    }

    function createParametricTypeArgList(parametricTypeArgList=req()) {

        return createObject("parametric-type-argument-list", arguments[0])
    }

    function createParametricTypeLeadingArg(parametricTypeLeadingArg=req()) {

        return createObject("parametric-type-leading-argument", arguments[0])
    }

    function createParametricTypeTrailingArg(parametricTypeTrailingArg=req()) {

        return createObject("parametric-type-trailing-argument", arguments[0])
    }

    function createParametricTypePairedArg(parametricTypePairedArg=req()) {

        return createObject("parametric-type-paired-argument", arguments[0])
    }

    function createParametricTypeArg(parametricTypeArg=req()) {

        return createObject("parametric-type-argument", arguments[0])
    }

    function createTypePair(typePair=req()) {

        return createObject("type-pair", arguments[0])
    }

    function createTypeDeconstructTuple(typeDeconstructTuple=req()) {

        return createObject("type-deconstruct-tuple", arguments[0])
    }

    function createTypeUnitFunction(typeUnitFunction=req()) {

        return createObject("type-unit-function", arguments[0])
    }

    function createTypeUnitFunctionArgList(typeUnitFunctionArgList=req()) {

        return createObject("type-unit-function-argument-list", arguments[0])
    }

    function createTypeUnitFunctionArg(typeUnitFunctionArg=req()) {

        return createObject("type-unit-function-argument", arguments[0])
    }

    function createTypeOperation(typeOperation=req()) {

        return createObject("type-operation", arguments[0])
    }

    function createTypeInfixOperation(typeInfixOperation=req()) {

        return createObject("type-infix-operation", arguments[0])
    }

    function createTypeInfixOperand(typeInfixOperand=req()) {

        return createObject("type-infix-operand", arguments[0])
    }

    function createTypeInfixOperator(typeInfixOperator=req()) {

        return createObject("type-infix-operator", arguments[0])
    }

    function createTypePrefixOperation(typePrefixOperation=req()) {

        return createObject("type-prefix-operation", arguments[0])
    }

    function createTypePrefixOperation(typePrefixOperator=req()) {

        return createObject("type-prefix-operator", arguments[0])
    }

    function createTypePostfixOperation(typePostfixOperation=req()) {

        return createObject("type-postfix-operation", arguments[0])
    }

    function createTypePostfixOperator(typePostfixOperator=req()) {

        return createObject("type-postfix-operator", arguments[0])
    }

    function createTypeSign(typeSign=req()) {

        return createObject("type-signature", arguments[0])
    }

    function createNamedTypeSign(namedTypeSign=req()) {

        return createObject("named-type-signature", arguments[0])
    }

    function createNamedTypeSignLhs(namedTypeSignLhs=req()) {

        return createObject("named-type-signature-left-hand-side", arguments[0])
    }

    function createNamedTypeSignRhs(namedTypeSignRhs=req()) {

        return createObject("named-type-signature-right-hand-side", arguments[0])
    }

    function createAnonTypeSign(anonTypeSign=req()) {

        return createObject("anonymous-type-signature", arguments[0])
    }

    function createTypeDeclaration(typeDeclaration=req()) {

        return createObject("type-declaration", arguments[0])
    }

    function createDataDeclaration(dataDeclaration=req()) {

        return createObject("data-declaration", arguments[0])
    }

    function createTypeConstraint(typeConstraint=req()) {

        return createObject("type-constraint", arguments[0])
    }

    function createVariableSign(variableSign=req()) {

        return createObject("variable-signature", arguments[0])
    }

    function createValueSign(valueSign=req()) {

        return createObject("value-signature", arguments[0])
    }

    function createInTypeSignMacro(inTypeSignMacro=req()) {

        return createObject("in-type-signature-macro", arguments[0])
    }

    function createTypeSignAssignExprs(typeSignAssignExprs=req()) {

        return createObject("type-signature-assignment-expressions", arguments[0])
    }

    function createFunctionSign(functionSign=req()) {

        return createObject("function-signature", arguments[0])
    }

    function createFunctionSignBlockBody(functionSignBlockBody=req()) {

        return createObject("function-signature-block-body", arguments[0])
    }

    function createFunctionSignInlineBody(functionSignInlineBody=req()) {

        return createObject("function-signature-inline-body", arguments[0])
    }

}

Program "program"
    = program: (@(_ @BlockUnits)* _)
    {
        return createProgram(program)
    }

no_id_part "no-identifier-part"
	= !([_a-zA-Z!][_a-zA-Z0-9]* "!"?)

// keywords

DO = kw: "do" no_id_part

DONE = kw: "done" no_id_part

END = kw: "end" no_id_part

FUN = kw: "fun" no_id_part

VAR = kw: "var" no_id_part

VAL = kw: "val" no_id_part

TYPE = kw: "type" no_id_part

DATA = kw: "data" no_id_part

EXPR = kw: "expr" no_id_part

REF = kw: "ref" no_id_part

STMT = kw: "stmt" no_id_part

PKG = kw: "pkg" no_id_part

STATIC = kw: "static" no_id_part

RETURN = kw: "return" no_id_part

YIELD = kw: "yield" no_id_part

BREAK = kw: "break" no_id_part

CONTINUE = kw: "continue" no_id_part

CASE = kw: "case" no_id_part

IF = kw: "if" no_id_part

ELSE_IF = kw: "elseif" no_id_part

ELSE = kw: "else" no_id_part

FOR = kw: "for" no_id_part

TRY = kw: "try" no_id_part

CATCH = kw: "catch" no_id_part

THROW = kw: "throw" no_id_part

IN = kw: "in" no_id_part

NOT_IN = kw: "in!" no_id_part

SELF = kw: "self" no_id_part

META = kw: "meta" no_id_part

PAYLOAD = kw: "payload" no_id_part

OF = kw: "of" no_id_part

USE = kw: "use" no_id_part

USE_NOT = kw: "use!" no_id_part

IMPORT = kw: "import" no_id_part

EXPORT = kw: "export" no_id_part

FROM = kw: "from" no_id_part

GETTER = kw: "getter" no_id_part

SETTER = kw: "setter" no_id_part

TO = kw: "to" no_id_part

IS = kw: "is" no_id_part

IS_NOT = kw: "is!" no_id_part

AS = kw: "as" no_id_part

AWAIT = kw: "await" no_id_part

Keyword "keyword"
    = keyword: $(DONE
    / DO
    / END
    / FUN
    / VAR
    / VAL
    / TYPE
    / REF
    / RETURN
    / BREAK
    / CONTINUE
    / CASE
    / IF
    / ELSE_IF
    / ELSE
    / FOR
    / TRY 
    / CATCH
    / THROW
    / NOT_IN
    / IN
    / TO
    / OF
    / USE
    / USE_NOT
    / IMPORT
    / EXPORT
    / FROM
    / IS_NOT
    / IS
    / AS
    / AWAIT)
    {
        return createKeyWord(keyword)
    }

SoftKeyword "soft-keyword"
    = softKeyword: (DATA / EXPR / PKG / STMT / SELF / STATIC / YIELD / META / PAYLOAD / GETTER / SETTER)
    {
        return createSoftKeyword(softKeyword)
    }

null = "0"+

BlockUnits "block-units"
    = blockUnits: (@Statement / @Expression __ Delimiter)
    {
        return createBlockUnits(blockUnits)
    }

Expression "expression"
    = expression: (InfixOperation / PrefixOperation / Term / "(" _ Expression _ ")")
    {
        return createExpression(expression || [])
    }

Term "term"
    = term: (AssignExpr
    / ObjectCascadeNotation
    / PipelineConstruct
    / MacroExpression
    / IfCaseConditional
    / IfElseExpr
    / ForExpr
    / TryCatchExpr
    / TypeExpr
    / RawExpr
    / RawStmt
    / TypeAssertion
    / MacroInvocation
    / UnitFunction
    / StringFragment
    / AnonFunction
    / DoExpr
    / FunctionCallExternCallback
    / Literal)
    {
        return createTerm(term)
    }

Literal "literal"
    = literal: (Accession
    / TaggedString
    / TaggedNumber
    / None
    / Boolean
    / Number
    / ImplicitMultiplication
    / String
    / Symbol
    / Char
    / Identifier
    / MetaDataInterpolation
    / ParenthesesEnclosed
    / SquareBracketEnclosed
    / CurlyBraceEnclosed
    / OperatorRef)
    {
        return createLiteral(literal)
    }

Block "block"
    = block: (NamedFunction / IfConditional / ForIterator / TryErrorHandleConstruct)
    {
        return createBlock(block)
    }

WhiteSpace "whitespace"
    = whitespace: $("\t"
    / "\v"
    / "\f"
    / " "
    / "\u00A0"
    / "\uFEFF")

Newline "newline"
    = newline: $("\r\n" / "\n")

EOF "end-of-file" 
    = eof: (!.)
    
_ "whitespace-or-newline"
    = whitespaceOrNewline: $(WhiteSpace / Newline / MultilineComment / SinglelineComment)*

__ "whitespace"
    = whitespace: $(WhiteSpace / MultilineComment / SinglelineComment)*

SinglelineComment "singleline-comment"
    = singlelineComment: $("#" (!(Newline / EOF) .)*)
    {
        return createSinglelineComment(singlelineComment)
    }

MultilineComment "multiline-comment"
    = multilineComment: $("#=" (MultilineComment / (!"=#" .))* "=#")
    {
        return createMultilineComment(multilineComment)
    }

Comment "comment"
    = comment: (MultilineComment / SinglelineComment)
    {
        return createComment(comment)
    }

NotSoftKeywordId "not-soft-keyword-identifier"
    = notSoftKeywordId: $(!SoftKeyword Identifier)
    {
        return createNotSoftKeywordId(notSoftKeywordId)
    }

Identifier "identifier"
    = identifier: $(!ReservedWord identifier: (IdentifierStart IdentifierMiddle* IdentifierEnd?))
    {
        return createIdentifier(identifier)
    }

IdentifierStart "identifier-start"
    = $[_a-zA-Z]

IdentifierMiddle "identifier-middle" 
    = $[_a-zA-Z0-9]

IdentifierEnd "identifier-end"
    = $("!" "'"*)

ReservedIdentifier "reserved-identifier"
    = reservedIdentifier: $("$" Identifier)
    {
        return createReservedIdentifier(reservedIdentifier)
    }

ReservedWord "reserved-word"
    = reservedWord: (Keyword / Infinites / NAN / Infinity / Boolean / None)
    {
        return createReservedWord(reservedWord)
    }

None
    = none: "None" no_id_part

Boolean
    = bool: $("True" / "False") no_id_part
    {
        return createBoolean(bool)
    }

NAN "NaN"
    = nan: "NaN" no_id_part

Infinites "Infinites"
    = infinites: "Infinites" no_id_part

Infinity "Infinity"
    = infinity: (Sign? "Infinity" no_id_part)

Sign "sign" = ("-" / "+")

Number "number"
	= number: (NAN / Infinites / Infinity / Binary / Octal / Hex / Float / Integer)
    {
        return createNumber(number)
    }

Integer "integer"
	= integer: $(Sign? UnsignedInteger)
    {
        return createInteger(integer)
    }

UnsignedInteger "unsigned-integer"
    = unsignedInteger: $(DeciamlDigit+ ("_" DeciamlDigit+)*)

DeciamlDigit "decimal-digit"
    = decimalDigit: $[0-9]

Float "float"
	= float: $(Integer "." UnsignedInteger)
    {
        return createFloat(float)
    }
    
Binary "binary"
	= binary:(@$(Sign? BinaryDigit+) "!b")
    {
        return createBinary(binary)
    }

BinaryDigit "binary-digit"
    = binaryDigit: $("0" / "1")

Octal "octal"
	= octal: (@$(Sign? OctalDigit+) "!o")
    {
        return createOctal(octal)
    }

OctalDigit "octal-digit"
    = octalDigit: [0-7]

Hex "hex"
	= hex: (@$(Sign? HexDigit+) "!x")
    {
        return createHex(hex)
    }

HexDigit "hex-digit"
    = hexDigit: [0-9a-fA-F]

CollectionStart "collection-start"
    = collectionStart: ("(" / "[" / "{")

ImplicitMultiplication "implicit-multiplication"
	= implicitMultip: (ImplicitMultipWithExpr / ImplicitMultipWithIdent)
    {
        return createImplicitMultiplication(implicitMultip)
    }

ImplicitMultipWithExpr "implicit-multiplication-with-expression"
    = implicitMultipWithExpr: ((@(Float / Integer) __ @NotSoftKeywordId) __  &CollectionStart @$Expression)
    {
        return createImplicitMultipWithExpr(implicitMultipWithExpr)
    }

ImplicitMultipWithIdent "implicit-multiplication-with-identifier"
    = implicitMultipWithIdent: (@(Float / Integer) __ @NotSoftKeywordId !("!" NotSoftKeywordId))
    {
        return createImplicitMultipWithIdent(implicitMultipWithIdent)
    }

TaggedNumber "tagged-number"
	= taggedNumber: (@("(" _ @Expression _ ")" / Float / Integer) __ "!" __ @NotSoftKeywordId)
    {
        return createTaggedNumber(taggedNumber)
    }

Char "char"
	= char: ("\\" @SymbolicChar / "'" @(QuotedChar*) "'" / HexChar)
    {
        return createChar(char)
    }

SymbolicChar "symbolic-char"
    = symbolicChar: $[_a-zA-Z0-9!]
    {
        return createSymbolicChar(symbolicChar)
    }

QuotedChar "quoted-char"
    = quotedChar: $("\\'"/ [^'])
    {
        return createQuotedChar(quotedChar)
    }

HexChar "hex-char"
    = hexChar: (@$HexDigit+ "!cx")
    {
        return createHexChar(hexChar)
    }

MultiQuotedString "multi-quoted-string"
	= multiQuotedString: ('"""' @$InTriDoubleQuotedChar '"""')
    {
        return createMultiQuotedString(multiQuotedString)
    }

InTriDoubleQuotedChar "in-triple-double-quoted-char"
    = inTriDoubleQuotedChar: $('\\' . / !'"""' [^\\"])+

String "string"
	= string: (MultiQuotedString / StringLiteral)
    {
        return createString(string)
    }

StringLiteral "string-literal"
    = stringLiteral: ('"' @$('\\"'/ [^"])* '"')

Symbol "symbol"
	= symbol: ('\\' @$(IdentifierStart IdentifierMiddle+ IdentifierEnd?))
    {
        return createSymbol(symbol)
    }

StringFragment
	= stringFragment: ((StringLiteral / Symbol) (__ (StringLiteral / Symbol))+)
    {
        return createStringFragment(stringFragment)
    }

DoubleQuotedFstringChar "double-quoted-formatted-string-char"
	= doubleQuotedFstringChar: $('\\' . / [^"\\${])+

TriDoubleQuotedFstringChar "triple-quoted-formatted-string-char"
    = triDoubleQuotedFstringChar: $('\\' . / !'"""' [^\\${])+

InStrIdentifier "in-string-identifier"
	= inStrIdentifier: ("$" @Identifier)

InStringExpr "in-string-expression"
	= inStringExpr: ("{" _ @(Pair / Expression) @(_ "," _ (Pair / Expression))* _ "}")
    {
        return createInStringExpr(inStringExpr)
    }

DoubleQuotedFstringUnit "double-quoted-formatted-string-unit"
    = doubleQuotedFstringUnit: (InStrIdentifier / InStringExpr / DoubleQuotedFstringChar)
    {
        return createDoubleQuotedFstringUnit(doubleQuotedFstringUnit)
    }

TriDoubleQuotedFstringUnit "triple-quoted-formatted-string-unit"
    = triDoubleQuotedFstringUnit: (InStrIdentifier / InStringExpr / TriDoubleQuotedFstringChar)
    {
        return createTriDoubleQuotedFstringUnit(triDoubleQuotedFstringUnit)
    }

DoubleQuotedFstring "double-quoted-formatted-string"
	= doubleQuotedFstring: ('"' @DoubleQuotedFstringUnit* '"')
    {
        return createDoubleQuotedFstring(doubleQuotedFstring)
    }

MultiQuotedFstring "multi-quoted-formatted-string"
	= multiQuotedFstring: ('"""' TriDoubleQuotedFstringUnit* '"""')
    {
        return createMultiQuotedFstring(multiQuotedFstring)
    }

TaggedString "tagged-string"
	= taggedString: (NotSoftKeywordId (__ MultiQuotedFstring __ / (__ (DoubleQuotedFstring / Symbol) __)+))
    {
        return createTaggedString(taggedString)
    }

TrailingSigl "trailing-sigl"
    = trailingSigl: ("," / ";")

CollectionTrails "collecton-trails"
    = collectionTrails: !("," _ ";") (!(TrailingSigl _ Expression) _ TrailingSigl)

ParenthesesEnclosed "parentheses-enclosed"
	= parenthesesEnclosed: ("(" _ (LeadingParenUnit (_ TrailingParenUnit)* / PairedParanUnit (_ TrailingParenUnit)*) _ ")")
    {
        return createParenthesesEnclosed(parenthesesEnclosed)
    }

LeadingParenUnit "leading-parenthesized-unit"
    = leadingParenUnit: (Expression (_ "," _ Expression)+ (_ CollectionTrails)?
    / Expression _ TrailingSigl)
    {
        return createLeadingParenUnit(leadingParenUnit)
    }

TrailingParenUnit "trailing-parenthesized-unit"
    = trailingParenUnit: (";" _ @PairedParanUnit (_ CollectionTrails)?)
    {
        return createTrailingParenUnit(trailingParenUnit)
    }

PairedParanUnit "paired-parenthesized-unit"
    = pairedParanUnit: (Pair (_ "," _ Pair)* (_ CollectionTrails)?)
    {
        return createPairedParanUnit(pairedParanUnit)
    }

SquareBracketEnclosed "square-bracket-enclosed"
	= squareBracketEnclosed: ("[" _ (LeadingBracketUnit? (_ TrailingBracketUnit)*) _ "]" "!"?)
    {
        return createSquareBracketEnclosed(squareBracketEnclosed)
    }

LeadingBracketUnit "leading-bracketted-unit"
    = leadingBracketUnit: (Expression (_ "," _ Expression)* (_ CollectionTrails)?)
    {
        return createLeadingBracketUnit(leadingBracketUnit)
    }

TrailingBracketUnit "trailing-bracketted-unit"
    = trailingBracketUnit: (";" _ Expression (_ "," _ Expression)* (_ CollectionTrails)?)
    {
        return createTrailingBracketUnit(trailingBracketUnit)
    }

Pair "pair"
	= pair: (@Expression _ ":"  _ @Expression)
    {
        return createPair(pair)
    }

CurlyBraceEnclosed "curly-brace-enclosed"
	= curlyBraceEnclosed: ("{" _ @CurlyBracedUnit? _ "}" "!"?)
    {
        return createCurlyBraceEnclosed(curlyBraceEnclosed)
    }

CurlyBracedUnit "curly-braced-unit"
	= curlyBracedUnit: ((_ CurlyBracedBlockUnit)+ / CurlyBracedInlineUnit)
    {
        return createCurlyBracedUnit(curlyBracedUnit)
    }

CurlyBracedBlockUnit "curly-braced-block-unit"
    = curlyBracedBlockUnit: (Statement / Expression !(_ ",") __ Delimiter)
    {
        return createCurlyBracedBlockUnit(curlyBracedBlockUnit)
    }

CurlyBracedInlineUnit "curly-braced-inline-unit"
    = curlyBracedInlineUnit: (@(Pair / Expression) @(_ "," _ (Pair / Expression))* (_ ",")?)
    {
        return createCurlyBracedInlineUnit(curlyBracedInlineUnit)
    }

AssignExpr "assignment-expression"
	= assignExpr: (@AssignExprLhs _ "=" _ @AssignExprRhs)
    {
        return createAssignExpr(assignExpr)
    }

AssignExprLhs "assignment-expression-left-hand-side"
	= assignExprLhs: ((AssignExprLhsParens / AssignExprLhsBrackets / AssignExprLhsCurlies / Accession / NotSoftKeywordId) (_ "::" _ @TypeAssertionRhs)?)
    {
        return createAssignExprLhs(assignExprLhs)
    }

AssignExprLhsParens "assignment-expression-left-hand-side-parenthesized"
    = assignExprLhsParens: ("(" _ (AssignExprLhsLeadingParenUnit (_ AssignExprLhsTrailingParenUnit)* / AssignExprLhsPairedParanUnit (_ AssignExprLhsTrailingParenUnit)*) _ ")")
    {
        return createAssignExprLhsParens(assignExprLhsParens)
    }

AssignExprLhsLeadingParenUnit "assignment-expression-left-hand-side-leading-parenthesized-unit"
    = assignExprLhsLeadingParenUnit: (@AssignExprLhs @(_ "," _ AssignExprLhs)+ (_ CollectionTrails)?
    / @AssignExprLhs _ TrailingSigl)
    {
        return createAssignExprLhsLeadingParenUnit(assignExprLhsLeadingParenUnit)
    }

AssignExprLhsTrailingParenUnit "assignment-expression-left-hand-side-trailing-parenthesized-unit"
    = assignExprLhsTrailingParenUnit: (";" _ @(AssignExprLhsPairedParanUnit / AssignExprLhsMixPairedParanUnit) (_ CollectionTrails)?)
    {
        return createAssignExprLhsTrailingParenUnit(assignExprLhsTrailingParenUnit)
    }

AssignExprLhsPairedParanUnit "assignment-expression-left-hand-side-paired-parenthesized-unit"
    = assignExprLhsPairedParanUnit: (@AssignExprLhsPair @(_ "," _ AssignExprLhsPair)* (_ CollectionTrails)?)
    {
        return createAssignExprLhsPairedParanUnit(assignExprLhsPairedParanUnit)
    }

AssignExprLhsMixPairedParanUnit "assignment-expression-left-hand-side-mixed-paired-parenthesized-unit"
    = assignExprLhsMixPairedParanUnit: (@(AssignExprLhsPair / AssignExprLhs) @(_ "," _ (AssignExprLhsPair / AssignExprLhs))* (_ CollectionTrails)?)
    {
        return createAssignExprLhsMixPairedParanUnit(assignExprLhsMixPairedParanUnit)
    }

AssignExprLhsPair "assign-expr-left-hand-side-pair"
	= assignExprLhsPair: (@NotSoftKeywordId _ ":"  _ @AssignExprLhs)
    {
        return createAssignExprLhsPair(assignExprLhsPair)
    }

AssignExprLhsBrackets "assignment-expression-left-hand-side-bracketed"
    = assignExprLhsBrackets: ("[" _ (@AssignExprLhsBracketsLeadingBracketUnit @(_ AssignExprLhsBracketsTrailingBracketUnit)*) _ "]")
    {
        return createAssignExprLhsBrackets(assignExprLhsBrackets)
    }

AssignExprLhsBracketsLeadingBracketUnit "assignment-expression-left-hand-side-leading-bracketted-unit"
    = assignExprLhsBracketsLeadingBracketUnit: (@AssignExprLhs @(_ "," _ AssignExprLhs)* (_ CollectionTrails)?)
    {
        return createAssignExprLhsBracketsLeadingBracketUnit(assignExprLhsBracketsLeadingBracketUnit)
    }

AssignExprLhsBracketsTrailingBracketUnit "assignment-expression-left-hand-side-trailing-bracketted-unit"
    = assignExprLhsBracketsTrailingBracketUnit: (";" _ AssignExprLhs (_ "," _ AssignExprLhs)* (_ CollectionTrails)?)
    {
        return createAssignExprLhsBracketsTrailingBracketUnit(assignExprLhsBracketsTrailingBracketUnit)
    }

AssignExprLhsCurlies "assignment-expression-left-hand-side-curly-braced"
    = assignExprLhsCurlies: ("{" _ @CurlyBracedUnit _ "}")
    {
        return createAssignExprLhsCurlies(assignExprLhsCurlies)
    }

AssignExprLhsCurlyBracedUnit "assignment-expression-left-hand-side-curly-braced-unit"
	= assignExprLhsCurlyBracedUnit: (@(AssignExprLhsPair / AssignExprLhs) @(_ "," _ (AssignExprLhsPair / AssignExprLhs))* (_ ",")?)
    {
        return createAssignExprLhsCurlyBracedUnit(assignExprLhsCurlyBracedUnit)
    }

AssignExprRhs "assignment-expression-right-hand-side"
	= assignExprRhs: ((_ AssignExpr _ "=" _ ExprEscObjCascNotation)+ / ExprEscObjCascNotation)
    {
        return createAssignExprRhs(assignExprRhs)
    }

ExprEscObjCascNotation "expression-with-escaped-object-cascade-notation"
    = expression: (@InfixOprEscObjCascNotation / @PrefixOprEscObjCascNotation / @TermEscObjCascNotation / "(" _ @Expression _ ")")
    {
        return createExpression(expression)
    }

TermEscObjCascNotation "term-with-escaped-object-cascade-notation"
    = term: (@AssignExpr
    / "(" _ @ObjectCascadeNotation _ ")"
    / @PipelineConstruct
    / @MacroExpression
    / @IfCaseConditional
    / @IfElseExpr
    / @ForExpr
    / @TryCatchExpr
    / @TypeExpr
    / @RawExpr
    / @RawStmt
    / @TypeAssertion
    / @MacroInvocation
    / @UnitFunction
    / @StringFragment
    / @AnonFunction
    / @DoExpr
    / @FunctionCallExternCallback
    / @Literal)
    {
        return createTerm(term)
    }

InfixOprEscObjCascNotation "infix-operation-with-escaped-object-cascade-notation"
    = infixOperation: (@(@PrefixOprEscObjCascNotation / @TermEscObjCascNotation / "(" _ @InfixOperation _ ")") @(_ @InfixOperator _ @(@PrefixOprEscObjCascNotation / @TermEscObjCascNotation / "(" _ @InfixOperation _ ")"))+)
    {
        return createInfixOperation(infixOperation)
    }

PrefixOprEscObjCascNotation "prefix-operation-with-escaped-object-cascade-notation"
	= prefixOperation: (PrefixOperator _ ExprEscObjCascNotation)
    {
        return createPrefixOperation(prefixOperation)
    }

Accession "accession"
    = accession: (PropertyDotAccess / PropertyBracketAccess !(_ "(") / FunctionCall)
    {
        return createAccession(accession)
    }

AccessionWithSoftKeyword "accession-with-soft-keyword"
    = accessionWithSoftKeyword: (PropertyBracketAccessWithSoftKeyword
    / FunctionCallWithSoftKeyword)
    {
        return createAccessionWithSoftKeyword(accessionWithSoftKeyword)
    }

PropertyDotAccess "property-dot-access"
    = propertyDotAccess: (@DotAccessableProperty _ "." _ @DotAccessedProperty)
    {
        return createPropertyDotAccess(propertyDotAccess)
    }

DotAccessableProperty "dot-accessable-property"
    = dotAccessableProperty: ("(" _ @Expression _ ")" / PropertyDotAccessLiteral)
    {
        return createDotAccessableProperty(dotAccessableProperty)
    }

DotAccessedProperty "dot-accessed-property"
    = dotAccessedProperty: (AccessionWithSoftKeyword
    / Accession
    / Keyword
    / !Sign Float
    / UnsignedInteger
    / Identifier)
    {
        return createDotAccessedProperty(dotAccessedProperty)
    }

PropertyDotAccessLiteral "property-dot-access-literal"
    = propertyDotAccessLiteral: ((PropertyBracketAccess !(_ "(")
    / FunctionCall
    / TaggedString
    / TaggedNumber
    / Keyword
    / Identifier
    / None
    / Boolean
    / Number
    / ImplicitMultiplication
    / Char
    / String
    / Symbol
    / ParenthesesEnclosed
    / SquareBracketEnclosed
    / CurlyBraceEnclosed
    / OperatorRef))
    {
        return createPropertyDotAccessLiteral(propertyDotAccessLiteral)
    }

PropertyBracketAccess "property-bracket-access"
    = propertyBracketAccess: (("(" _ @Expression _ ")" / PropertyBracketAccessLiteral) _ @((_ GenericTypeArguments)? _ SquareBracketEnclosed)+)
    {
        return createPropertyBracketAccess(propertyBracketAccess)
    }

PropertyBracketAccessWithSoftKeyword "property-bracket-access-with-soft-keyword"
    = propertyBracketAccessWithSoftKeyword: (("(" _ @Expression _ ")" / Keyword / SoftKeyword / PropertyBracketAccessLiteral) _ @((_ GenericTypeArguments)? _ SquareBracketEnclosed)+)
    {
        return createPropertyBracketAccessWithSoftKeyword(propertyBracketAccessWithSoftKeyword)
    }

PropertyBracketAccessLiteral "property-bracket-access-literal"
    = propertyBracketAccessLiteral: (FunctionCall
    / TaggedString
    / TaggedNumber
    / NotSoftKeywordId
    / None
    / Boolean
    / Number
    / ImplicitMultiplication
    / Char
    / String
    / Symbol
    / ParenthesesEnclosed
    / SquareBracketEnclosed
    / CurlyBraceEnclosed
    / OperatorRef)
    {
        return createPropertyBracketAccessLiteral(propertyBracketAccessLiteral)
    }

UnitFunction "unit-function"
	= unitFunction: (@(NotSoftKeywordId / "(" (_ @FunctionArgList)? _ ")") _ "->" _ @Expression)
    {
        return createUnitFunction(unitFunction)
    }

FunctionArgList "function-argument-list"
    = functionArgList: ((@FunctionArg @(_ "," _ FunctionArg _)*) (_ ";" _ @FunctionArg @(_ "," _ FunctionArg _)*)?)
    {
        return createFunctionArgList(functionArgList)
    }

FunctionArg "function-argument"
    = functionArg: (AssignExpr / ParametricDataArgument / ParametricProperty / RestParameter / AssignExprLhs)
    {
        return createFunctionArg(functionArg)
    }

ParametricDataArgument "parametric-data-argument"
    = parametricDataArgument: (@NotSoftKeywordId _ "(" _ @FunctionArgList _ ")")
    {
        return createParametricDataArgument(parametricDataArgument)
    }

ParametricProperty "parametric-property"
    = parametricProperty: ((VAR / VAL / REF) _ (AssignExpr / RestParameter / AssignExprLhs))
    {
        return createParametricProperty(parametricProperty)
    }

RestParameter "rest-parameter"
    = restParameter: ("..." __ @(AssignExpr / AssignExprLhs))
    {
        return createRestParameter(restParameter)
    }

AnonFunction "anonymous-function"
	= anonFunction: (AnonBlockFunction / AnonInlineFunction)
    {
        return createAnonFunction(anonFunction)
    }

AnonBlockFunction "anonymous-block-function"
	= anonBlockFunction: (FUN _ @(@FunctionSpecialArgs _)? "(" @(_ @FunctionArgList)? _ ")" @(_ "::" _ @TypeAssertionRhs)? @(_ BlockUnits)* _ END)
    {
        return createAnonBlockFunction(anonBlockFunction)
    }

FunctionSpecialArgs "function-special-arguments"
    = functionSpecialArgs: ("<" _ @FunctionSpecialArgList @(_ "," _ FunctionSpecialArgList)* _ ">")
    {
        return createFunctionSpecialArgs(functionSpecialArgs)
    }

FunctionSpecialArgList "function-special-argument-list"
    = functionSpecialArgList: $(SELF / STATIC / YIELD / META / PAYLOAD / GETTER / SETTER)
    
AnonInlineFunction "anonymous-inline-function"
	= anonInlineFunction: (FUN _ (@FunctionSpecialArgs _)? "(" _ @FunctionArgList? _ ")" _ ":" _ @Expression)
    {
        return createAnonInlineFunction(anonInlineFunction)
    }

FunctionCall "function-call"
    = functionCall: (FunctionCaller (_ FunctionCallArgs)+)
    {
        return createFunctionCall(functionCall)
    }

GenericTypeArguments "generic-type-arguments"
    = genericTypeArguments: ("<" _ @GenericTypeArgList _ ">")
    {
        return createGenericTypeArguments(genericTypeArguments)
    }

GenericTypeArgList "generic-type-argument-list"
    = genericTypeArgList: (GenericTypeArg (_ ";" _ GenericTypeArg)*)
    {
        return createGenericTypeArgList(genericTypeArgList)
    }

GenericTypeArg "generic-type-argument"
    = genericTypeArg: ((GenericTypePair / CompositType) (_ "," _ (GenericTypePair / CompositType))*)
    {
        return createGenericTypeArg(genericTypeArg)
    }

GenericTypePair "generic-type-pair"
    = genericTypePair: (@Identifier __ ":" __ @CompositType)
    {
        return createGenericTypePair(genericTypePair)
    }

FunctionCallWithSoftKeyword "function-call-with-soft-keyword"
    = FunctionCallWithSoftKeyword: ((FunctionCaller / (Keyword / SoftKeyword) &(_ SquareBracketEnclosed)?) (_ FunctionCallArgs)+)
    {
        return createFunctionCallWithSoftKeyword(FunctionCallWithSoftKeyword)
    }

FunctionCaller "function-caller"
    = functionCaller: (TaggedString
    / TaggedNumber
    / NotSoftKeywordId
    / OperatorRef
    / "(" _ Expression _ ")"
    / (None
    / Boolean
    / Number
    / ImplicitMultiplication
    / Char
    / String
    / Symbol
    / ParenthesesEnclosed
    / SquareBracketEnclosed
    / CurlyBraceEnclosed) &(_ SquareBracketEnclosed))
    {
        return createFunctionCaller(functionCaller)
    }

FunctionCallArgs "function-call-arguments"
    = functionCallArgs: ((BracketedCallArgs _)* (_ GenericTypeArguments)? _ "(" (_ FunctionCallArgList)? _ ")")
    {
        return createFunctionCallArgs(functionCallArgs)
    }

BracketedCallArgs "bracketed-call-args"
    = bracketedCallArgs: (GenericTypeArguments? _ SquareBracketEnclosed)
    {
        return createBracketedCallArgs(bracketedCallArgs)
    }

FunctionCallArgList "function-call-argument-list"
    = functionCallArgList: (FunctionCallPairedArg / FunctionCallLeadingArg _ FunctionCallTrailingArg?)
    {
        return createFunctionCallArgList(functionCallArgList)
    }

FunctionCallLeadingArg "function-call-leading-argument"
    = functionCallLeadingArg: ((Expression / "?") (_ "," _ (Expression / "?"))*)
    {
        return createFunctionCallLeadingArg(functionCallLeadingArg)
    }

FunctionCallTrailingArg "function-call-trailing-argument"
    = functionCallTrailingArg: (_ ";" _ (FunctionCallPair / Identifier) (_ "," _ (FunctionCallPair / Identifier))*)
    {
        return createFunctionCallTrailingArg(functionCallTrailingArg)
    }

FunctionCallPairedArg "function-call-paired-argument"
    = functionCallPairedArg: (FunctionCallPair (_ "," _ FunctionCallPair)*)
    {
        return createFunctionCallPairedArg(functionCallPairedArg)
    }

FunctionCallPair "function-call-pair"
    = functionCallPair: (@NotSoftKeywordId _ ":" _ @(Expression / "?"))
    {
        return createFunctionCallPair(functionCallPair)
    }

DoExpr "do-expression"
    = doExpr: (DO @(_ @Statement / _ @Expression __ Delimiter)+ _ END)
    {
        return createDoExpr(doExpr)
    }

MacroInvocation "macro-invocation"
    = macroInvocation: (MacroBlockInvocation / MacroInlineInvocation)
    {
        return createMacroInvocation(macroInvocation)
    }

MacroInlineInvocation "macro-inline-invocation"
    = macroInlineInvocation: (@MacroStatement / @MacroExpression __ Delimiter)
    {
        return createMacroInlineInvocation(macroInlineInvocation)
    }

MacroExpression "macro-expression"
    = macroExpression: (MacroExpressionWithArg / MacroExpressionNoArg)
    {
        return createMacroExpression(macroExpression)
    }

MacroExpressionNoArg "macro-expression-with-no-arguments"
    = macroExpressionNoArg: ("@" __ @MacroExpressionNoArgInvoker _ @(GenericTypeArguments _)? @Expression)
    {
        return createMacroExpressionNoArg(macroExpressionNoArg)
    }

MacroExpressionNoArgInvoker "macro-expression-with-no-arguments-invoker"
    = macroExpressionNoArgInvoker: ("(" _ @Expression _ ")" / NotSoftKeywordId)
    {
        return createMacroExpressionNoArgInvoker(macroExpressionNoArgInvoker)
    }

MacroExpressionWithArg "macro-expression-with-arguments"
    = macroExpressionWithArg: (@MacroExpressionWithArgInvoker _ @(GenericTypeArguments _)? "@" _ @MacroExpressionArgs _ @Expression)
    {
        return createMacroExpressionWithArg(macroExpressionWithArg)
    }

MacroExpressionWithArgInvoker "macro-expression-with-arguments-invoker"
    = macroExpressionWithArgInvoker: (Accession / NotSoftKeywordId / "(" _ @Expression _ ")")
    {
        return createMacroExpressionWithArgInvoker(macroExpressionWithArgInvoker)
    }

MacroExpressionArgs "macro-expression-arguments"
    = macroExpressionArgs: (SquareBracketEnclosed / "(" @(_ @FunctionCallArgList)? _ ")")
    {
        return createMacroExpressionArgs(macroExpressionArgs)
    }

MacroStatement "macro-statement"
    = macroStatement: (MacroStatementWithArg / MacroStatementNoArg)
    {
        return createMacroStatement(macroStatement)
    }

MacroStatementNoArg "macro-statement-with-no-arguments"
    = macroExpressionNoArg: ("@" __ @MacroExpressionNoArgInvoker _ @(GenericTypeArguments _)? @Statement)
    {
        return createMacroStatementNoArg(macroExpressionNoArg)
    }

MacroStatementWithArg "macro-statement-with-arguments"
    = macroExpressionWithArg: (@MacroExpressionWithArgInvoker _ @(GenericTypeArguments _)? "@" _ @MacroExpressionArgs _ @Statement)
    {
        return createMacroStatementWithArg(macroExpressionWithArg)
    }

MacroBlockInvocation "macro-block-invocation"
    = macroBlockInvocation: ("@@" __ @MacroExpressionNoArgInvoker @(_ ImportStatement _ / _ UseNotStatement _ / _ UseStatement _)*)
    {
        return createMacroBlockInvocation(macroBlockInvocation)
    }

MetaDataInterpolation "meta-data-interpolation"
    = metaDataInterpolation: ("$" @CurlyBraceEnclosed)
    {
        return createMetaDataInterpolation(metaDataInterpolation)
    }

OperatorRef "operator-referance"
    = operatorRef: ("(" __ @(Operator / Keyword / SoftKeyword) __ ")")
    {
        return createOperatorRef(operatorRef)
    }

AsExpr "as-expression"
    = asExpr: (@(Literal / "(" _ (Expression / Term) _ ")") _ AS _ @Identifier)
    {
        return createAsExpr(asExpr)
    }

PipelineConstruct "pipeline-construct"
    = pipelineConstruct: (PointFreePipeline / PointedPipeline)
    {
        return createPipelineConstruct(pipelineConstruct)
    }

PointFreePipeline "point-free-pipeline"
    = pointFreePipeline: (@(@Literal / "(" _ @(Expression / Term) _ ")") @(_ @PipelineOperator _ @(@Accession / "(" _ @UnitFunction _ ")" / !UnitFunction @Identifier))+ @(_ "??" _ @UnitFunction)?)
    {
        return createPointFreePipeline(pointFreePipeline)
    }

PointedPipeline "pointed-pipeline"
    = pointedPipeline: (@AsExpr @(_ @PipelineOperator _ @(!UnitFunction @Literal / "(" _ @(Expression / Term) _ ")"))+ @(_ "??" _ @UnitFunction)?)
    {
        return createPointedPipeline(pointedPipeline)
    }

PipelineOperator "pipeline-operator"
    = pipelineOperator: ("``" / ".``" / "??")
    {
        return createPipelineOperator(pipelineOperator)
    }

ObjectCascadeNotation "object-cascade-notation"
    = objectCascadeNotation: ((Literal / "(" _ (Expression / Term) _ ")") (_ ".." _ (AssignExpr / Accession / "(" _ Expression _ ")"))+)
    {
        return createObjectCascadeNotation(objectCascadeNotation)
    }

FunctionCallExternCallback "function-call-with-external-callback"
    = functionCallExternCallback: (@FunctionCallExternCallbackReciever _ @FunctionCallExternCaller)
    {
        return createFunctionCallExternCallback(functionCallExternCallback)
    }

FunctionCallExternCallbackReciever "function-call-with-external-callback-reciever"
    = functionCallExternCallbackReciever: (@(@PropertyDotAccess / @PropertyBracketAccess !(_ "(") / @FunctionCaller)  @(_ @FunctionCallExternCallerArgs)+)
    {
        return createFunctionCallExternCallbackReciever(functionCallExternCallbackReciever)
    }

FunctionCallExternCallerArgs "function-call-external-caller-arguments"
    = functionCallExternCallerArgs: (@(@SquareBracketEnclosed _)* "(" _ @FunctionCallExternCallerArgList? _ ")")
    {
        return createFunctionCallExternCallerArgs(functionCallExternCallerArgs)
    }

FunctionCallExternCallerArgList "function-call-external-caller-argument-list"
    = functionCallExternCallerArgList: (@FunctionCallExternCallerLeadingArg @(_ @FunctionCallExternCallerTrailingArg)? / @FunctionCallExternCallerPairedArg)
    {
        return createFunctionCallExternCallerArgList(functionCallExternCallerArgList)
    }

FunctionCallExternCallerLeadingArg "function-call-external-caller-leading-argument"
    = functionCallExternCallerLeadingArg: (@FunctionCallExternCallerArg @(_ "," _ @FunctionCallExternCallerArg)*)
    {
        return createFunctionCallExternCallerLeadingArg(functionCallExternCallerLeadingArg)
    }

FunctionCallExternCallerTrailingArg "function-call-external-caller-trailing-argument"
    = functionCallExternCallerTrailingArg: (_ ";" _ @(FunctionCallExternCallerPair / Identifier) @(_ "," _ (@FunctionCallExternCallerPair / @Identifier))*)
    {
        return createFunctionCallExternCallerTrailingArg(functionCallExternCallerTrailingArg)
    }

FunctionCallExternCallerPairedArg "function-call-external-caller-paired-argument"
    = functionCallExternCallerPairedArg: (@FunctionCallExternCallerPair @(_ "," _ @FunctionCallExternCallerPair)*)
    {
        return createFunctionCallExternCallerPairedArg(functionCallExternCallerPairedArg)
    }

FunctionCallExternCallerPair "function-call-external-caller-pair"
    = functionCallExternCallerPair: (@NotSoftKeywordId _ ":"  _ @FunctionCallExternCallerArg)
    {
        return createFunctionCallExternCallerPair(functionCallExternCallerPair)
    }

FunctionCallExternCallerArg "function-call-external-caller-argument"
    = functionCallExternCallerArg: (@FUN @(_ "(" _ @FunctionArgList? _ ")")? / @Expression)
    {
        return createFunctionCallExternCallerArg(functionCallExternCallerArg)
    }

FunctionCallExternCaller "function-call-external-caller"
    = functionCallExternCaller: DoExpr {
        return createFunctionCallExternCaller(functionCallExternCaller)
    }

Operator "operator"
	= _operator: (ArithmeticOperator
    / RelationalOperator
    / LogicalOperator
    / CompoundAssignOperator
    / IterableOperator
    / IterableAssignOperator
    / CollectionOperator
    / LexicalOperator
    / StructuralOperator
    / DelimiterOperator
    / MiscellanyOperator)
    {
        return createOperator(_operator)
    }

InfixOperation "infix-operation"
    = infixOperation: ((PrefixOperation / Term / "(" _ @InfixOperation _ ")") @(_ InfixOperator _ (PrefixOperation / Term / "(" _ InfixOperation _ ")"))+)
    {
        return createInfixOperation(infixOperation)
    }

InfixOperator "infix-operator"
    = infixOperator: (InfixFuntionCall
    / IterableAssignOperator
    / IterableOperator
    / CompoundAssignOperator
    // ("&&" / "||" / "<~" / "??" / "//" / "|" / "&") !CustomInfixOperator
    / ArithmeticOperator
    / RelationalOperator
    / CustomInfixOperator
    / InfixVerbalOperator)
    {
        return createInfixOperator(infixOperator)
    }

CustomInfixOperator "custom-infix-operator"
	= customInfixOperator: (!(Operator !CustomInfixOperatorChar) CustomInfixOperatorChar+)
    {
        return createCustomInfixOperator(customInfixOperator)
    }

CustomInfixOperatorChar "custom-infix-operator-character"
    = customInfixOperatorChar: [\u0021\u0025\u0026\u002A\u002B\u002D\u002E\u002F\u003A\u005C\u005E\u0060\u007C\u007E\u00D7\u00F7\u003C-\u0040\u00A1-\u00AC\u00AE-\u00BF\u2100-\u215F\u2180-\u21FF\u2500-\u25FF\u2200-\u22FF]
    {
        return createCustomInfixOperatorChar(customInfixOperatorChar)
    }

InfixVerbalOperator "infix-verbal-operator"
	= infixVerbalOperator: (NOT_IN / IN / OF / TO / IS_NOT / IS)
    {
        return createInfixVerbalOperator(infixVerbalOperator)
    }

InfixFuntionCall "infix-function-call"
	= infixFuntionCall: ("`" __ (&(Identifier _ ("." _ Identifier)+) PropertyDotAccess / Identifier) __ "`")
    {
        return createInfixFuntionCall(infixFuntionCall)
    }

PrefixOperation "prefix-operation"
	= prefixOperation: (PrefixOperator _ Expression)
    {
        return createPrefixOperation(prefixOperation)
    }

PrefixOperator "prefix-operator"
	= prefixOperator: ("..." / "~" / "!" / PrefixVerbalOperator)
    {
        return createPrefixOperator(prefixOperator)
    }

PrefixVerbalOperator "prefix-verbal-operator"
	= prefixVerbalOperator: (AWAIT / YIELD / THROW)
    {
        return createPrefixVerbalOperator(prefixVerbalOperator)
    }

ArithmeticOperator "arithmetic-operator"
	= arithmeticOperator: (("+" / "-" / "*" / "^" / "/" / "%") !CustomInfixOperator)
    {
        return createArithmeticOperator(arithmeticOperator)
    }

RelationalOperator "relational-operator"
	= relationalOperatorr: (("<=" / ">=" / "<" / ">" / "==" / "!=") !CustomInfixOperator)
    {
        return createRelationalOperator(relationalOperatorr)
    }

LogicalOperator "logical-operator"
	= logicalOperator: (("&&" / "||" / "!") !CustomInfixOperator)
    {
        return createLogicalOperator(logicalOperator)
    }

CompoundAssignOperator "compound-assignment-operator"
	= compoundAssignOperator: (("+=" / "-=" / "*=" / "/=" / "^=" / "%=" / "&&=" / "||=") !CustomInfixOperator)
    {
        return createCompoundAssignOperator(compoundAssignOperator)
    }

IterableOperator "iterable-operator"
	= iterableOperator: ((".+" / ".-" / ".*" / "./" / ".%" / ".^" / ".&&" / ".||") !CustomInfixOperator)
    {
        return createIterableOperator(iterableOperator)
    }

IterableAssignOperator "iterable-assignment-operator"
	= iterableAssignOperator: ((".+=" / ".-=" / ".*=" / "./=" / ".%=" / ".^=" / ".&&=" / ".||=") !CustomInfixOperator)
    {
        return createIterableAssignOperator(iterableAssignOperator)
    }

CollectionOperator "collection-oprerator"
	= collectionOperator: (("'" / '"' / "`" / "{" / "}" / "(" / ")" / "[" / "]") !CustomInfixOperator)
    {
        return createCollectionOperator(collectionOperator)
    }

LexicalOperator "lexical-operator"
	= lexicalOperator: (("$" / "_" / "\\" / ".." / "...") !CustomInfixOperator)
    {
        return createLexicalOperator(lexicalOperator)
    }

StructuralOperator "structural-operator"
	= structuralOperator: (("=>" / "=" / ":=" / "::" / ":" / "@" / "//" / "->" / "<~" / "?." / "#=" / "=#" / "#" / "??") !CustomInfixOperator)
    {
        return createStructuralOperator(structuralOperator)
    }

DelimiterOperator "delimiter-operator"
	= delimiterOperator: (";" !CustomInfixOperator)
    {
        return createDelimiterOperator(delimiterOperator)
    }

MiscellanyOperator "miscellany-operator"
	= miscellanyOperator: (("~" / ".." / "." / "," / "?" / "|" / "&") !CustomInfixOperator)
    {
        return createMiscellanyOperator(miscellanyOperator)
    }

Delimiter "delimiter"
	= delimiter: (";" / &"}" / &")" / &"]" / &"," / &"#=" / &"#" / EOF / Newline / &END)
    {
        return createDelimiter(delimiter || [])
    }

Statement "statement"
	= statement: (Block
    / AssignStatement
    / TypeDeclaration
    / TypeSign
    / ReturnStatement
    / BreakStatement
    / ContinueStatement
    / LabelStatement
    / ImportStatement
    / UseStatement
    / UseNotStatement)
    {
        return createStatement(statement)
    }

AssignStatement "assignment-statement"
	= assignStatement: ((VAR / VAL / TYPE) _ (SingleAssignStmt (_ "," _ SingleAssignStmt)* __ Delimiter))
    {
        return createAssignStatement(assignStatement)
    }

SingleAssignStmt "single-assignment-statement"
    = singleAssignStmt: (AssignStmtLhs _ "=" _ AssignStmtRhs / NotSoftKeywordId (_ "::" _ TypeAssertionRhs)?)
    {
        return createSingleAssignStmt(singleAssignStmt)
    }

AssignStmtLhs "assignment-statement-left-hand-side"
	= assignStmtLhs: AssignExprLhs {
        return createAssignStmtLhs(assignStmtLhs)
    }

AssignStmtRhs "assignment-statement-right-hand-side"
	= assignStmtRhs: Expression {
        return createAssignStmtRhs(assignStmtRhs)
    }

IfConditional "if-conditional"
    = ifConditional: (IfElseExpr / IfBlockExpr / IfInlineExpr)
    {
        return createIfConditional(ifConditional)
    }

IfElseExpr "if-else-expression"
    = ifElseExpr: (IF _ @Expression _ ":" _ @Expression _ ELSE _ ":" _ @Expression)
    {
        return createIfElseExpr(ifElseExpr)
    }

IfCaseConditional "if-case-conditional"
    = ifCaseConditional: (IF _ @CaseCondition _ ":" @(_ CaseMatchConditions)+ _ ELSE _ ":" _ @CaseMatchFailExpr)
    {
        return createIfCaseConditional(ifCaseConditional)
    }

CaseCondition "case-condition"
    = caseCondition: (CASE _ @Expression @(_ "," _ Expression)*)
    {
        return createCaseCondition(caseCondition)
    }

CaseMatchConditions "case-match-conditions"
    = caseMatchConditions: (@CaseCondition _ ":" _ @Expression)
    {
        return createCaseMatchConditions(caseMatchConditions)
    }

CaseMatchFailExpr "case-match-fail-expression"
    = caseMatchFailExpr: Expression {
        return createCaseMatchFailExpr(caseMatchFailExpr)
    }

IfBlockExpr "if-block-expression"
    = ifBlockExpr: (@IfBlock @(_ ElseIfBlock)* @(_ ElseBlock)? _ END)
    {
        return createIfBlockExpr(ifBlockExpr)
    }

IfInlineExpr "if-inline-expression"
    = ifInlineExpr: (@(ElseInline / ElseIfInline / IfInline) _ ":" _ @(Expression / Block))
    {
        return createIfInlineExpr(ifInlineExpr)
    }

IfBlock "if-block"
    = ifBlock: (IF _ @Expression _ @(_ BlockUnits)*)
    {
        return createIfBlock(ifBlock)
    }

ElseIfBlock "else-if-block"
    = elseIfBlock: (ELSE_IF _ @Expression _ @(_ BlockUnits)*)
    {
        return createElseIfBlock(elseIfBlock)
    }

ElseBlock "else-block"
    = elseBlock: (ELSE _ @(BlockUnits _)*)
    {
        return createElseBlock(elseBlock)
    }

IfInline "if-inline"
    = ifInline: (IF _ @Expression)
    {
        return createIfInline(ifInline)
    }

ElseIfInline "else-if-inline"
    = elseIfInline: (@IfBlock _ @(_ ElseIfOptionalInline)* _ ELSE_IF _ @Expression)
    {
        return createElseIfInline(elseIfInline)
    }

ElseIfOptionalInline "else-if-optional-inline"
    = elseIfOptionalInline: (ELSE_IF _ @Expression _ !":" @(_ Block / _ Expression __ Delimiter)*)
    {
        return createElseIfOptionalInline(elseIfOptionalInline)
    }

ElseInline "else-inline"
    = elseInline: (@IfBlock _ @(ElseIfBlock _)* _ ELSE)
    {
        return createElseInline(elseInline)
    }

ForIterator "for-iterator"
    = forIterator: (ForBlockExpr / ForInlineExpr)
    {
        return createForIterator(forIterator)
    }

ForBlockExpr "for-block-expression"
    = forBlockExpr: (@ForBlock @(_ DoneBlock)? _ END)
    {
        return createBlockExpr(forBlockExpr)
    }

ForInlineExpr "for-inline-expression"
    = forInlineExpr: (@(ForBlock _ DoneInline / ForInline) _ ":" _ @(Block / Expression))
    {
        return createForInlineExpr(forInlineExpr)
    }

ForExpr "for-expression"
    = forExpr: (FOR _ @ForLoopHead _ ":" _ @Expression)
    {
        return createForExpr(forExpr)
    }

ForBlock "for-block"
    = forBlock: (FOR _ @ForLoopHead @(_ BlockUnits)*)
    {
        return createForBlock(forBlock)
    }

ForInline "for-inline"
    = forInline: (FOR _ @ForLoopHead)
    {
        return createForInline(forInline)
    }

ForLoopHead "for-loop-head"
    = forLoopHead: (ForCounterLoopHeadUnit / ForInLoopHeadUnit / Expression)
    {
        return createForLoopHead(forLoopHead)
    }

ForCounterLoopHeadUnit "for-counter-loop-head-unit"
    = forCounterLoopHeadUnit: ("(" _ @AssignExpr _ ";" _ @Expression _ ";" _ @Expression _ ")")
    {
        return createForCounterLoopHeadUnit(forCounterLoopHeadUnit)
    }

ForInLoopHeadUnit "for-in-loop-head-unit"
    = forInLoopHeadUnit: ((@AssignExprLhs _ IN _ @Expression) @(_ "," _ (AssignExprLhs _ IN _ Expression))*)
    {
        return createForInLoopHeadUnit(forInLoopHeadUnit)
    }

DoneInline "done-inline"
    = doneInline: (DONE _ @AssignExprLhs)
    {
        return createDoneInline(doneInline)
    }

DoneBlock "done-block"
    = doneBlock: (DONE _ @AssignExprLhs @(_ BlockUnits)*)
    {
        return createDoneBlock(doneBlock)
    }

TryErrorHandleConstruct "try-error-handle-construct"
    = tryErrorHandleConstruct: (TryCatchExpr / TryBlockExpr / TryInlineExpr)
    {
        return createTryErrorHandleConstruct(tryErrorHandleConstruct)
    }

TryCatchExpr "try-catch-expression"
    = tryCatchExpr: (TRY _ ":" _ @Expression _ CATCH _ @AssignExprLhs _ ":" _  @Expression)
    {
        return createTryCatchExpr(tryCatchExpr)
    }

TryBlockExpr "try-block-expression"
    =  tryBlockExpr: (@TryBlock @(_ CatchBlock)+ @(_ DoneBlock)? _ END)
    {
        return createTryBlockExpr(tryBlockExpr)
    }

TryInlineExpr "try-inline-expression"
    = tryInlineExpr: ((@TryBlock @(_ CatchBlock)+ @DoneInline / @TryCatchInline) _ ":" _ @(Expression / Block))
    {
        return createTryInlineExpr(tryInlineExpr)
    }

TryBlock "try-block"
    =  tryBlock: (TRY _ @(BlockUnits _)*)
    {
        return createTryBlock(tryBlock)
    }

TryCatchInline "try-catch-inline"
    = tryCatchInline: (@TryBlock @(_ CatchInline)+ _ CATCH _ @AssignExprLhs)
    {
        return createTryCatchInline(tryCatchInline)
    }

CatchInline "catch-inline"
    = catchInline: (CATCH _ @AssignExprLhs _ !":" @(Block _ / Expression __ Delimiter _)*)
    {
        return createCatchInline(catchInline)
    }

CatchBlock "catch-block"
    = catchBlock: (CATCH _ @AssignExprLhs @(_ BlockUnits)*)
    {
        return createCatchBlock(catchBlock)
    }

NamedFunction "named-function"
    = namedFunction: (NamedFunctionBlock / NamedFunctionInline)
    {
        return createNamedFunction(namedFunction)
    }

NamedFunctionBlock "named-function-block"
	= namedFunctionBlock: (FUN _ @NotSoftKeywordId _ @(FunctionSpecialArgs _)? "(" _ @FunctionArgList? _ ")" (_ "::" _ @TypeAssertionRhs)? @(_ BlockUnits)* _ END)
    {
        return createNamedFunctionBlock(namedFunctionBlock)
    }
    
NamedFunctionInline "named-function-inline"
	= namedFunctionInline: (FUN _ @NotSoftKeywordId _ (@FunctionSpecialArgs _)? "(" _ @FunctionArgList? _ ")" _ ":" _ @(Block / Expression) __ Delimiter)
    {
        return createNamedFunctionInline(namedFunctionInline)
    }

ReturnStatement "return-statement"
	= returnStatement: (RETURN (__ @Expression)? __ Delimiter)
    {
        return createReturnStatement(returnStatement)
    }

BreakStatement "break-statement"
	= breakStatement: (BREAK (__ @Expression)? __ Delimiter)
    {
        return createBreakStatement(breakStatement)
    }

ContinueStatement "continue-statement"
	= continueStatement: (CONTINUE (__ @Expression)? __ Delimiter)
    {
        return createContinueStatement(continueStatement)
    }

LabelStatement "label-statement"
	= labelStatement: (@NotSoftKeywordId __ AS _ @Statement)
    {
        return createLabelStatement(labelStatement)
    }

ImportStatement "import-statement"
	= importStatement: (IMPORT _ @ImportUnit? _ @(PackageImport / String / StringFragment / Accession (_ "," _ Accession)*) __ Delimiter)
    {
        return createImportStatement(importStatement)
    }

ImportUnit "import-unit"
    = importUnit: (("..." @(__ NotSoftKeywordId)? / @AssignExprLhs @(_ "," _ AssignExprLhs)*) _ FROM)
    {
        return createImportUnit(importUnit)
    }

PackageImport "package-import"
    = packageImport: (PKG _ "::" _ @(Symbol+ / NotSoftKeywordId / "(" _ @(Symbol+ (_ "," _ Symbol+)* / NotSoftKeywordId (_ "," _ NotSoftKeywordId)*) _ ")"))
    {
        return createPackageImport(packageImport)
    }

UseStatement "use-statement"
	= useStatement: (USE _ @(StringFragment / String) __ Delimiter)
    {
        return createUseStatement(useStatement)
    }

UseNotStatement "use-not-statement"
	= useNotStatement: (USE_NOT _ @(StringFragment / String) __ Delimiter)
    {
        return createUseNotStatement(useNotStatement)
    }

TypeExpr "type-expression"
	= typeExpr: (TYPE _ "::" _ @TypeAssertionRhs)
    {
        return createTypeExpr(typeExpr)
    }

RawExpr "raw-expression"
    = rawExpr: (EXPR _ "::" _ @("$" @DoExpr / Expression))
    {
        return createRawExpr(rawExpr)
    }

RawStmt "raw-statement"
    = rawStmt: (STMT _ "::" _ @("$" @DoExpr / Statement))
    {
        return createRawStmt(rawStmt)
    }

TypeAssertion "type-assertion"
    = typeAssertion: (@TypeAssertionLhs _ "::" _ @TypeAssertionRhs)
    {
        return createTypeAssertion(typeAssertion)
    }

TypeAssertionLhs "type-assertion-left-hand-side"
    = typeAssertionLhs: ("(" _ @Expression _ ")" / Literal)
    {
        return createTypeAssertionLhs(typeAssertionLhs)
    }

TypeAssertionRhs "type-assertion-right-hand-side"
    = typeAssertionRhs: ((@GenericTypes _ "=>" _)? @CompositType (_ "." _ @TypeConstraint)?)
    {
        return createTypeAssertionRhs(typeAssertionRhs)
    }

GenericTypes "generic-types"
    = genericTypes: (@GenericTypeUnit @(_ "," _ GenericTypeUnit)*)
    {
        return createGenericTypes(genericTypes)
    }

GenericTypeUnit "generic-type-unit"
    = genericTypeUnit: (@IdentityType (_ ":" _ @CompositType)?)
    {
        return createGenericTypeUnit(genericTypeUnit)
    }

TypeLiteral "type-literal"
    = typeLiteral: (ParametricType
    / IdentityType)
    {
        return createTypeLiteral(typeLiteral)
    }

CompositType "composit-type"
    = compositType: (TypeUnitFunction
    / TypeOperation
    / TypeLiteral)
    {
        return createCompositType(compositType)
    }

IdentityType "identity-type"
    = identityType: (@Identifier "'"*)
    {
        return createIdentityType(identityType)
    }

ParametricType "parametric-type"
    = parametricType: (@IdentityType __ "(" _ @ParametricTypeArgList? _ ")")
    {
        return createParametricType(parametricType)
    }

ParametricTypeArgList "parametric-type-argument-list"
    = parametricTypeArgList: (ParametricTypePairedArg / ParametricTypeLeadingArg _ ParametricTypeTrailingArg*)
    {
        return createParametricTypeArgList(parametricTypeArgList)
    }

ParametricTypeLeadingArg "parametric-type-leading-argument"
    = parametricTypeLeadingArg: (CompositType (_ "," _ CompositType)*)
    {
        return createParametricTypeLeadingArg(parametricTypeLeadingArg)
    }

ParametricTypeTrailingArg "parametric-type-trailing-argument"
    = parametricTypeTrailingArg: (_ ";" _ @ParametricTypeArg @(_ "," _ ParametricTypeArg)*)
    {
        return createParametricTypeTrailingArg(parametricTypeTrailingArg)
    }

ParametricTypePairedArg "parametric-type-paired-argument"
    = parametricTypePairedArg: (TypePair (_ "," _ TypePair)*)
    {
        return createParametricTypePairedArg(parametricTypePairedArg)
    }

ParametricTypeArg "parametric-type-argument"
    = parametricTypeArg: (TypePair / CompositType)
    {
        return createParametricTypeArg(parametricTypeArg)
    }

TypePair "type-pair"
    = typePair: (@CompositType __ ":" __ @CompositType)
    {
        return createTypePair(typePair)
    }

TypeDeconstructTuple "type-deconstruct-tuple"
    = typeDeconstructTuple: ("(" _ &(CompositType _ ("," / ":")) @ParametricTypeArgList (_ ",")? _ ")")
    {
        return createTypeDeconstructTuple(typeDeconstructTuple)
    }

TypeUnitFunction "type-unit-function"
    = typeUnitFunction: (@(TypePostfixOperation / TypeLiteral / "(" _ @TypeUnitFunctionArgList? _ ")") _ "->" _ @CompositType)
    {
        return createTypeUnitFunction(typeUnitFunction)
    }

TypeUnitFunctionArgList "type-unit-function-argument-list"
    = typeUnitFunctionArgList: (TypeUnitFunctionArg (_ ";" _ TypeUnitFunctionArg)*)
    {
        return createTypeUnitFunctionArgList(typeUnitFunctionArgList)
    }

TypeUnitFunctionArg "ftype-unit-function-argument"
    = typeUnitFunctionArg: ((TypePair / CompositType / &"..." TypePrefixOperation) (_ "," _ (TypePair / CompositType / &"..." TypePrefixOperation))*)
    {
        return createTypeUnitFunctionArg(typeUnitFunctionArg)
    }

TypeOperation "type-operation"
    = typeOperation: (TypeInfixOperation
    / !"..." TypePrefixOperation
    / TypePostfixOperation
    / "(" _ @CompositType _ ")")
    {
        return createTypeOperation(typeOperation)
    }

TypeInfixOperation "type-infix-operation"
    = typeInfixOperation: (TypeInfixOperand (_ TypeInfixOperator _ TypeInfixOperand)+)
    {
        return createTypeInfixOperation(typeInfixOperation)
    }

TypeInfixOperand "type-infix-operand"
    = typeInfixOperand: (!"..." TypePrefixOperation / TypePostfixOperation / TypeLiteral / "(" _ @CompositType _ ")")
    {
        return createTypeInfixOperand(typeInfixOperand)
    }

TypeInfixOperator "type-infix-operator"
    = typeInfixOperator: ("|" / "&")
    {
        return createTypeInfixOperator(typeInfixOperator)
    }

TypePrefixOperation "type-prefix-operation"
    = typePrefixOperation: (@TypePrefixOperator __ @(TypePostfixOperation / TypeLiteral / !"..." TypePrefixOperation / "(" _ @CompositType _ ")"))
    {
        return createTypePrefixOperation(typePrefixOperation)
    }

TypePrefixOperator "type-prefix-operator"
    = typePrefixOperator: ("..."
    / "!")
    {
        return createTypePrefixOperation(typePrefixOperator)
    }

TypePostfixOperation "type-postfix-operation"
    = typePostOperation: (@(TypeLiteral / "(" _ @CompositType _ ")") __ @TypePostfixOperator)
    {
        return createTypePostfixOperation(typePostOperation)
    }

TypePostfixOperator "type-postfix-operator"
    = typePostOperator: ("?")
    {
        return createTypePostfixOperator(typePostOperator)
    }

TypeSign "type-signature"
    = typeSign: (NamedTypeSign / AnonTypeSign)
    {
        return createTypeSign(typeSign)
    }

NamedTypeSign "named-type-signature"
    = namedTypeSign: (@NamedTypeSignLhs _ "::" _ @NamedTypeSignRhs __ Delimiter)
    {
        return createNamedTypeSign(namedTypeSign)
    }

NamedTypeSignLhs "named-type-signature-left-hand-side"
    = namedTypeSignLhs: ((VAR / VAL / FUN) _ @NotSoftKeywordId @(_ "," _ NotSoftKeywordId)*)
    {
        return createNamedTypeSignLhs(namedTypeSignLhs)
    }

NamedTypeSignRhs "named-type-signature-right-hand-side"
    = namedTypeSignRhs: ((@GenericTypes _ "=>" _)? @(&"..." TypePrefixOperation / TypeDeconstructTuple) (_ "." _ @TypeConstraint)? (_ "=" _ @(Accession / NotSoftKeywordId / ParenthesesEnclosed))?)
    {
        return createNamedTypeSignRhs(namedTypeSignRhs)
    }

AnonTypeSign "anonymous-type-signature"
    = anonTypeSign: (VariableSign
    / ValueSign
    / FunctionSign)
    {
        return createAnonTypeSign(anonTypeSign)
    }

TypeDeclaration "type-declaration"
    = typeDeclaration: (TYPE _ @(ParametricType / IdentityType) (_ "::" _ @IdentityType)? _ "=" _ (@GenericTypes _ "=>" _)? @(ParametricType / (AS _)? @IdentityType) @(_ "|" _ (_ ParametricType / _ (AS _)? IdentityType))* (_ @DataDeclaration)? __ Delimiter)
    {
        return createTypeDeclaration(typeDeclaration)
    }

DataDeclaration "data-declaration"
    = dataDeclaration: ("." _ DATA (_ @(ParametricType / IdentityType) @(_ "," _ (ParametricType / IdentityType))*)? _ @TypeConstraint)
    {
        return createDataDeclaration(dataDeclaration)
    }

TypeConstraint "type-constraint"
    = typeConstraint: ("{" _ (@UnitFunction @(_ "," _ UnitFunction)* _ "," _ @SingleAssignStmt @(_ "," _ SingleAssignStmt)* / (@UnitFunction @(_ "," _ UnitFunction)* / @SingleAssignStmt @(_ "," _ SingleAssignStmt)*) (_ ",")?) _ "}" "!"?)
    {
        return createTypeConstraint(typeConstraint)
    }

VariableSign "variable-signature"
    = variableSign: (VAR _ "::" _ @TypeAssertionRhs __ Delimiter _ @(InTypeSignMacro _)* @TypeSignAssignExprs)
    {
        return createVariableSign(variableSign)
    }

ValueSign "value-signature"
    = valueSign: (VAL _ "::" _ @TypeAssertionRhs __ Delimiter _ @(InTypeSignMacro _)* @TypeSignAssignExprs)
    {
        return createValueSign(valueSign)
    }

InTypeSignMacro "in-type-signature-macro"
    = inTypeSignMacro: ("@" __ @MacroExpressionNoArgInvoker (_ @GenericTypeArguments _)? / @MacroExpressionWithArgInvoker _ (@GenericTypeArguments _)? "@" _ @MacroExpressionArgs)
    {
        return createInTypeSignMacro(inTypeSignMacro)
    }

TypeSignAssignExprs "type-signature-assignment-expressions"
    = typeSignAssignExprs: ((!TypeAssertion @AssignExprLhs _ "=" _ @AssignExprRhs) @(_ "," _ !TypeAssertion AssignExprLhs _ "=" _ AssignExprRhs)* __ Delimiter)
    {
        return createTypeSignAssignExprs(typeSignAssignExprs)
    }

FunctionSign "function-signature"
    = functionSign: (FUN _ "::" _ @TypeAssertionRhs __ Delimiter _ @(InTypeSignMacro _)* @(FunctionSignBlockBody / FunctionSignInlineBody))
    {
        return createFunctionSign(functionSign)
    }

FunctionSignBlockBody "function-signature-block-body"
    = functionSignBlockBody: (@NotSoftKeywordId _ (@FunctionSpecialArgs _)? "(" _ @FunctionArgList? _ ")" @(_ BlockUnits)* _ END)
    {
        return createFunctionSignBlockBody(functionSignBlockBody)
    }
    
FunctionSignInlineBody "function-signature-inline-body"
	= functionSignInlineBody: (@NotSoftKeywordId _ "(" _ @FunctionArgList? _ ")" _ ":" _ @(Statement / Expression) __ Delimiter)
    {
        return createFunctionSignInlineBody(functionSignInlineBody)
    }
