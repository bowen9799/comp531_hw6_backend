// Handles authentication req

const username = 'bl19'

const login = (req, res) => {
	return res.send({
		username,
		result: 'success'
	})
}

const register = (req, res) => {
	if (req.body.username === undefined) {
		return res.status(400).send('Bad request')
	} else {
		return res.send({
			username,
			result: 'success'
		})
	}
}

const logout = (req, res) => {
	return res.send('OK')
}

const password = (req, res) => {
	return res.send({
		username,
		status: 'password'
	})
}

module.exports = app => {
     app.post('/login', login)
     app.post('/register', register)
     app.put('/logout', logout)
     app.put('/password', password)
}