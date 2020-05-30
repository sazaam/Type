/*
 * Type
 * Essential Classes and Packages for Javascript
 * 
 * V 0.9.9
 * 
 * Dependancies :
 * 	none
 * 
 * An utility inspired by Mitsuhiko's Classy.js for features (https://github.com/mitsuhiko/classy)
 * but by Ornorm for theorical key-concepts, namings and beautiful hack ideas (abiendo[(at)gmail.com])
 * 
 * 
 * authored under Spark Project License
 * 
 * by saz aka True
 * sazaam[(at)gmail.com]
 * 2012-2012
 * 
 */

'use strict' ;

(function(name, definition){
	
	if ('function' === typeof define){ // AMD
		define(definition) ;
	} else if ('undefined' !== typeof module && module.exports) { // Node.js
		module.exports = ('function' === typeof definition) ? definition() : definition ;
	} else {
		if(definition !== undefined) this[name] = ('function' === typeof definition) ? definition() : definition ;
	}
	
})('type', (function(){

		('undefined' === typeof Pkg && 'undefined' === typeof Pkg && (function(){
			
			var sl = [].slice ;
			var name_r = /function([^\(]+)/, pkg_r = /::(.+)$/, abs_r = /^\//, DEFS = {}, PKG_SEP = '::',
			getctorname = function(cl, name){ return (cl = cl.match(name_r))? cl[1].replace(' ', ''):'' },
			keep_r = /constructor|hashCode|hashcode|toString|model|pkg|(app)?domain/,
			retrieve = function retrieve(from, prop, p){ try { p = from[prop] ; return p } finally { if(prop != 'constructor') from[prop] = undefined , delete from[prop] }},
			merge = function(from, into, nocheck){ 
				for(var s in from) {
					
					if(!keep_r.test(s) || nocheck === true) {
						into[s] = from[s] ;
						if(nocheck !== true) {
							if(!!!window.opera) delete from[s] ;
							else from[s] = undefined ;
						}
					} ;
				}
				return into ;
			},
			toArray = function toArray(arr, p, l){	p = p || [], l = arr.length ; while(l--) p.unshift(arr[l]) ; return p },
			PKG = {} , Type, Pkg,
			customs = [] ;
			
			Type = {
				globals:{},
				merge:merge,
				internals:{},
				appdomain:window,
				guid:0,
				format:function format(type){
					if(!type) return type ; // cast away undefined & null
					if(!!type.slot) return type ; // cast away custom classes
					if(!!type.hashcode) return Type.getDefinitionByHash(type) ; // is a slot object
					if(Type.of(type, 'number')) return Type.getDefinitionByHash(type) ;
					if(Type.of(type, 'string')) return Type.getDefinitionByName(type) ;
					if(Type.is(type, Array)) for(var i = 0, l = type.length ; i < l ; i++) type[i] = format(type[i]) ;
					return type ;
				},
				hash:function hash(qname){
					for (var i = 0 , h = 0 ; i < qname.length ; i++) h = 31 * ((h << 31) - h) + qname.charCodeAt(i), h &= h ;
					return h ;
				},
				customDefinitionChecks:function(closure){
					customs[customs.length] = closure ;
				},
				customize:function(properties, def){
					if(customs.length)
					for(var i = 0 ; i < customs.length ; i++){
						properties = customs[i](properties, def) ;
					}
					return properties ;
				},
				define:function define(properties, mixins){
					
					var args = sl.call(arguments) ;
					properties = args.shift() ;
					mixins = args ;
					var model, basemodel = {} ;
					if(Type.of(properties, 'function')) {
						var m = properties() ;
						model = merge(m, basemodel, true) ;
						return Type.define.apply(Type, [model].concat(mixins)) ;
					}
					
					if(mixins.length) properties.mixins = mixins ;
					model = merge(properties, basemodel, true) ;
					
					var staticinit , isinterface = false ;
					var domain = retrieve(properties, 'domain') ;
					var pkg = retrieve(properties, 'pkg') || '' ;
					var def = retrieve(properties, 'constructor') ;
					
					var defIsObject = def == Object ;
					
					if( pkg.indexOf('@')!= -1 ){
						isinterface = true ;
						pkg = pkg.replace('@', '') ;
					}
					var name = defIsObject ? '' : (def.name || getctorname(def.toString())).replace(/Constructor$/, '') ;
					
					if(pkg_r.test(pkg)) pkg = pkg.replace(pkg_r, function(){name = arguments[1]; return ''}) ;
					
					if(!!Type.hackpath) pkg = abs_r.test(pkg) ? pkg.replace(abs_r, '') : pkg !='' ? Type.hackpath +(pkg.indexOf('.') == 0 ? pkg : '.'+ pkg) : Type.hackpath ;
					
					if(name == '' ) name = 'Anonymous'+(++Type.guid) ;
					
					if(defIsObject) 
						def = Function('return function '+name+'(){\n\t \n}')() ;
					
					properties = Type.customize(properties, def) ;
					
					var mixes = retrieve(properties, 'mixins') ;
					var superclass = retrieve(properties, 'inherits') ;
					var interfaces = retrieve(properties, 'interfaces') ;
					var statics = retrieve(properties, 'statics') ;
					var protoinit = retrieve(properties, 'protoinit') ;
					
					
					superclass = Type.format(superclass) || Object ;
					interfaces = Type.format(interfaces) || [] ;
					
					// set hashCode here
					var qname = pkg == '' ? name : pkg + PKG_SEP + name ;
					var hash = Type.hash(qname) ;
					
					// write classes w/ hash reference and if domain is specified, in domain
					(DEFS[hash] = def).slot = {
						appdomain:domain,
						qualifiedclassname:name,
						pkg:pkg,
						fullqualifiedclassname:qname,
						hashcode:hash,
						isinterface:isinterface,
						model:model,
						toString:function toString(){ return 'Type@'+qname+'Definition'}
					} ;
					
					
					def.toString = function toString(){ return '[' + ( isinterface ? "interface " : "class " ) + qname + ']' }
					
					// set defaults
					!! domain && (domain[name] = def) ; // Alias checks, we don't want our anonymous classes to endup in window or else
					(!!Type.hackpath) && Pkg.register(qname, def) ;
					
					var T = function(){
						// set base & factory references
						def.base = superclass ;
						def.factory = superclass.prototype ;
						// write overrides
						merge(properties, this, false) ;
						
						this.constructor = def ;
					}
					
					T.prototype = superclass.prototype ;
					def.prototype = new T() ;
					
					
					(function plug(plugs){
						if(!!!plugs) return ;
						var l = plugs.length ;
						for(var i = 0 ; i < l ; i++){
							var mix = plugs[i] ;
							if(Type.is(mix, Array) && mix.length) plug(mix) ; 
							else if(!! mix.slot) merge(mix.slot.model, def.prototype, false) ; 
							else merge(mix, def.prototype, false) ;
						}
					})(mixes) ;
					
					
					// protoinit 
					if (!!protoinit) protoinit.apply(def.prototype, [def, domain]) ;
					
					
					if (!!statics) {
						staticinit = retrieve(statics, 'initialize') ;
						merge(statics, def, false) ;
					}
					// static initialize
					if(!!staticinit) staticinit.apply(def, [def, domain]) ;
					Type.implement(def, interfaces.concat(superclass.slot ? superclass.slot.interfaces || [] : [])) ;
					return def ;
				},
				implement:function implement(definition, interfaces){
					
					var c, method, cname, ints = definition.slot.interfaces = definition.slot.interfaces || [] ;
					if(!!Type.is(interfaces, Array)) {
						for(var i = 0, l = interfaces.length ; i < l ; i++) {
							var f = interfaces[i] ;
							
							c = f.prototype , cname = f.slot.fullqualifiedclassname ;
							
							for (method in c) {
								if(keep_r.test(method)) continue ;
								
								if(!definition.prototype.hasOwnProperty(method)) throw new TypeError("NotImplementedMethodException "+c.constructor.slot.pkg+'.@'+c.constructor.slot.qualifiedclassname+"::" + method + "() absent from class " + definition.slot.fullqualifiedclassname) ;
							}
							ints[ints.length] = cname ;
						}
					}else ints[ints.length] = interfaces.slot.fullqualifiedclassname ;
					return definition ;
				},
				is:function is(instance, definition){ return instance instanceof definition },
				of:function of(instance, typestr){ return (!!typestr) ? (typeof instance === typestr) : (typeof instance) },
				definition:function definition(qobj, domain){return Type.getDefinitionByName(qobj, domain)},
				getType:function getType(type){ return (!!type.constructor && !!type.constructor.slot) ? type.constructor.slot : type.slot || 'unregistered_type'},
				getQualifiedClassName:function getQualifiedClassName(type){ return Type.getType(type).toString() },
				getFullQualifiedClassName:function getFullQualifiedClassName(type){ return Type.getType(type).fullqualifiedclassname },
				getDefinitionByName:function getDefinitionByName(qname, domain){ 
					var absname = (Type.hackpath || '') + (qname.indexOf('::') !=-1 ? (qname.indexOf('::') == 0 ? qname : '.' + qname) : '::' + qname) ;
					return (domain || Type.appdomain)[qname] || Type.globals[qname] || DEFS[Type.hash(qname)] || (domain || Type.appdomain)[absname] || Type.globals[absname] || DEFS[Type.hash(absname)]
				},
				getDefinitionByHash:function getDefinitionByHash(hashcode){ return DEFS[hashcode] },
				getAllDefinitions:function getAllDefinitions(){ return DEFS }
			}
			
			Pkg = {
				register:function register(path, definition){
					if(arguments.length > 2){
						var args = sl.call(arguments) ;
						var pp = args.shift(), ret, qq ;
						
						for(var i = 0, l = args.length ; i < l ; i++){
							ret = args[i] ;
							qq = ret.pkg || '' ;
							ret = Pkg.register( (qq == '' || qq.indexOf('::') != -1 ? qq :'.' + qq ), args[i]) ;
						}
						return ret;
					}if(!!definition.slot) // is already result of Type.define()
						path = definition.slot.fullqualifiedclassname ;
					else { // transform it into Type.define() result
						definition.pkg = path ;
						definition = Type.define(definition) ;
						path = definition.slot.fullqualifiedclassname ;
					}
					return (PKG[path] = definition) ;
				},
				write:function write(path, obj){
					var oldpath = Type.hackpath ;
					Type.hackpath = !!oldpath && !abs_r.test(path) ? oldpath + '.' +path : path.replace(abs_r, '') ;
					try{
						// if obj is an Array
						if(Type.is(obj, Array)) {
							for(var i = 0 , arr = [], l = obj.length ; i < l ; i ++)
								// if is an anonymous object, but with named References to write
								arr[arr.length] = write(path, obj[i]) ;
							return arr[arr.length - 1] ;
						}
						// if a function is passed
						else if(Type.of(obj, 'function')){
							
							if(!!obj.slot) return Pkg.register(path, obj) ;
							var o = new (obj)(path) ;
							if(Type.is(obj, Array)){
								for(var i = 0 ; i < o.length ; i++){
									var oo = o[i] ;
									if(!!oo.slot) write(path, oo) ;
								}
								return o ;
							}
							return (!!o) ? !!o.slot ? write(path, o) : undefined : undefined ;
						}
						// if anonymous object is passed
						else {
							return Pkg.register.apply(Pkg, sl.call(arguments)) ;
						}
					}catch(e){ trace(e) }
					finally {
						Type.hackpath = oldpath ; if(!!!oldpath) delete Type.hackpath ;
					}
				},
				definition:function definition(path){ return PKG[path] || Type.globals[path] },
				getAllDefinitions:function getAllDefinitions(){ return PKG }
			}
			// GLOBALS
			
			window.Type = Type ;
			window.Pkg = Pkg ;
			
			return Type ;
		})()) ;





	})()
)