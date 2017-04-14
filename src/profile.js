// Handles all profile-related requests

// Constants
const loggedInUser = 'bl19'

const profiles = [
	{
		username: 'bowen9799',
		headline: 'hi',
		email: 'a@b',
		zipcode: 12345,
		avatar: 'a1',
		dob: 123
	},
	{
		username: 'Alice',
		headline: 'hello',
		email: 'c@d',
		zipcode: 11111,
		avatar: 'a2',
		dob: 456
	},{
		username: 'bl19',
		headline: 'old',
		email: 'e@f',
		zipcode: 77005,
		avatar: 'a3',
		dob: 789
	}
]

// Helper function to retrieve specific information
const extract = (type) => (p) => {
	let info = { username: p.username }
	info[type] = p[type]
	return info
}

// Template GET handler for array responses
const getCollection = (type) => (req, res) => {
	const key = type + 's'
	let payload = {}
	payload[key] = profiles.map(extract(type))
	if (req.params.user !== undefined) {
		const users = req.params.user.split(',')
		payload[key] = payload[key].filter((p) => users.includes(p.username))
	} else {
		payload[key] = payload[key].filter((p) => [loggedInUser].includes(p.username))
	}
	res.send(payload)
}

// Template GET handler for non-array responses
const getItem = (type) => (req, res) => {
	const user = req.params.user !== undefined ? req.params.user : loggedInUser
	const p = profiles.find((p) => p.username === user)
	if (p === undefined) {
		return res.status(404).send('User not found')
	} else {
		return res.send(extract(type)(p))
	}
}

// Template PUT handler for non-array responses
const putItem = (type) => (req, res) => {
	const input = req.body[type]
	const p = profiles.find((p) => p.username === loggedInUser)
	if (p === undefined) {
		return res.status(404).send('User not found')
	} else {
		p[type] = input
		return res.send(extract(type)(p))
	}
}

module.exports = app => {
     app.get('/headlines/:user?', getCollection('headline'))
     app.put('/headline', putItem('headline'))
     app.get('/avatars/:user?', getCollection('avatar'))
     app.put('/avatar', putItem('avatar'))
     app.get('/zipcode/:user?', getItem('zipcode'))
     app.put('/zipcode', putItem('zipcode'))
     app.get('/email/:user?', getItem('email'))
     app.put('/email', putItem('email'))
     app.get('/dob', getItem('dob'))
}
