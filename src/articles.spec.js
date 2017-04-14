import { expect } from 'chai'
import { resource } from './ajax'

// Validate the format of response article in every case
const validateArticleFormat = (articles) => {
	expect(articles).to.be.an('array')
	articles.forEach((article) => {
		expect(article._id).to.be.a('number')
		// Test for integer id
		expect(article._id % 1).to.be.equal(0)
		expect(article.author).to.be.a('string')
		expect(article.text).to.be.a('string')
		expect(article.date).to.be.a('string')
		if (article.img) {
			expect(article.img).to.be.a('string')
		}
		validateCommentFormat(article.comments)
	})
}

// Validate the format of response comment in every case
const validateCommentFormat = (comments) => {
	expect(comments).to.be.an('array')
	comments.forEach((comment) => {
		expect(comment.author).to.be.a('string')
		expect(comment.commentId).to.be.a('number')
		// Test for integer id
		expect(comment.commentId % 1).to.be.equal(0)
		expect(comment.date).to.be.a('string')
		expect(comment.text).to.be.a('string')
	})
}

// Validate persistency of data previously PUT/POSTed
const validatePersistency = (text, postId, postCnt, commentId) =>
	resource('GET', 'articles')
		.then((body) => {
			validateArticleFormat(body.articles)
			if (postCnt != -1) {
				expect(body.articles.length).to.equal(postCnt)
			}
			const posts = body.articles.filter((article) => 
				article._id === postId)
			expect(posts.length).to.equal(1)
			if (commentId !== undefined) {
				const comments = posts[0].comments.filter(
					(comment) => comment.commentId === commentId)
				expect(comments.length).to.equal(1)
				expect(comments[0].text).to.equal(text)
			} else {
				expect(posts[0].text).to.equal(text)
			}
		})


describe('Test Articles Stubs', () => {
	it('should GET all articles', (done) => {
		resource('GET', 'articles')
			.then((body) => {
				validateArticleFormat(body.articles)
			})
			.then(done)
			.catch(done)
	})

	const author = 'Alice'
	it(`should GET all articles by ${author}`, (done) => {
		resource('GET', `articles/${author}`)
			.then((body) => {
				validateArticleFormat(body.articles)
				body.articles.forEach((article) =>
					expect(article.author).to.be.equal(author))
			})
			.then(done)
			.catch(done)
	})

	const postId = 0
	it(`should GET all articles of post ID ${postId}`, (done) => {
		resource('GET', `articles/${postId}`)
			.then((body) => {
				validateArticleFormat(body.articles)
				body.articles.forEach((article) =>
					expect(article._id).to.be.equal(postId))
			})
			.then(done)
			.catch(done)
	})

	const loggedInUser = 'bl19'
	const newText = 'new article content'
	it(`should PUT edit to article of post ID ${postId}`, (done) => {
		resource('PUT', `articles/${postId}`, { text: newText })
			.then((body) => {
				validateArticleFormat(body.articles)
				expect(body.articles.length).to.equal(1)
				expect(body.articles[0].author).to.be.equal(loggedInUser)
				expect(body.articles[0]._id).to.be.equal(postId)
				expect(body.articles[0].text).to.be.equal(newText)
				return validatePersistency(newText, postId, -1)
			})
			.then(done)
			.catch(done)
	})

	const notOwnedPostId = 1
	it('should not PUT edit to an article not owned', (done) => {
		resource('PUT', `articles/${notOwnedPostId}`, { text: newText })
			.then(() => {
				throw new Error(-1)
			})
			.catch((error) => {
				expect(error.message).to.equal('403')
			})
			.then(done)
			.catch(done)
	})

	const commentId = 0
	const commentEdition = 'abc'
	it(`should PUT edit to a comment of ID ${commentId} of article ID 
		${notOwnedPostId}`, (done) => {
		resource('PUT', `articles/${notOwnedPostId}`, 
			{ text: commentEdition, commentId })
			.then((body) => {
				validateArticleFormat(body.articles)
				expect(body.articles.length).to.equal(1)
				expect(body.articles[0]._id).to.be.equal(notOwnedPostId)
				const editted = body.articles[0].comments.filter(
					(comment) => comment.commentId === commentId)
				expect(editted.length).to.equal(1)
				expect(editted[0].author).to.equal(loggedInUser)
				expect(editted[0].text).to.equal(commentEdition)
				return validatePersistency(
					commentEdition, notOwnedPostId, -1, commentId)
			})
			.then(done)
			.catch(done)
	})

	const newComment = 'def'
	it(`should PUT a new comment on article ID ${notOwnedPostId}`, (done) => {
		resource('PUT', `articles/${notOwnedPostId}`, 
			{ text: newComment, commentId: -1 })
			.then((body) => {
				validateArticleFormat(body.articles)
				expect(body.articles.length).to.equal(1)
				expect(body.articles[0]._id).to.be.equal(notOwnedPostId)
				const comments = body.articles[0].comments.filter(
					(comment) => comment.text === newComment &&
						comment.author === loggedInUser)
				expect(comments.length).to.be.at.least(1)
				// If there are comments with same text and author, the latest
				// one by date is the one just posted
				const latest = comments.reduce((result, comment) =>
					(new Date(result.date)) < (new Date(comment.date)) ?
						comment : result)
				return validatePersistency(
					newComment, notOwnedPostId, -1, latest.commentId)
			})
			.then(done)
			.catch(done)
	})

	const notOwnedCommentId = 0
	it('should not PUT edit to a comment not owned', (done) => {
		resource('PUT', `articles/${postId}`, 
			{ text: newText, commentId: notOwnedCommentId })
			.then(() => {
				throw new Error(-1)
			})
			.catch((error) => {
				expect(error.message).to.equal('403')
			})
			.then(done)
			.catch(done)
	})

	const newPost = 'hello world'
	it('should POST a new article', (done) => {
		resource('GET', 'articles')
			.then((body) => body.articles.length)
			.then((postCnt) => {
				resource('POST', 'article', { text: newPost })
					.then((body) => {
						validateArticleFormat(body.articles)
						expect(body.articles.length).to.equal(1)
						expect(body.articles[0].author).to.equal(loggedInUser)
						expect(body.articles[0].text).to.equal(newPost)
						return validatePersistency(
							newPost, body.articles[0]._id, postCnt + 1)
					})
					.then(done)
					.catch(done)
			})
	})
})