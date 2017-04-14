// Handles all following-related requests

// Constants
const username = 'bl19'

// Handlers
// GET handler -> /following
const getFollowing = (req, res) => {
	return res.send({
		username,
		following: []
	})
}

// PUT handler -> /following
const putFollowing = (req, res) => {
	return res.send({
		username,
		following: []
	})
}

// DELETE handler -> /following
const deleteFollowing = (req, res) => {
	return res.send({
		username,
		following: []
	})
}

module.exports = app => {
     app.get('/following/:user?', getFollowing)
     app.put('/following/:user', putFollowing)
     app.delete('/following/:user', deleteFollowing)
}