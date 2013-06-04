
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
trace(s instanceof Type.definition('com.example.mypkg.examples.abstracts::AbstractExample')) ;
