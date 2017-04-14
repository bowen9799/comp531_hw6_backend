// Handles profile req

const loggedInUser = 'bl19'

const profiles = [
	{
		username: 'bowen9799',
		headline: 'qa',
		email: 'a@b',
		zipcode: 11111,
		avatar: 'av1',
		dob: 111
	},
	{
		username: 'Alice',
		headline: 'ws',
		email: 'c@d',
		zipcode: 22222,
		avatar: 'av2',
		dob: 222
	},{
		username: 'bl19',
		headline: 'ed',
		email: 'e@f',
		zipcode: 33333,
		avatar: 'av3',
		dob: 333
	}
]

// Fetch info for further processing
const fetch = (type) => (p) => {
	let info = { username: p.username }
	info[type] = p[type]
	return info
}

// GET handler for multiple responses
const getPlural = (type) => (req, res) => {
	const key = type + 's'
	let payload = {}
	payload[key] = profiles.map(fetch(type))
	if (req.params.user !== undefined) {
		const users = req.params.user.split(',')
		payload[key] = payload[key].filter((p) => users.includes(p.username))
	} else {
		payload[key] = payload[key].filter((p) => [loggedInUser].includes(p.username))
	}
	res.send(payload)
}

// GET handler for single responses
const getSingle = (type) => (req, res) => {
	const user = req.params.user !== undefined ? req.params.user : loggedInUser
	const p = profiles.find((p) => p.username === user)
	if (p === undefined) {
		return res.status(404).send('User not found')
	} else {
		return res.send(fetch(type)(p))
	}
}

// PUT handler for single responses
const putSingle = (type) => (req, res) => {
	const input = req.body[type]
	const p = profiles.find((p) => p.username === loggedInUser)
	if (p === undefined) {
		return res.status(404).send('User not found')
	} else {
		p[type] = input
		return res.send(fetch(type)(p))
	}
}

module.exports = app => {
     app.get('/headlines/:user?', getPlural('headline'))
     app.put('/headline', putSingle('headline'))
     app.get('/avatars/:user?', getPlural('avatar'))
     app.put('/avatar', putSingle('avatar'))
     app.get('/zipcode/:user?', getSingle('zipcode'))
     app.put('/zipcode', putSingle('zipcode'))
     app.get('/email/:user?', getSingle('email'))
     app.put('/email', putSingle('email'))
     app.get('/dob', getSingle('dob'))
}
