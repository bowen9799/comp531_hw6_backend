// Handle all article-related requests

// Hard-coded data
const loggedInUser = 'bl19'

const articles = [{
	_id: 0,
	text: 'Vivamus laoreet. Nullam tincidunt adipiscing enim. Phasellus ' +
		'tempus. Proin viverra, ligula sit amet ultrices semper, ligula arcu' +
		' tristique sapien, a accumsan nisi mauris ac eros. Fusce neque. ' +
		'Suspendisse faucibus, nunc et pellentesque egestas, lacus ante ' +
		'convallis tellus, vitae iaculis lacus elit id tortor. Vivamus ' +
		'aliquet elit ac nisl. Fusce fermentum odio nec arcu. Vivamus ' +
		'euismod mauris. In ut quam vitae odio lacinia tincidunt. Praesent ' +
		'ut ligula non mi varius sagittis. Cras sagittis. Praesent ac sem ' +
		'eget est egestas volutpat. Vivamus consectetuer hendrerit lacus. ' + 
		'Cras non dolor. Vivamus in erat ut urna cursus vestibulum. Fusce ' +
		'commodo aliquam arcu. Nam commodo suscipit quam. Quisque id odio. ' +
		'Praesent venenatis metus at tortor pulvinar varius.',
	date: new Date('2015-06-04T09:04:57.121Z'),
	img: 'http://lorempixel.com/308/206/',
	comments: [{
		author: 'Alice',
		commentId: 0,
		date: new Date('2015-08-31T13:54:03.838Z'),
		text: 'not gonna change'
	}],
	author: 'bl19'
}, {
	_id: 1,
	text: 'Pellentesque dapibus hendrerit tortor. Praesent egestas tristique' +
	' nibh. Sed a libero. Cras varius. Donec vitae orci sed dolor rutrum ' +
	'auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus ' +
	'eget, elementum ac, condimentum eget, diam. Nam at tortor in tellus ' +
	'interdum sagittis. Aliquam lobortis. Donec orci lectus, aliquam ut, ' +
	'faucibus non, euismod id, nulla. Curabitur blandit mollis lacus. Nam ' +
	'adipiscing. Vestibulum eu odio.\r',
	date: new Date('2015-08-05T13:54:03.838Z'),
	img: 'http://lorempixel.com/335/207/',
	comments: [{
		author: 'bl19',
		commentId: 0,
		date: new Date('2015-08-07T13:54:03.838Z'),
		text: 'uhhhhh'
	}],
	'author': 'Alice'
}, {
	_id: 2,
	text: 'Pellentesque commodo eros a enim. Vestibulum turpis sem, aliquet ' +
	'eget, lobortis pellentesque, rutrum eu, nisl. Sed libero. Aliquam erat ' +
	'volutpat. Etiam vitae tortor. Morbi vestibulum volutpat enim. Aliquam ' +
	'eu nunc. Nunc sed turpis. Sed mollis, eros et ultrices tempus, mauris ' +
	'ipsum aliquam libero, non adipiscing dolor urna a orci. Nulla porta ' +
	'dolor. Class aptent taciti sociosqu ad litora torquent per conubia ' +
	'nostra, per inceptos hymenaeos.\r',
	date: new Date('2015-08-08T07:19:07.759Z'),
	img: null,
	comments: [],
	author: 'bl19'
}]

// HTTP Request Handlers
// GET handler -> /articles
const getArticles = (req, res) => {
	res.send({
		articles: req.params.id === undefined ? articles : (
			isNaN(req.params.id) ?
				articles.filter((article) => article.author === req.params.id)
				: articles.filter((article) => article._id === +req.params.id))
	})
}

// PUT handler -> /articles
const putArticles = (req, res) => {
	if (req.params.id === undefined || req.body.text === undefined) {
		return res.status(400).send('Bad Request')
	}
	const postId = +req.params.id
	const message = req.body.text
	const idx = articles.findIndex((article) => article._id === postId)
	if (idx === -1) {
		return res.status(404).send(`Article of ID ${postId} Not Found`)
	}
	// Edit article
	if (req.body.commentId === undefined) {
		if (articles[idx].author !== loggedInUser) {
			return res.status(403)
				.send('Forbidden: Only author can edit this article')
		}
		articles[idx].text = message
		return res.send({
			articles: [articles[idx]]
		})
	}

	const commentId = +req.body.commentId
	const comments = articles[idx].comments
	// Post new comment
	if (commentId === -1) {
		comments.push({
			author: loggedInUser,
			commentId: comments.length,
			date: new Date(),
			text: message
		})
		return res.send({
			articles: [articles[idx]]
		})
	}

	const idxc = comments.findIndex((comment) => 
		comment.commentId === commentId)
	if (idxc === -1) {
		return res.status(404).send(`Comment of ID ${commentId} Not Found`)
	}
	if (comments[idxc].author !== loggedInUser) {
		return res.status(403)
			.send('Forbidden: Only author can edit this comment')
	}
	// Edit comment
	comments[idxc].text = message
	return res.send({
		articles: [articles[idx]]
	})
}

// POST handler -> /article
const postArticle = (req, res) => {
	if (req.body.text === undefined) {
		return res.status(400).send('Bad Request')
	}
	const newArticle = {
		_id: articles.length,
		text: req.body.text,
		date: new Date(),
		comments: [],
		author: loggedInUser
	}
	articles.push(newArticle)
	return res.send({
		articles: [newArticle]
	})
}

module.exports = app => {
     app.get('/articles/:id?', getArticles)
     app.put('/articles/:id', putArticles)
     app.post('/article', postArticle)
}