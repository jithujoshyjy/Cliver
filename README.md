### Comments

Single line comments in Cliver start with `#` and multiline comments are enclosed within `#= =#` pairs.

### Naming Conventions

In Cliver identifiers, start with an underscore (_) or a utf-8 letter and thereafter can contain letters, numbers, underscores, and any utf-8 alphanumeric characters. They may end with an exclamation mark (!), followed optionally by single quotes (')

```julia
# valid identifiers
val Abc, _D0ef, Ghi!, Jkl', Mno!''
```

### Import/Export

Cliver import syntax is inspired by JavaScript and TypeScript.<br/>
Any identifier prefixed with underscore (_) is considered private and cannot be imported.<br/>
These can only appear at the top of a scope.<br/>
All other identifiers are exported implicitely.<br/>

```julia
# import module for it's side effect
import Package\Module
import "./filename.cli"

# import all into current scope
import ... from Package\Module
import ... from "./filename.cli"

# import all as a namespace
import ...Abc from Package\Module
import ...Abc from "./filename.cli"

# import specific things
import A, B from Package\Module
import A, B from "./filename.cli"

# import as identifier syntax
import A as B from Package\Module
import A as B from "./filename.cli"
```

### Variables and Constants

variables are declared with the **var** keyword and constants by the **val** keyword. Semicolons are optional in Cliver.

```julia
# without initial value
var x;

# with initial value
var x = value
val y = value
```

```julia
# with type annotation
var x :: Type = value
val y :: Type = value

# with type signature
var :: Type
x = value

val :: Type
y = value
```

### Type Declaration

There are a whole bunch of standard types and the type system is flexible enought to let you define your own types. The type declarations are polymorphic so they do support overloading like with functions. They also support destructuring.

```julia
# type alias
type NewType = ExistingType
type NewType(a, b) = ExistingType
```
Type constructors can take parameters; the parameter can be a generic type, an abstract type or a concrete type.<br/>
If the parameter is not annotated with a type, then it is considered generic.<br/>
If the parameter is abstract, the parameter value should be a subtype of the specified type.<br/>
If it's a concrete type, the parameter value should be a literal value of that type.<br/>
```julia
# type constructor with parameters
type TypeCtor(a, b :: AbstractType, c :: ConcreteType) :: DataType = DataCtorA | DataCtorB(c, b)
```

#### Abstract and Concrete types

Abstract types have no values associated with them they are merely there for building the type hierarchy.<br/>
But however they can have a structural type definition.<br/>
An abstract type can inherit from another abstarct type.<br/>
Subtyping is only possible with Abstract types. The root abstract type is DataType.<br/>
Concrete types have one or more data constructors associated with them. All data constructors are publically accessable values.
```julia
# abstract type decalration
type AbstractCtor() :: DataType

# concrete type declaration
type ConcreteCtor() :: DataType = DataCtorA | DataCtorB
type ConcreteCtor() :: AbstractType = DataCtorA | DataCtorB
```

#### Type Constraints

type constraints follow the same rules as type constructor parameters.

```julia
type ConcreteCtor() :: DataType = DataCtorA | DataCtorB(a, b) where a :: Type
# multiple constraints
type ConcreteCtor() :: DataType = DataCtorA | DataCtorB(a, b) where (a :: Type, b :: Type)
```

#### Structural Typing

Structural typing defines the object structure of a type. They can have value assertion to check whether the value associated with the type meets certain conditions.

```julia
type AbstractCtor() :: DataType = {
    propertyA :: Type,
    methodB   :: Type
}

# with value assertions
type AbstractCtor() :: DataType = {
    value -> boolean_expression,
    propertyA :: Type,
    methodB   :: Type
}

# with lone value assertion
type AbstractCtor() :: DataType where value -> boolean_expression

# in concrete types
type InterfaceType = {
    propertyA :: Type,
    methodB :: Type
}

type ConcreteCtor() :: InterfaceType = DataCtorA | DataCtorB(a, b) where (a :: Type, b :: Type)
```

```julia

type Maybe(a) = Just(a) | None

type Iterable(a) = {
  map :: (a -> b) -> Iterable(b)
}

impl self :: Maybe(a)
	fun unwrap(): match self
		case Just(x): x
		case None: throw Error("Failed to unwrap Maybe value as it is 'None'")
end

impl Iterable(self) for self :: Maybe(a)
  fun map(f): match self
	case Just(x): Just(f(x))
	case None: None
end
```

#### Functions

Functions are the backbone of Cliver. There are 3 main types of functions.
Their base type is AbstractFunction.

##### UnitFunction

These are simple one-line function expressions.

```julia
# untyped
(...parameters) -> expression

# with type anotation
(paramA :: Type, paramB :: Type) :: Type -> expression
```

##### NamedFunctions

A function body has two varient

```julia
# inline varient
fun funName(...parameters): expression

# block varient
fun funName(paramA :: Type, paramB :: Type) :: Type
    # ...
end
```

The functions syntax is flexible enough to create constructs such as Constructors, Generators, Macros, etc.

```julia
# Constructor
fun FunName<self>()
    # ...
end

# Generator
fun FunName<yield, payload>()
    # ...
end

# Macro
fun FunName<macro>()
    # ...
end

# ...etc,.
```

##### AnonFunction

They are similar to NamedFunctions execpt they do not have a name.

```julia
# inline varient
fun(...parameters): expression

# block varient
fun(paramA :: Type, paramB :: Type) :: Type
    # ...
end
```

> If the type annotations of a UnitFunction gets out of hand, consider switching to an AnonFunction.

##### Operators as Functions

All operators in Cliver are just functions.<br/>
They can be referenced like functions and can be passed around like any other value.
```julia
# operator referance as callback
funName(argA, (+))
funName(argA, (*))

# operator invoked like a function
(+)(1, 2, 3, 4, 5) # 15
(*)(1, 2, 3, 4, 5) # 120
```

###### Do Expressions
a do expression can contain any number of statements and/or expressions and returns the last value inside of it.
```julia
val item = do
    # ...
    value
end
```

###### Function Pipeline Operation

In this operation, a value is passed through various functions and each function transforms it and passes the transformed value to the next function.
There are two type of pipeline operators in Cliver, transformation pipelines and error pipelines.
The pipeline syntax has two varients: point free pipelines and expressive pipelines.

```julia
# point free pipelines
value
    `` functionA # transformation pipelines
    `` functionB # transformation pipelines
    ?? e -> print(e) # error pipeline

# expressive pipelines
value as altVal
    `` functionA(altVal)
    `` functionB(altVal)
    ?? (e -> print(e))(altVal)
```

##### Infix Function Call

If a function accepts atleast 2 or optionally many arguments, then it can be called using infix function call notation.

```julia
    fun add(...n): # ...
    print(1 `add` 2) # 3
    print(10 `add` 10.5) # 20.5
```

###### External Callback Notation

It is an alternative to the below approach.
```julia
# without external callback and using regular callback
funName(argA, fun(...args :: ...Int) :: String
    # ...
end)
```

```julia
# with external callback notation
funName(argA, fun(...args :: ...Int) :: String) do
    # ...
end
```

### Object Oriented Programming

There are no classes in Cliver instead there are Constructor functions.

```julia
fun CtorFunction<self>(argA, argB)

    # constructor logic...

    @@where

    val propA = value
    fun methodB()
        # ...
    end
end
```

#### Accessors

Accessors, i.e getters and setters are special functions.

```julia

fun CtorFunction<self>()
    
    fun setVal<getter>()
        # getter logic
    end

    fun getVal<setter>(value)
        # setter logic
    end
end
```

#### Composition in Constructors

In Constructor functions, composition is done through import statements.<br/>
Cliver doesn't support inheritance in it's OO design.

```julia

type AType = Constructor() -> self { aProp :: Type }
type BType = Constructor() -> self { ...Object(AType), bProp :: Type }

fun :: AType
A<self>()
    # ...
    val aProp = value
end

fun :: BType
B<self>()
    # ...
	import ...AType from A()

    @@where ...AType
	
    val bProp = value
end
```

#### Static Constructors

The methods and properties of a static constructor is bound to the constructor rather than to the constructed objects.

```julia

fun CtorFunction<static>() :: static { propA :: Infer, methodB :: Infer }
    # static constructor logic...

    @@where

    val propA = value
    fun methodB()
        # ...
    end
end
```

#### Objects

Objects are similar to most other programming languages. They are created by Constructor functions.

```julia
CtorFunctionA()
CtorFunctionB()
```

##### Object Cascade Notation

The cascade notation is a syntatic form of the Builder design pattern.

```julia
objB()
    ..propA = value
    ..methodB()
    ..methodA()
```

### Control Structures

#### Conditionals

There are two types of conditionals in Cliver; if conditional and match expression.

##### If Conditional
There exists 3 syntatic variants of this construct.

```julia
# If statements - variant1

if condition
    # ...
end

if condition
    # ...
else
    # ...
end

if condition
    # ...
elseif condition
    # ...
end

if condition
    # ...
elseif condition
    # ...
else
    # ...
end
```

```julia
# If statements - variant2

if condition:
    expression

if condition
    # ...
else:
    expression

if condition
    # ...
elseif condition:
    expression

if condition
    # ...
elseif condition
    # ...
else:
    expression
```

There's another variant which makes use of pattern matching.
```julia
if expression as pattern
    # ...
end
```

The third variant is the if...else expression

```julia
print(if condition: expression else: expression)
```

##### Match Expression

Match expression is the pattern matching construct in Cliver.

```scala
val value = match expression
    case pattern:
        expression
    case pattern:
        expression
    case _:
        expression
```

#### Loops - the for loop

There exists only one looping construct in Cliver. It has atleast 6 variants.<br/>
The statement form of the for loop comes with a done block. It will execute when the loop ends.<br/>
The status of loop after execution can be on of:<br/>
1. `"broke"` - the loop was terminated with a break clause,
2. `"completed"` - the looping was completed successfully and it ran atleast once,
3. `"never"` - the loop never ran.

```julia
# for statements

for item in iterable
    # ...
end

for item in iterable
    # ...
done status
    # ...
end

for item in iterable
    # ...
done status:
    expression

# traditional C-style syntax
for(i = 1; i < x; i += 1)
    # ...
end

# syntatic equivalent of while loop
for condition
    # ...
end
```

There exists a **for** expression which returns an iterator and can be used in arrays and other data structures.

```julia
val arr = [for item in iterable: item]
```

**break** and **continue** are used to alter the execution of the loop and are only available within the for statement.

#### Error Handling Constructs

There are two main error handling constructs in Cliver and it is the **do...catch** and **error pipeline** operator.

##### Do-Catch construct
It is used for block level error handling.<br/>
do...catch construct comes with an optional done block.<br/>
It will execute after the execution of all do and catch blocks, regardless of the error.<br/>
The status of error handling can be one of three:<br/>
1. `"caught"` - there was an error and it was caught by a catch block,
2. `"uncaught"` - the error was not caught or an uncaught error was thrown,
3. `"success"` - the code ran without producing an error.
```julia
do
    # ...
catch e :: Type
    # ...
end

do
    # ...
catch e: # This form doesn't support type annotation
    expression

do
    # ...
catch e :: Type
    # ...
done status
    # ...
end

do
    # ...
catch e :: Type
    # ...
done status:
    expression
```

There's no expression variant of this construct.

##### Error Pipeline Operator

The error pipeline operator functions identically to the do-catch expression except it is used for inline error handling and can also be used in function pipelines.

```julia
val someVal = expression ?? callback
```

If an expression throws an error and the expression is enclosed withn a function then it can be used to return the error as an object from the function.
```julia
fun funName()
    val someVal = expression ?? x -> return x
end
```

##### Use Statements

These statements are used to enable and disable certain language features.
These can only appear at the top of a scope.
```julia
use "linting: force semicolons", "!feature: variable shadowing"
use "!typing: type inference"
```

##### Labels and As Expressions

**Labels** are used in conjunction with break and continue clauses in loops and **as expressions** create associations between a value and an identifier. They both are similar in syntax and in a way functions similar to an assignment operation.

```julia
# Labels
outer as for x in arr:
    inner as for y in x:
        if condition:
            break outer

# As expression
if expression as identifier
    print(identifier)
end

# As expressions are useful in anonymous functions since they could be used to enable recursion
funName(identifier as fun()
    # ...
    identifier()
end)
```

#### Primitive Types

Cliver has a wide variety of standard types.

##### Maybe

This type is inspired by haskell. It is handy when dealing with potential empty values.<br/>
Maybe is a type constructor containing two data constructors.

```julia
type Maybe(a) :: DataType = Just(a) | None
```

```julia
# handling a Maybe value
val :: Maybe(Char)
item = ['A', 'B', 'C'].find(x -> x == 'D')

print(item || 'not found')
```

```julia
# returning a maybe value
fun :: Array(Char) -> Char? # same as Maybe(Char)
findItem(arr)
    # ...
    return if found: Just(item) else: None
end
```

##### Mustbe

It is simply a compiler constant and is a type alias rather than being a distinct type.<br/>
The possible values of this type are primitive literals and expressions yielding primitive values that can be infered at compile time.<br/>
References types or runtime types are not permitted. Explicit type assertion is required for asserting Mustbe values.

```julia

name = "Abc" :: Mustbe(String)

name = f"Abc" # error

val newName = "Xyz"
name = newName
```

```julia
# returning Mustbe value
fun :: Int -> Infer
isEven(num)
    return num % 2 == 0 :: Mustbe(Boolean)
end
```

```julia
# handling Mustbe value
print(isEven(10)) # True

# to get the actual value True
print(match isEven(10) case n: n case _: False) # True
```

##### Boolean

This type constructor only contains 2 values, True and False

```julia
type Boolean() :: DataType = True | False
```

##### Number

Number is an abstract type containg many core number types.

**Int**<br/>

Eg: `-1, -2, 0, 1, 2, 3, ...`
There's also a Uint counterpart.<br/>

```julia
type Int :: DataType
type.sub(type :: Int)
# Union(Int8, Int16, Int32, Int128)
```
<br/>

**Float**<br/>

Eg: `-2.0, -0.5, 1.0, 1.5, 10.99, ...`<br/>
There's also a Ufloat counterpart.

```julia
type Float :: DataType
type.sub(type :: Float)
# Union(Float16, Float32, Float128)
```
<br/>

**BigNumber**<br/>

This type represents arbitary precision Numbers.<br/>
Eg: BigInt - `1!n, 2!n, -10000!n ...`<br/>
Eg: BigFloat - `1.2!n, -0.2!n, 11.5000!n ...`<br/>

```julia
type BigNumber :: DataType
type.sub(type :: BigNumber)
# Union(BigInt, BigFloat)
```

> BigFloat types are really only useful when used in conjunction with GenericIrrational or Fractional types
```julia
val Pi = 22!p / 7!p # :: GenericIrrational
val Tau = 2!p * Pi # :: GenericIrrational

val x = BigFloat(32, Pi), y = BigFloat(32, Tau)
print(x + y) # ...
```

<br/>

**Fractional**<br/>

This type represents a ratio or a fraction. This is the only concrete type in the subtypes of Rational.<br/>
Eg: `1//2, 1//4, 3//4 ...`<br/>

```julia
val fr :: Fractional(Int, Int) = 1//6
print(fr.numer, fr.denom) # Numerator(1) Denominator(6)
```

> Int, Float, BigNumber and Fractional are subtypes of Rational which itself is a subtype of Real.

**Irrationals**<br/>

There are 3 values for this type NaN, Infinites and Infinity.

```julia
type Irrational() :: Real = NaN | Infinites | Infinity
```

**Complex Numbers**<br/>
Eg: `1 + 2!im, 1!im, 2 - 3im, ... `<br/>
Unlike in mathematics, Complex is not a super type of Real rather they are sibling types in the type hierarchy.

###### Numeric Notations

**Base-2 - decimal**<br/>
Eg: `0b101, 0b1100, -0b1011, ...`<br/>

**Base-8 - octal**<br/>
Eg: `0o347, 0o6534, -0o5260, ...`<br/>

**Base-16 - hexadecimal**<br/>
Eg: `0xff460, 0xbc461, -0x20cae, ...`<br/>

**Scientific Notation**<br/>
Eg: `6.022!e + 23, 1.6!e - 35, -5.3!e + 4, ...`<br/>

###### Tagged Numbers

Numbers can be tagged by an identifier.

```julia
fun :: Uint -> Int
fact(n): n * fact(n - 1)

print(5!fact) # 120
```

###### Implicit Multiplication

When multiplying a number with a identifier, you can omit the (*) sign and deal with multiplications in a mathematically accurate notation.<br/>
Eg: `2x + 1, -3y(5 + 2), 2.25z, ...`

> Implicit multiplication involving 0 as the numeric operand is invalid however 0.0 is valid.<br/>
Eg: `0x, 0y + 4, ...`

##### Char

This data type represents either ASCII charactors or utf-8 unicode charactors.<br/>

Eg: ASCIIChar - `'A', '7', '!', ...`<br/>
Eg: UnicodeChar - `'🎉', 'Â', 'α', ...`<br/>

```julia
type Char :: DataType
type.sub(type :: Char)
# Union(ASCIIChar, UnicodeChar)
```

##### String

String is an Array of Char values.

Eg: ASCIIString - `"Abc", "$7ffG", "Ab*8", ...`<br/>
Eg: UnicodeString - `'🎉zzʑ', 'Âlp', 'α🕶ɜ', ...`<br/>
Eg: IdString - `\abC, \Bcd, \🎉ʑ01, ...`<br/>

```julia
type String :: Array
type.sub(type :: String)
# Union(ASCIIString, UnicodeString, IdString)
```

Strings are immutable but there exists a mutable version suffixed with `!`
```julia
# mutable String
"Abc"!
```

> Notice however that IdStrings such as `\Abc!` is not mutable even though it is suffixed with `!`

###### String Fragments

When strings are placed next to each other, they can merge into a single string.
```julia
print("abc" "def" "ghi") # abcdefghi

# with IdString
print(\abc\def\ghi) # abcdefghi
```
> This works with chars too; i.e they merge into a String in a similar fashion.

###### Mutiline Strings

If a string is formed with atleast 3 double quotes, it can span multiple lines and can include n-1 consecutive double quotes where n is the number of double quotes it began with.

```julia
"""
multiline
string
"""

""""
also
multiline
string
""""
```

```julia
# mutable multiline string
"""
multiline
string
"""!
```

###### Tagged Strings

Strings can be tagged to enable interpolation and form special constructs.

```julia
val world = "earth", punch = '!'
val greet = f"hello {world}$punch"

print(greet) # hello earth!

# with IdString
print\hello # hello
```
> tagging can also be done with multiline strings

##### Range

They can be finite or infinite.
```julia
type Range :: DataType

type.sub(type :: Range)
# Union(NumericRange, UnicodeRange, DateTimeRange)
```

```julia
# syntax
(start, step) to last
```

Eg: NumericRange
```julia
print(1 to 5) # 1 2 3 4 5
# same as
print((1, 1) to 5) # 1 2 3 4 5
```

Eg: UnicodeRange
```julia
print(\a to \d) # a b c d
# same as
print((\a, 1) to \d) # a b c d
```

> if the last element is the irrational value Infinity, the Range tends to positive infinity or if its Infinites it tends to negative infinity.

#### Collections

Most collections in Cliver are immutable and some even have mutable counterpart prefixed with exclamation mark.

##### Array
Arrays are the most basic collection type in Cliver.<br/>
The super type is AbstractArray. Array indexing starts at 1 rather than at 0

```julia
val items :: Array(Type) = [A, B, C, D]
```

Items of an Array are accessed used the square bracket notation.

```julia
items[1] # A
```

```julia
# mutable version
val items :: Array!(Type) = [A, B, C, D]!

# add a value to the end of the array
items.add(value)

# add a value at a specific index
items.add(value; index: i)

# update an existing index
items[i] = value

# remove an item at an index
items.drop(i)

# remove the first occurance of a value
items.drop(item: value)
```

The `in` operator can check for the presence of a value in an array.
Arrays support destructuring with the following syntax.
```julia
val [itemA, itemB] = items

fun(items.[itemA, itemB])
    # ...
end
```

Array comprehension is done using for expressions
```julia
[for item in items: if isValid(item): item]
```

##### Tuple

Tuples are immutable, fixed sized collections. They can contain multiple types and can have named arguments. Tuples are not iterable.
```julia
val :: Tuple(TypeA, TypeB; TypeC, TypeD)
items = (itemA, itemB; itemC, itemD: 0)
```

Values in a tuple are accessed using indexing just like Array. Also the indexing starts at 1.
```julia
items[1] # ValueA
items[\itemD] # ValueD
```

Values can also be accessed using destructuring
```julia
val (itemA, itemB; itemC) = items

fun(items.(itemA, itemB; itemC))
    # ...
end
```

##### Map
Maps contain key-value pairs. By default they are immutable.<br/>
The super type is AbstractMap.

```julia
val pairs :: Map(KeyType, ValueType) = {
    keyA: valueA,
    keyB: valueB
}

val pairs = {:} # empty Map
val pairs = {_:_} # empty Map
```

Mutable Maps can be formed using `!` suffix.
```julia
val pairs :: Map!(KeyType, ValueType) = {
    keyA: valueA,
    keyB: valueB
}!

# add a new entry
pairs.add(key: value)

# update an existing entry
pairs[key] = value

# remove an entry
pairs.drop(key)
```

Values within a map can be accessed using square bracket notation.
```julia
pairs[keyA] # valueA
```

> Any map that has an empty pair or that which contains atleast a single pair can have implicit keys; i.e the name of the identifier is the key of type IdString and the value being the value of the identifier
```julia
val pairs = {_:_, x, y, z}
```

The behaviour of the `in` operator varies with the lhs value when used on a Map.
```julia
print(keyA in pairs) # True
print((keyA: valueA) in pairs) # True
print((_: valueA) in pairs) # True
print((keyA: _) in pairs) # True
```

Maps support destructuring with the following syntax.
```julia
val {keyA, keyB as keyC} = pairs

fun(pairs.{keyA, keyB})
    # ...
end
```

Map comprehension can be done using for expressions
```julia
{for (key: value) in (pairs.keys, pairs.values): if isValid(key): (key: value)}
```

##### Set
The collection type Set is a mathematical construct that can only contain unique values.
```julia
val items = {} # empty Set
val items = {1, 2, 2, 3, 4, 1, 5} # {1, 2, 3, 4, 5}
```

Sets support union `(|)`, intersection `(&)` and other mathematical math operations.
They are immutable by default. The mutable version suffixed with `!`.

```julia
val items = {1, 2, 3, 4}!

items.add(5) # true - added
items.add(3) # false - not added
```

Like Arrays, Sets also support comprehension notation.
```julia
{for item in items: if isValid(item): item}
```

##### Matrix
It is another mathematical construct Cliver supports.
They are similar to Arrays but contains data in rows and columns.
```julia
val mat = [
	a, b, c;
	d, e, f
]

mat.shape() # 2//3 - two rows and 3 columns
```

#### Metaprograming

Macros are the backbone of Cliver's metaprogramming system.

##### Macro
A macro is a construct which can access and modify the AST structure of a supplied statement or expression.
```julia
# Example
fun runTime<meta>()
    @@where do

        import elapsed from Std\DateTime

        val start = elapsed()
        ${meta.raw}
        val stop = elapsed()
        print(stop - start + "ms")
    end
end

@runTime
for i in 1 to 100000
    print(i)
end

# prints: ---ms
```
