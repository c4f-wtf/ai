self.pl = require('tau-prolog');
require('tau-prolog/modules/lists')(pl);


pl.type.Session.prototype.consult = async function( path, options ) {
	let program = path;
	if( path.slice(path.length-3) === '.pl'){
		path = fixPath(path);
		program = await getFileContent(path);
	}
	return this.thread.consult(program, options);
};