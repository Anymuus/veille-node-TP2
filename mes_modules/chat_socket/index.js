
const util = require('util')
let socketio = require('socket.io')

module.exports.listen = function(server){
	 let io = socketio.listen(server)

	 let oUtil = {}
	 io.on('connection', function(socket){
	// console.log(socket.id)
		socket.on('setUser', function(data){
		   oUtil[socket.id] = data.user
		   socket.emit('valide_user', data)
	       io.sockets.emit('diffuser_user', oUtil);

	  	})

	  	 socket.on('setMessage', function(data) {
	    	data.user = oUtil[socket.id]
	    	socket.broadcast.emit('diffuser_message', data)
	    	socket.emit('valide_message', data)
	    })
	
	  	 socket.on('disconnect', function() {
	    	delete oUtil[socket.id]
	    	io.sockets.emit("diffuser_list_user", oUtil)
	    })

	});

return io


}