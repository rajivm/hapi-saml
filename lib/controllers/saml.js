var Hapi = require('hapi');

module.exports = function(server, saml, successAction) {
	var SamlController = {
		metadata: function(request, reply) {
		    return reply(saml.generateServiceProviderMetadata(request.server.app.decryptionCert))
		            .type('application/xml');
		},
		login: function(request, reply) {
	    	saml.getAuthorizeUrl({
		        headers: request.headers,
		        body: request.payload,
		        query: request.query
		    }, function(err, loginUrl) {
		        if (err !== null)
		            return reply.code(500);
		        return reply.redirect(loginUrl);        
		    });
		},
		assert: function(request, reply) {
		    var options = {
		        request_body: request.payload
		    };

		    if (request.payload.SAMLRequest) {
		    // Implement your SAMLRequest handling here
		        return reply(500);
		    }
		    if (request.payload.SAMLResponse) {
		        // Handles SP use cases, e.g. IdP is external and SP is Hapi
		        saml.validatePostResponse(request.payload, function(err, profile) {
		        	console.log(err);
		            if (err !== null)
		                return reply(500);

		            return successAction(request, reply, profile);
		     	});
		    }
		},
		logout: function (request, reply) {
		    var options = {
		        name_id: request.server.app.name_id,
		        session_index: request.server.app.session_index
		    };

		    saml.getLogoutUrl(request, function(err, url) {
		        if (err !== null)
		            return reply.code(500);
		        return reply.redirect(url);        
		    });
		}
	}
	return SamlController;
};