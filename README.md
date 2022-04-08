#### Import/Export

```julia
# native package
import pkg :: (Collection, Crypto, FileSys)
import stdin, stdout, fmt from pkg :: IO

# registered package
import pkg :: \UserFiles
import pkg :: \Commands\Configs
import ... from pkg :: WebSocket

# file structure
import "./dir/src/userfiles1.cli"
import "./dir/src/userfiles2.cli" as Abc
import ... from "./dir/src/userfiles4.cli", "./dir/src/userfiles5.cli"
```


#### Variables, Types, and Operations

```julia
var x :: Int
x = 5

var :: String
y = "hi"


# values

val :: Array
z = [ 4, 5, 6, 7 ]


```

#### Comments

```julia
# single line comment

#=
    multi-line
    comments
=#

```

#### Types

* Maybe<br/>
* Mustbe<br/>
* Boolean<br/>
* Number:<br/>
    * Real:<br/>
    	* Rational:<br/>
			* Bin, Oct, Hex, Exp<br/>
			* Int:<br/>
				* Int8, Int16, Int32, Int64, Int128,<br/>
			* Uint:<br/>
			    * Uint8, Uint16, Uint32, Uint64, Uint128,<br/>
			* Float:<br/>
			     * Float16, Float32, Float64, Float128,<br/>
			* Ufloat:<br/>
			     * Ufloat16, Ufloat32, Ufloat64, Ufloat128,<br/>
			* BigInt,<br/>
			* BigFloat<br/>
    	* Irrational:<br/>
			* NaN,<br/>
			* Infinites,<br/>
			* Infinity,<br/>
    * AbstractComplex<br/>
		* Complex,<br/>
		* Imaginary,<br/>
* AbstractChar:<br/>
    * Char,<br/>
    * ASCIIChar,<br/>
    * UnicodeChar,<br/>
* AbstractString:<br/>
    * String,<br/>
    * ASCIIString,<br/>
    * UnicodeString,<br/>
    * Byte,<br/>
    * Symbol,<br/>
* URef<br/>
* AbstractExpression:<br/>
    * RegExp,<br/>
    * GramExp,<br/>
    * BinarySyntaxTree,<br/>
* AbstractRange:<br/>
    * Range,<br/>
    * NumericRange,<br/>
    * UnicodeRange,<br/>
* AbstractCollection:<br/>
    * Array,<br/>
    * Map,<br/>
    * Set,<br/>
    * Trait,<br/>
    * Matrix,<br/>
    * Tuple, NamedTuple,<br/>
* AbstractFunction:<br/>
    * Function:<br/>
		* GenericFunction,<br/>
		* UnitFunction,<br/>
		* AnonFunction,<br/>
    * Constructor,<br/>
    * Generator,<br/>
    * Macro<br/>
* Object<br/>
> there exists mutable versions of many of these types suffixed with !

```julia
var q = "hello"
var r = 0
var s = true

type.of(2 + 3) # type :: Int64

type.is(type :: String, "abc") # True
```
#### Maybe - type :: Maybe
```julia
val may1 :: Number? = [1, 2, 3].indexOf(2)
# same as may1 :: Maybe(Number)
print(may1)
# ValueError: encountered an unattended Maybe value
print(may1 || NaN) # 2
# same as
print(alt@(NaN) may1) # 2
# same as
print(may1 ?? x -> NaN) # 2

var :: Int?
may2 = 1
may2 = None
```

#### Mustbe

```julia
# the values associated with Mustbe type must be known at the compile time

var must1 :: Mustbe(String)
must1 = @literal "Hello"
type.of(must1) # Mustbe(String)

var must2 :: Mustbe(Async(String))
must2 = @apparent await read("say something", stdin)
# Error

var must3 :: Mustbe(Maybe(Int))
must3 = @literal 5
# Error
```

#### Integers - type :: Int

* ranges from Int8 to Int128
* also
* ranges from Uint8 to Uint128

```julia
var :: Int16
i16 = -123

var :: Uint16
ui16 = 123

type.max(type :: Int)
# 9223372036854775807

type.min(type :: Int)
# -9223372036854775807
```

##### formats
* 5cffa!x - hex
* 127!o - octal
* 10011!b - binary

#### Arbitrary Precision Integers

```julia
var :: BigInt
bInt1 = BigInt(1234)

var :: BigInt
bInt2 = 1234!n
```

#### Floats - type :: Float

* Floating point numbers follow the IEEE 754 standard
* ranges from Float16 to Float128
* also
* ranges from Ufloat16 to Ufloat128

```julia
var :: Float16
f16 = -123.456

var :: Ufloat16
uf16 = 123.456
```

#### Arbitrary Precision Floats

```julia
var :: BigFloat
bFlt1 = BigFloat(1234.543)

var :: BigFloat
bFlt2 = 1234.543!n
```

**Infinity** and **-Infinity** for infinity, **NaN** is used for "not a number" and **Infinites** is used to denote an infinitesimal.

##### Elementary mathematical functions and operations

```julia
Math.round(123.7568) # 124
Math.sqrt(4) # 2
Math.cbrt(9) # 3
Math.exp(1) # 1
Math.log(10) # 1
Math.sin(60) # 0.567
Math.cos(30) # 0.345
Math.tan(0) # 1
# and many more...
```

#### Chained assignments

```julia
var a, b, c, d
a = b = c = d = 1

a = 1; b = 2; c = 3; d = 4

(a, b) = (b, a) # now a is 2 and b is 1

c = [ 0, 1, 2, 3, 4 ]
[ a, b ] = c

c = { \v: 0, \w: 1, 'x': 2, 'y': 3, 'z': 4 }
{ v, w } = c
# but can't { x, y, z } = c
```

#### Boolean operators

```julia
var t = True
var f = False

t && t # True
t || f # True
!t # False
```

#### Bitwise operators

```julia
a -& b # bitwise AND
a -| b # bitwise OR
-!c # bitwise NOT
a -^ b # bitwise XOR
a ->> b # bitwise right shift
a -<< b # bitwise left shift
```


#### Fractional and complex numbers

##### Complex numbers

```julia
3 + 5!im
0 - 2!im
-1 + 0!im
```

It is a parametric type
```julia
type.of(3 + 5!im) # type :: Complex(Int64, Int64)
```

also
```julia
cp = Complex(3, 5) # 3 + 5!im
cp.real # 3
cp.imag # 5
```

#### Fractional numbers

```julia
3//4
1//2
1//4
 
type.is(type :: Fractional(Int64, Int64), 1//2) # True
 
# also
fr = Fractional(1, 2) # 1//2

fr.numer # 1
fr.denom # 2
```

#### Characters

```julia
\a == 'a'
\b == 'b'
\c == 'c'
type.of(\a) # type :: Char
# ranges from 0!cx to ffffffff!cx
```

#### Strings

```julia
"Hi"
\greet

"""
    multiline double quote string
"""
```

Literal strings are always ASCII (if they only contain ASCII letters) or UTF8 (if they contain characters that cannot be represented in ASCII)

```julia
type.of("hello")
# type :: ASCIIString

type.of("Güdrun")
# type :: UTF8String

str = "Cliver"
str[3 to 5] # ive

greet = "hello"
world = "earth"
strIntrop = f"$greet {world + '!'}"

greet + " " + world # hello world
"hello" " " "world" # hello world
```

#### Symbols

```julia
\hello
\hi
```

#### URef

```julia
U\hello
U\hi
```

#### Formatting numbers and strings

```julia
name = "Pascal"

fmt("Hello, %s \n", name)
# returns Hello, Pascal

# d for integers
fmt("%d\n", 1!e ^ 5) # 100000

	
# f = float format, rounded if needed
fmt("x = %0.3f\n", 7.35679) # x = 7.357

# or to create another string
str = fmt("%0.3f", 7.35679) # 7.357


# e = scientific format with e
fmt("%0.6e\n", 7.35679) # 7.356790e+00

# c = for characters
fmt("output: %c\n", 'α') # output α

# s for strings
fmt("%s\n", "I like Cliver")

# right justify
fmt("%50s\n", "text right justified!")

```

#### Regular Expressions

```julia
var :: RegExp
regexp = re"(h | y) ellow?""gims"
# same as re"(h | y) ellow?".flags("gims")
# re@("gims") "(h | y) ellow?"

var :: Maybe(RegExpMatch)
test1 = regexp.match("hello"),
test2 = regexp.match("yellow")

print(test1 || test2 || "no match found")
```

#### Gramatic Expressions

```julia
x = 124
var gramexp = gr"""
    -- this is a comment
    $ignore _space
    $import "x"
    $consider _case -- case sensitive
    addition ::= NUMBER PLUS NUMBER
    PLUS ::= "+"
    NUMBER ::= \-? \d+ (\.\d+)? | (\-? \d+)? \.\d+
    $return addition
""".flags("gims")
gramexp(expr :: (1 + 2)).match
gramexp("1 + 2").match
```

#### Ranges and Arrays

```julia
var :: Range
ra = (1, 2) to 20

var :: Range(Number)
nra = 2 to 20

var :: Range(Char)
cra = \a to \z

ra = (1, 2) to 10

ra = 1 to 10 # same as (1, 2) to 10

ra = 1 to Infinity # same as (1, 2) to Infinity
# same as (1 ; step: 1) to Infinity

```

#### Array

* Cliver arrays start indexing from 1
* Arrays are immutable by default. There exists a mutable counterpart Array!

```julia
var :: Array(Int).{ length = 4 }
arr = [1, 2, 3, 4]

arr[1] # 1
# arr.1

arr.length # 4

arr[1 to 3] # [1, 2, 3]

arr[5] = 5 # Error

var :: Array!(Int).{ length = 4 }
arr! = [1, 2, 3, 4]!

arr![5] = 5 # 5
```

**There is also:**<br/>
```julia 
    Array.drop(index) # gets any index
    Array.first() # gets first index
    Array.last() # gets last index
	
    Array.add(index, item) # sets at any index
    Array.first(item) # sets at first index
    Array.last(item) # sets at last index
```

* the above are all immutable methods, meaning they don't modify their parent array
* mutable methods by the same name also exist for mutable arrays - drop!, add!, first!, last!, etc.

#### Map, Filter and Array Comprehensions

```julia
var :: Array(Int)
primes = [2, 3, 5, 7, 11]

primes.map(x -> x * 2) # [4, 6, 10, 14, 22]
# same as

primes.map(fun(x)) do
    x * 2
end

primes.filter(x -> x %2 == 0) # [2]

[ for x in 1 to 10: x ]
# [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
```

#### Other Collection Types

#### Set

> sets are immutable and there're no mutable counterparts for them.

```julia

var :: Set(Int)
set = { 1, 2, 3, 4 }

set[1] # 1
# set.1

2 in set # True

```

#### Map
> maps are immutable by default. However there exists a mutable counterpart Map!

```julia
var :: Map(Int | String: String)
# same as Map(Pair(Int | String, String))
map = {
    \wow: "how",
    "hello": "hai",
    5: "bye",
    (3: "lie")
}

5 in map # False
# means (5: 5) which isn't present
(5: _) in map # True
(5: "bye") in map # True

map["hello"] # "hai"
```

#### Trait
> traits are immutable by default. However there exists a mutable counterpart Trait!

```julia
var :: Trait.{
    fun :: Int -> Int
    fun :: (Int, Int) -> Int
    fun :: ...Int -> Int
}

trait = @Trait {
    a -> a,
    (b, c) -> a * b,
    (...d) -> (+)(...d),
}

trait(1) # 1
trait(1, 2) # 2
trait(1, 2, 3) # 6

(type :: Infer -> Infer) in trait # True

var trait! = @Trait {
    a :: Int -> a,
    (b, c) -> a * b,
    (...d) -> (+)(...d),
}!

trait!.add(
    c  -> print("closed"), type :: Char -> Infer)
```

#### Matrix
> matrix is immutable and there's no mutable counterpart for it.

```julia
var :: Matrix(Int).{ shape = 3//3 }
matrix = [
	1, 2, 3;
	4, 5, 6;
	7, 8, 9;
]

matrix[1//2] # 2
```

#### Tuple
> tuple is immutable and there's no mutable counterpart for it.

```julia
var :: Tuple(Int, String, Boolean, Float)
tuple1 = (1, "hi", True, 4.5)
# same as
# tuple1 = val(1, "hi", True, 4.5)

tuple1[1] # 1
# tuple1.1
```

#### NamedTuple
> it is immutable and there's no mutable counterpart for it.

```julia
var :: NamedTuple(Int, String, Boolean; Int, Char)
ntuple1 = var(_, _, _; a, b)
# _ specifies a default value

var tuple2 = ntuple1(1, "hi", True; a: 7, b: 'b')

print(tuple2.1, tuple2.b) # 1, 'b'
```

#### Dates and Times

```julia
var initial = DateTime.elapsed()
# --------------------------
# long computation
# ---------------------------
var final = DateTime.elapsed()
var time_elapsed = final - initial
print(f"Time elapsed: $time_elapsed")

DateTime.now() # "10:30:67 22/08/2014"
DateTime.now(\time) # 10:30:67
DateTime.now(\hour) # 10
DateTime.now(\minute) # 30
DateTime.now(\second) # 67

DateTime.now(\date) # 22/08/2014
DateTime.now(\day) # 22
DateTime.now(\month) # 08
DateTime.now(\year) # 2014

DateTime.sleep(500)
DateTime.setImmediate(fun) do  smt() end
DateTime.setInterval(1000, fun) do  smt() end
DateTime.setTimeout(2000, fun) do  smt() end
```

#### Functions

#### Defining functions

```julia
fun :: String -> Infer
greet(name)
    print("hello " + name)
end

fun greet(name): print("hello " + name)

@call
fun greet()
    print("greetings!")
end

call@(99)
fun(age)
    age + 1
end
```

#### Optional and Keyword Arguments

```julia

fun :: (Int, Int) -> Int
add(a, b = 10): a + b

fun :: (Int, Int ; Int, Int) -> Int
add(a, b = 10; c, d = 2):
    (a + b) - (c * d)

fun :: (...String ; ...String) -> IO
add(...pos_args; ...named_args):
    print(pos_args, named_args)
```

#### Pure Functions
> pure functions must not produce a side effect

```julia
fun greet<pure>(x)
    print(x) # error
end

fun greet<pure>(x): "hi" + x
```

#### Anonymous Functions

```julia
fun(x): print(x)

# same as
fun(x, y)
    print(x)
    print(y)
end

```

#### UnitFunctions

```julia
() -> print("hello")

x -> print(x)

x -> do
    print(x * 2)
    print(x * 3)
end

```

#### IIFE

```julia
(x -> print(x))("hello") # hello
# same as

call@("hello")
x -> print(x) # hello


(fun(x): print(x))("hello")
# same as

call@("hello")
fun(x): print(x) # hello

@call
fun greet()
    print("greetings")
end

```

#### Pipeline Operator

```julia
var pipeline = 5
    `` square
    `` root
    `` power(val, ?)
    `` x -> sin(x)
    `` x -> (1 + x)
    ?? e -> print(e)

# same as

pipeline = 5 as arg
    `` square(arg)
    `` root(arg)
    `` power(val, arg)
    `` sin(arg)
    `` 1 + arg
    ?? e -> print(e)

```

#### Error Dejection Operator

```julia
fun err(e): type.of(e)

var file = await FileSys.File("file-name.txt") ?? err

var fileContent = await file.read() ?? err
print(fileContent)

# same as

file = try:
        await FileSys.File("file-name.txt")
    catch e: err(e)

fileContent = try:
        await file.read()
    catch e: err(e)

print(fileContent)

```

#### Generic Functions and Multiple Dispatch

```julia
fun greet(): print("hello")

fun greet(name): print("hi ", name)

fun greet(name, age):
    print("hi ", age, " year old ", name)

fun :: (Number, Number) -> Number
add(num1, num2): num1 + num2

fun :: (Number, String) -> Number
add(num1, str1):
    num1 + parse(type :: Int, str1)

```

#### Generators

```julia
fun :: Generator(() -> String, Char -> Int)
generate<yield, payload>()
    print(payload) # 'a'
    yield 10
	
    print(payload) # 'b'
    yield 20
	
    print(payload) # 'c'
    yield 30
	
    print(payload) # 'd'
    yield 40
	
    print(payload) # 'e'
    return "string value"
end

generate()
    ..next('a') # 10
    ..next('b') # 20
    ..next('c') # 30
    ..next('d') # 40
    ..next('e') # "string value"
    ..next('f') # (end)
# when done, it returns the (end) operator

for n in generate():    print(n)
```

#### Object Oriented Programming

#### Constructor Functions

```julia
type Human = Object.{
    intelligence :: String,
    consciousness :: Boolean,
    defineTraits :: ...Options -> Trait
}

type Mammal = Object.{
    isNocturnal :: Boolean,
    height :: Int,
    weight :: Int,
    speed :: Float
}

type Student = Object.{
    IQ :: Float,
    skills :: Array(String),
    favSubject :: String
}

type Person' = Object(Human, Mammal, Student).{
    date :: DateTime,
    id :: Hex(Int),
    job :: String,
    lives_in :: String,
    greet, farewell :: ...(String -> Void),
    _salary :: Int,
    salary :: Getter(Int),
    salary :: Setter(Int -> Void),
    _handleDeletion :: EventData -> Void,
    macro :: Macro(MetaData -> Void),
}

fun :: Constructor((String, String, String) -> Person')

Person<self>(var name, var age, var address)
	
    var self.date = DateTime.now()
    var self.id = 123ffce!x
	
    Person.mindset = "neutral"
	
    @@where
	
    import ... from Mammal(215, "bye"), Human(125, "hi"), Student(512, "yay")
	
    var job = "programmer"
	
    var lives_in = "India"
	
    fun greet(word)
	print(f"$word from {self.name}")
    end
	
    fun farewell(word)
	print(f"$word from {self.name}")
    end
	
    var _salary = 3000
	
    fun salary<getter>(): _salary
	
    fun salary<setter>(value)
	if value < 50 ^ 10
	    self._salary = value
	else
	    throw BoundError("")
    end
	
    onevent@(\delete)
    fun _handleDeletion(evt)
	# event handler logic
    end
	
    fun _macc<meta>()
	# macro definition
    end
end

fun Person<static>()
    # static constructor logic
    @@where
    var mindset = "positive"

    fun getMood()
        if mindset == "positive"
	    print("happy")
	elseif mindset == "neutral"
	    print("pleasant")
	else
	    print("sad")
	end
    end

end
```

#### AsyncFunction

```julia
fun :: AsyncFunction(String -> String)
@async sayHello(word)
    var name = await FileSys.File("/file.txt").read()
    var greet = name + word
    return greet
end
```

#### Object

```julia
var :: Person
person = Person("John", 100, ["a", "bb", "ccc"])

person.greet("hello") # hello from John
person.getMood() # pleasant
Person.getMood() # happy

print(person.salary) # 30000
person.salary = 40000
print(person.salary) # 40000
```

#### Cascade Notation

```julia
person
    ..name = "Jack" # Jack
    ..greet("hello") # hello from Jack
    ..getMood() # pleasant
```

#### Object Literal

```julia
var obj = @Object {
    var color = "red"
    fun fill()
	# implementation logic
    end
    fun stroke()
	# implementation logic
    end
}

type.of(obj) # type :: Object
```

#### Control Flow

#### Conditional Evaluation

```julia
var num = 7

if num > 10
    print("greater")
elseif num < 10
    print("lesser")
else
    print("equals")
end

# same as

num = 7
if num > 10
    print("greater")
elseif num < 10
    print("lesser")
else
    print("equals")
end
	
var sign = if num >= 0: 1 else: -1

var x = 7
var y = if case x:
    case 1: "sunday"
    case 2: "monday"
    case 3: "tuesday"
    case 4: "wednesday"
    case 5: "thursday"
    case 6: "friday"
    case 7: "saturday"
    case 8 | 9 | 10: "hello Martian!"
else: "invalid"


print(y) # "saturday"

```

#### The For loop

```julia
x = 1
for x < 100
    print(x)
end

for x < 100
    print(x)
done s
    print(x ^ 2)
end

for(x = 1; x < 10; x += 1)
    print(x)
end

arr = [1, 2, 3, 4, 5, 6, 7]
for (k: v) in arr.pairs
    print(v)
end

for v in 1 to 10
    print(v)
end

# same as

for v in 1 to 10: print(v)
```

#### The break and continue statements

```julia
for x <= 100
    if x % 5 == 0
        continue
    elseif x == 77
	break
    else:
	print(x ^ 2)
end
```

#### Exception Handling

```julia
var codes = ["AO", "ZD", "SG", "EZ"]
if code in codes
    print(f"This is an acceptable $code")
else
    throw DomainError()
end

var a = []
try
    a.drop!()
catch ex :: DomainError
    print(type.of(ex))
catch ex :: IndexError | RangeError
    print(type.of(ex))
catch ex
    print(type.of(ex))
done s
    print("finished")
end

```

#### More on Types, Methods & Modules

#### Type Signatures and Conversions

```julia
var :: Int16
a = 16

var :: String
b = "hello"

# same as
var c :: String = "125"
```

#### Type Conversions and Promotions

```julia
type.parse(type :: Int16, 12) # 12
type.parse(type :: Int32, "121") # 121

type.promote(1, 2.5, 3//4) # 1.0, 2.5, 0.75
type.promote(1.5, 1!im) # 1.5 + 0.0!im, 0.0 + 1.0!im

type.promote(True, \c, 1.0) # 1.0, 99.0, 1.0
```

#### The type hierarchy – subtypes and supertypes

```julia
type.of(type :: Int64) # type :: Signed

type.of(type :: Signed) # type :: Integer

type.of(type :: Integer) # type :: Real

type.of(type :: Real) # type :: Number

type.of(type :: Number) # type :: Primitive

type.of(type :: Primitive) # type :: DataType

type.subs(type :: Integer)
# type :: Any(BigInt, Bool, Char, Signed, Unsigned)

type.subs(type :: Signed)
# type :: Any(Int128, Int16, Int32, Int64, Int8)

type.subs(type :: Int64)
# type :: Any
```

#### Concrete and Abstract Types

Concrete types have no subtypes and might only have abstract types as their supertypes.
```julia
type ImConcreteType(a) :: ImAbstractType = ImConcreteType(Int, a)
```

An abstract type (such as Number and Real) is only a name that groups multiple subtypes together, but it can be used as a type annotation or used as a type in array literals.
```julia
    type Cardinal :: DataType
```

#### User Defined and Composite Types

```julia

type Point :: Cardinal = Point(Float64, Float64, Float64) | Point(x: Float64, y: Float64, z: Float64)

var p1 = Point(1, 2, 3)
# (p1.1, p1.2, p1.3) == (1, 2, 3)

var p2 = Point(x: 1, y: 2, z: 3)
# (p2.x, p2.y, p2.z) == (1, 2, 3)
```

#### Constrained Types ####

* a type constrain must evaluate to a boolean
* compile time constrains - must be immutable and pure

```julia
val :: String .{x -> x in ["hello", "hi", "howdy"]}
consT1 = "hi"

# runtime constrains - may be mutable and impure
val :: Array(Int) .{x -> x.every(x -> isPrime(x))}!
consT2 = [1, 2, 3, 4]
```

#### When are two values or objects equal or identical?

```julia
var i16 = 125 :: Int16
var i64 = 125 :: Int64 # default
var d = { 'a': 100, 'b': 200, 'c': 300 }

i16 == i64 # True
i16 is i64 # False
i16 is! i64 # True

var a = 50

(_: 100) in d # True
(\a: _) in d # True
(\a: 100) in d # True

(_: 100) in! d # False
(\a: _) in! d # False
(\a: 100) in! d # False
```

#### Metaprogramming

#### Expressions and Symbols

```julia
expr :: (1 + 2)
expr :: $do
    var a = 5
    var b = 2
    a + b
end
```

#### Eval and Interpolation

```julia
var e1 = Expr(\call, ((*), 3, 4))
# expr :: ((*)(3, 4))


var a = 4
stmt :: $do
    var b = 1
    var e5 = ${a} + b
end # stmt :: var e5 = 4 + b
```

#### Defining Macros

Macro takes the input expressions and returns the modified expressions at parse time

```julia
fun macint<meta>()
    expr :: $do
        print("start")
	${ meta.eval() }
	print("after")
    end
end

@macint print("Where am I?")
#=
start
Where am I?
after
=#
```

#### I/O, Networking, and Parallel Computing

#### Basic input and output

#### Channels

```julia
var :: Channel(String)
chan1 = Channel(\server; default: "", capacity: 4)
# a channel can be a
# \sender, \receiver or \server
# \server is the default

chan1.capacity # 4
chan1.queued # 0

@async
fun channeler1(ch)
    print(~ch)
end

await channeler1(chan1)
chan1 <~ "hello world!"
# prints "hello world!"

chan1.close()

@async
fun channeler2(ch)
    for(v = 1; v <= 4; v +=1)
	ch <~ "hello world!"
    end
    ch.close()
end

var chan2 = Channel()

await channeler2(chan2)

for true
    var res = ~chan1
        if res is (end)
	    print("Channel Closed")
	    break
	end
    print("Channel Open: ", res)
end

var chan3 = Channel(capacity: 4)

@async do
    chan3 <~ "first"
    chan3 <~ "second"
    chan3 <~ "third"
    chan3 <~ "fourth"
    chan3.close()
end

for res in chan3:    print(res)

```

* Cliver IO is stream-oriented
* Stream is the Fundamental Stream Type
* IO is its subtype

```julia
var stream = IO.stdin
for line in stream.lines:
    print(f"Found $line")

var file = File("example.dat")

for line in file.lines
    print(line)
done m
    file.close()
end
```

#### TCP Sockets and Servers

```julia
var server = HTTP.serve({ \port: 8080 })

@async
for req in server
    req.respond({ \body: 'Hello World\n' })
end
```

#### Parallel Operations and Computing

```julia
for pid in workers()
    # do something with each process (pid = process id)

end

@parallel
for i in 1 to 100000
    arr[i] = i
end
```

#### Running External Programs

#### Running Shell Commands

```julia
Shell.pwd() # "c://test"
Shell.cd("c://test//week1")
Shell.ls()

var cmd = "echo Cliver is clever"
Shell.run(cmd) # returns Cliver is clever

Shell.run("date")
# Sun Oct 12 09:44:50 GMT 2014

cmd = r"cat file1.txt" # raw string

Shell.run(cmd)
# prints the contents of file1.txt
```

#### Calling C and FORTRAN

```julia
var lang = FFI.C(val(\getenv, "libc"), type :: Ptr(Uint8), type :: Ptr(Uint8), "LANGUAGE")
```

FFI - Foreign Function Interface
In general, C function takes the following arguments:

	A (\function, "library") tuple with the name of the C function (here, getenv) is used as a symbol, and the library name (here, libc) as a string
	The return type (here, type :: Ptr(Uint8)), which can be any bitstype, or type :: Ptr

	A tuple of types of the input arguments (here, (type :: Ptr(Uint8)), note the tuple)

	The actual arguments if there are any (here, "LANGUAGE")
=#

#### Calling Python

```julia
FFI.Python.eval("10*10") # 100

@FFI.pyimport "math"
math.sin(math.pi / 2) # 1.0
```

#### Calling JavaScript

```julia
FFI.JavaScript.eval("10*10") # 100
FFI.JavaScript.eval("Math.PI * 2") # 6.2857
```
