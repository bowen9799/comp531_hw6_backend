// Handles following req

const username = 'bl19'

// GET /following
const getFollowing = (req, res) => {
	return res.send({
		username,
		following: []
	})
}

// PUT /following
const putFollowing = (req, res) => {
	return res.send({
		username,
		following: []
	})
}

// DELETE /following
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