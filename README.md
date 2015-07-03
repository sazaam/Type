Type.js
====

Essential Type and Packages for Javascript
==


Introduction :
===

Type is an attempt to bring heavy OOP into Javascript, providing 
Class-like practices, Inheritance, Type declarations and checks.

Type is a base helper to store your Class declarations as namespaces, and orchestrize them
as packages in your project.

Basically, good features of this solution are :

- Clarity and cleanlyness of code :
	- all the Class declaration is regrouped.
	- Scopes are limited, as in all OOP languages.
	- Namespace stands on first line, making big loads of sequential declarations really readable.
	- Regrouping by order, regrouping by package, or no regrouping at all.
	- Private sets of classes inside of public Package decl. 
	- Control visibility of declaration in Application Domain(s) from the declaration itself.
	- Allows clean code debugging on FF/Chr/Saf , throwing a nice toString for Classes and their Methods.
	(trace(MyClass.initialize)) // function Initialize(_array, _orderBy) // even params
	- comes with debugging 'trace' method, that enhances 'console.log' to all browsers.
	
	
- OOP implemented on heavy expectations :
	- The use of native 'instanceof' should be the one and only master-check you'll use
	to determine type from your code.
	- Can create Mixin Classes, Subclasses, with possibility for both to decide their response to 
	the 'instanceof' check.
	- Allows (multiple) Interfaces declaration
	- Allows static Classes
	- Allows static properties inside Class.
	- Always safe prototype duplicating, so no native prototype extending, so no overheating/promoting native JS objects
	- Every new class share exactly same proto, but inheriting class dont copy the proto, creates its own declaration proto.
	- Classes build hidden ClassDeclaration classes.
	- Allows clean code debugging on FF/Chr/Saf 
	
- Organizing patterns
	- Namespaces are implemented as 'com.example.mypkg.myclass' or 'com.example.mypkg::myclass'
	- Many possible Nomenclatures :
		- Classes can all figure in their Package declarations
		- Classes can instead be declared in a more raw way, with no Package declarations but 
		still declaring their belonging to that Package.
		- Classes can actually be declared and registered or just be cache-free for brief use.
		- Classes will all respond to same criteria, even if extended from other libs' protos 
		(jQuery objects, events for example)


		
		
Overview :
===

Two actual ways to declare Objects with Type :


1. through Type.define

		var AbstractExample = Type.define({
			pkg:'com.example.mypkg.examples',
			constructor:AbstractExample = function AbstractExample(id){
				this.id = id ;
			},
			destroy:function destroy(){
				trace('example destroyed...') ;
				return undefined ;
			}
		}) ;
		
		var Example = Type.define({
			pkg:'com.example.mypkg.examples',
			inherits:AbstractExample,
			constructor:Example = function Example(id){
				Example.base.apply(this, arguments) ;
				this.id = id ;
			}
		}) ;
		
		var ex = new Example('test_example') ;
		
		trace(Example) ; 
			// [Class com.example.mypkg.examples::Example]
		trace(Example === Type.definition('com.example.mypkg.examples::Example')) 
			// true
		
		trace(ex instanceof AbstractExample) // true
		trace(ex.destroy) ; // function destroy(...)
		trace(ex = ex.destroy()) ; // undefined
	

2. through Pkg.write :
	
	
		Pkg.write('com.example.mypkg', function(){
			
			var AbstractExample = Type.define({
				pkg:'examples',
				constructor:AbstractExample = function AbstractExample(id){
					this.id = id ;
				},
				destroy:function destroy(){
					trace('example destroyed...') ;
					return undefined ;
				}
			}) ;
			
			var Example = Type.define({
				pkg:'examples',
				inherits:AbstractExample,
				constructor:Example = function Example(id){
					Example.base.apply(this, arguments) ;
					trace(this.id) ; // test_example
				}
			}) ;
			
			var ex = new Example('test_example') ;
			
			trace(Example) ; 
				// [Class com.example.mypkg.examples::Example]
			trace(Example === Pkg.definition('com.example.mypkg.examples::Example')) 
				// true
			
			trace(ex instanceof AbstractExample) // true
			trace(ex.destroy) ; // function destroy(...)
			trace(ex = ex.destroy()) ; // undefined
			
		}) ;
	
	
	
	you can also declare multiple definitions at once without Type define,
	in an other way :
	
	
		var Example = Pkg.write(
			'com.example.mypkg.examples', 
			{
				domain:Type.appdomain, // which is generally window if not set to something else
				constructor:function AbstractExample(id){
					this.id = id ;
				},
				destroy:function destroy(){
					trace('example destroyed...') ;
					return undefined ;
				}
			},
			{
				domain:Type.appdomain,
				inherits:'com.example.mypkg.examples::AbstractExample',
				constructor:Example = function Example(id){
					Example.base.apply(this, arguments) ;
					trace(this.id) ; // test_example
				},
				destroy:function destroy(){
					trace('example destroyed...') ;
					return undefined ;
				}
			}
		) ; 
	
		trace(Example) ;
		var s = new Example('test_example') ;
		trace(s) ;
		trace(s instanceof AbstractExample) ;


	When multiple Class declarations objects are provided sequentially to the same path location,
	the returned class shall be the last of passed parameters, once registered.
	Here, the first 'var Example = Pkg.write(...' stores the Example Class definition passed in last.

	
Fine about the declaring, let's pass to potential needs of yours along with that system.

Any anonymous object can be passed to Type.define or Pkg.write, those two will just check for a few properties in'em 
and treat them consequently.

Key-properties :
- pkg
- domain
- constructor
- protoinit
- statics
- inherits
- mixins
- interfaces


Pkg - Namespace as a string

As you may understand, redundant pkg specifications are to avoid for clarity, 
so this pkg property is mostly unrequested except some cases.
When pkg is defined previously, such as Pkg.write('custom.ns', myClass) no need for Pkg property.
Only requested if either you want to make deeper pkg inside of previously declared Pkg, 
or if you have no constructor for example, and wish to pass the name of your class object this way :
	
	Pkg.write('custom.utils', {
		pkg:'::StringUtil',
		statics:{
			test:function test(){...}
		}
	}

	// Class StringUtil exists

Domain - Object

The domain property let you choose which scope to push the shorthand alias to, between 3 modes :
- in window.
- in Type.appdomain, that is naturally set to be window, but can be changed.
- in Type.globals, which is the considered private globals of your needs if you need a separate space.
- in none, only accessible via namespaces selectors.
	
Constructor - Function

OK, so here is some of the trick, we'll have REAL instanceof checks because our 'anonymous' object
is passed WITH a constructor, so he already kind of leaves anonymous state, that's why it is good practice to 
further name even that constructor's function body ( constructor:function Myclass()... ).
This constructor property won't be changed and will remain as well the own Class' constructor.
There is important point on constructor.
IE < 7 has very issues understanding constructor notions like everybody, and thus when you have :


	var MyClass = function MyClass(){
		trace(MyClass.staticProp) // exists., and MyClass is really a Class, The Class.
	} ;


but here :

	function MyClass(){
		trace(MyClass.staticProp) // MyClass is a temporary clone-or-so of the future object, but 
		// for now won't know the full class model - is just a closure.
	} ;

So for IE < 7, we need not to forget to rewrite the function name with a variable of same name,
just to ensure we're really talking to the desired fella.
in the anonymous object case :

	var MyClass = Type.define({
		inherits:'test::MyClassSuperClass',
		constructor:Myclass = function MyClass(){
			// in that case, you'll have full access to Object's Static Model
			Myclass.base.apply(this, arguments) ; // a proper super() simulation
			// Myclass really is the definition, even in IE.
		}
	]) ;

If you don't need the super() feature in constructor (but you'll need it), you can omit this part,
but it is really good advice to put everywhere and please His Majesty IE, as we know its pickyness.
	
	
	
Statics - Object

Statics is another anonymous object that lists all static methods and properties you want for your class.
if the 'initialize' method figures, it shall be launched just as it is registered as a Definition.
initialize(definition, domain){
	trace(definition) ; // first argument is the Class Model Object
	trace(domain) ; // second is its allocation Domain
}
	
	
Protoinit - Function protoinit()

The protoinit is the same as the statics initialize, but will occur before the static initialize, and will 
be scoped on the prototype definition instead of the class definition.
protoinit(proto, domain){
	trace(proto) ; // first argument is the Class Prototype
	trace(domain) ; // second is its allocation Domain
}


Inherits - Object

The way to extend a superclass.
accepts namespace strings, Object definitions, other objects, and Type's internal Slot objects 
that we will examine later.

Mixins - Array

The way to copy prototypes of multiple superclasses, without extending them (or beeing instances of these superclasses).
Indeed, on the opposite way Inherits does, the prototypes extended through mixins will respond 'false' to 'instanceof' checks.
Mixins are also passable in parameters of Type.define : 

	var Myclass ;
	Type.define({
		constructor:MyClass = MyClass {
			[...]
		}
	}, MyExtendMixin, MyExtendMixin2, [MyMixinSet1, MyMixinSet2, ...], ...)

they remain writable in the definition object :

	var Myclass ;
	Type.define({
		mixins:[My ExtendedMixin, [MyMixinSet1, ...], ...], // must be an array here, should it be an array of one
		constructor:MyClass = MyClass {
			[...]
		}
	})

but if there are any passed in parameters, your 'mixins' array in definition object will be lost
overriden by those passed in parameters.

You have access to those mixins anyway through the 'model' property of Slot Objects in Classes, as we'll see in API.

	var MyClass ;
	Type.define({
		inherits:EventDispatcher,
		constructor:MyClass = function MyClass(){
			trace(this)
			trace(MyClass.slot.model.mixins[0]).apply(this, [window]) ;
			
			var t = this ;
			// ready as an EventDispatcher
			this.bind('load', function(e){
				trace('LOAD', e.type)
			})
		}
	}, IEvent, {
		constructor:function doThis(){
			trace("I should probably do this") ;
		}
	})

By the way something you never should want to do, combine Event and EventDispatcher, but if you still want you can.



Interfaces - Array

As in most OOP languages, interfaces can be declared in order to crash app in case of 
incorrect/missing implementation subclasses.
Note : The implement checking execution occurs at end of Class creation, allowing you to have dynamic 
implementations at Model-parsing, Protoinit, or static declaration states, before the class checks for 
having right implementation methods...
The recommended way of declaring interfaces :

	var IAbstractExample = Type.define({
		pkg:'com.example.mypkg.examples::@IAbstractExample',
		methodToImplement:function methodToImplement(msg){}
	}) ;
	
	// Interfaces can be extent as well and thus inherit methods from superinterface
	
	var IExample = Type.define({
		pkg:'com.example.mypkg.examples::@IExample',
		inherits:IAbstractExample
	}) ;

... later...
	
	
	var Example = Pkg.write(
		'com.example.mypkg.examples', 
		{
			domain:Type.appdomain,
			inherits:'com.example.mypkg.examples::AbstractExample',
			interfaces:[IExample],
			constructor:Example = function Example(id){
				Example.base.apply(this, arguments) ;
				trace(this.id) ; // test_example
			},
			// methodToImplement:function methodToImplement(msg){} // commenting this in order to make it crash...
			destroy:function destroy(){
				trace('example destroyed...') ;
				return undefined ;
			}
		}
	) ;
	
	// OUTPUTS
	// TypeError:  NotImplementedMethodException com.example.mypkg.examples.@IExample::methodToImplement() absent from class com.example.mypkg.examples::Example
	
	
And even later it could all look like this :
	
	
	Pkg.write(
		'com.example.mypkg.examples', 
		{
			pkg:'interfaces::@IAbstractExample',
			methodToImplement:function methodToImplement(msg){}
		},
		{
			pkg:'interfaces::@IExample',
			inherits:'interfaces::IAbstractExample'
		},
		{
			pkg:'abstracts',
			constructor:function AbstractExample(id){
				this.id = id ;
			},
			destroy:function destroy(){
				trace('example destroyed...') ;
				return undefined ;
			}
		},
		{
			pkg:'::Example',
			inherits:'abstracts::AbstractExample',
			interfaces:['interfaces::IExample'],
			constructor:Example = function Example(id){
				Example.base.apply(this, arguments) ;
				trace(this.id) ; // test_example
			},
			methodToImplement:function methodToImplement(msg){},
			destroy:function destroy(){
				trace('example destroyed...') ;
				return undefined ;
			}
		}
	)

	var Example = Type.definition('com.example.mypkg.examples::Example') ;
	var s = trace(new Example('test_example')) ;
	// object Example{id:'test_example', ...}
	trace(s instanceof 
		Type.definition('com.example.mypkg.examples.abstracts::AbstractExample')) ;
	// true
	
	
Looking closely to that last 'clean' case, for the 'instanceof AbstractExample' check, one can note we're forced
to call the definition with no alias, ie with fullqualifiedclassname via Type.definition,
since no variables are stored, and we didnt specify any context domain to add alias into, still registering models
of these definitions in Type cache, but hiding them from Window object, 
which highly reduces conflictual shorthand aliases between two homonymic classes.






Public API
===


The output Class Object's small API :
	
As seen earlier, output Class Object have few notable API Elements you may need :

- OutputClass.base
- OutputClass.factory
- OutputClass.slot

Base & Factory

Base is a reference to the superclass definition itself. (the inherited superclass, not top ancestor class).
While Factory is reference to superclass' definition prototype. For the super() fans, just understand that in Type
a correct pattern is to talk to 'base' as the super() method (superclass constructor), and to 'factory' when looking for
properties or method contained in the superclass prototype (as in super.mysupermethod).


Slot

Slot is Type's internal way of storing package information. Existing with properties :
- appdomain : the context domain where class definition was first declared / stored, undefined if unset (directly through Type.define)
- pkg : the full path of the package containg Class definition
- qualifiedclassname : the short name of the Class definition
- fullqualifiedclassname : the full path to Class definition
- hashcode : the generated-unique internal identifier
- isinterface : a boolean that stores whether Class definition is an Interface instead.
- model : the base influence model of the definition a.k.a. the object passed as 'properties', 
including its live modifications.


Now its only a matter of getting used to it, and perhaps talk about the Type and Pkg objects API 
before ending these notes.

Type and Pkg have few static methods and props to dialog easier with these class objects, 
and perform checks onto them :

Type : 
- appdomain : [Object], set by default to the native window object, is a public static variable, so feel free to change it to different scopes if needed, in case of larger frameworks, or else
- guid : [int], an internal incrementing integer, used for hashcode
- merge(from, into, nocheck)
	merge is used internally by Type to merge two objects, the first 'from' into 'into'.
	Can become useful for cloning / duplicating properties, 
	the 'nocheck' boolean will bypass all safetychecks concerning rewriting of 
	core properties /constructor|hashCode|hashcode|toString|model|pkg|(app)?domain/.
- format(type)
	Format is the internal function supposed to spit always a Class object, 
	from either fullqualifiedclassname, slot, hashcode,
	array of types(in that case returning an array of Class objects),
	or unknown other classes.
- hash(qname)
	Hash is the internal function that generates an unique hash to each definition
- define(properties, mixins)
	Define is the main public method of Type.
	Allowing to create instances of Class Objects, building Class Definitions.
	'properties' is an anonymous object storing the model of that Definition, 
	while 'mixins' are used as eventual plugs, clonings, without erasing proper prototype
	and definition (and slot, hashcode, et...).
- implement(definition, interfaces)
	Implement is the internal function that makes the application throw an error if an Interface has been wrongly implemented.
- is(instance, definition)
	Public method that performs and returns the 'instanceof' check
- of(instance, typestr)
	Public method that returns the 'typeof' check on an instance 'instance' with 'typestr',
	if 'typestr' is omitted, just returns the type string.
- definition(qobj, domain)
	Public method to retrieve a Class, given the Class Name, shorthand for getDefinitionByName
- getType(type)
	Public method to retrieve a Class Definition Type slot, given the Class Definition.
	if definition is an unknown type, returns the string 'unregister_type'
- getQualifiedClassName(type)
	Public method to retrieve a Class Definition Name string, given the Class Definition.
- getFullQualifiedClassName(type)
	Public method to retrieve a Class Definition Full Qualified Class Name string, given the Class Definition.
- getDefinitionByName(qname, domain)
	Retrieves a Definition from a fullqualifiedclassname, or a qualifiedclassname
- getDefinitionByHash(hashcode)
	Retrieves a Definition from a hashcode
- getAllDefinitions()
	Returns the storing object of all Type-registered definitions
	
Pkg :
- register(path, definition)
- write(path, obj)
- definition(path)
	Public method to retrieve a Class, given the Class Name, shorthand for getDefinitionByName
- getAllDefinitions()
	Returns the storing object of all Pkg-registered definitions, NOT the same as in Type, 
	storage in Pkg is more human readable indeed, since in Type, definitions are stored as integers, 
	plus the fact that some Type.define calls with no 'domain' specification, will not be written in Pkg, but
	still in Type.



