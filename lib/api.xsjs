var filelist = $.request.parameters.get('filelist');
var service = $.request.parameters.get('service');
var runloc = $.request.parameters.get('runloc');
var ver = $.request.parameters.get('version');
var pkg = $.request.parameters.get('package');
var gitrepo = $.request.parameters.get('gitrepo');
var branch = $.request.parameters.get('branch');
var body = {};

switch (service) {
	case 'commitfile':
	    executeUpdate("UPSERT \"GITHANA\".\"lilabs.github.core::files\" VALUES ('" + runloc + "'," + ver + ", '" + gitrepo + "','" + branch + "') WHERE \"run_location\" = '" + runloc + "' AND \"gitrepo\" = '" + gitrepo + "' AND \"branch\" = '" + branch + "'");
        break;
    case 'commitfolder':
        //Loop through all files being commited and save their current version and run location
        break;
    case 'getfiles':
        //get all runlocations and versions for repo comparison
        body = executeQuery("SELECT * FROM \"GITHANA\".\"lilabs.github.core::files\" WHERE \"run_location\" like '%" + pkg + "%' AND \"gitrepo\" = '" + gitrepo + "' AND \"branch\" = '" + branch + "'");
        break;
}

$.response.setBody(JSON.stringify(body));  
$.response.contentType = 'application/json';  
$.response.status = $.net.http.OK;  

function executeQuery(strSQL) {
    try {
        var conn = $.hdb.getConnection();
        var rs = conn.executeQuery(strSQL);  
        return rs;
    } catch (err) {
        return err.message;
    }
}


function executeUpdate(strSQL) {
    try {
        var conn = $.db.getConnection();
        var pstmt = conn.prepareStatement(strSQL);
        var updateCount = pstmt.executeUpdate();
        conn.commit();
        return updateCount;
    } catch (err) {
        return err.message;
    }
}