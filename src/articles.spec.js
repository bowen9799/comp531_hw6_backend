import { expect } from 'chai'
import { resource } from './ajax'

// Validate response comments
const validateComment = (comments) => {
	expect(comments).to.be.an('array')
	comments.forEach((comment) => {
		expect(comment.author).to.be.a('string')
		expect(comment.commentId).to.be.a('number')
		expect(comment.commentId % 1).to.be.equal(0)
		expect(comment.date).to.be.a('string')
		expect(comment.text).to.be.a('string')
	})
}

// Validate response articles
const validateArticle = (articles) => {
	expect(articles).to.be.an('array')
	articles.forEach((article) => {
		expect(article._id).to.be.a('number')
		expect(article._id % 1).to.be.equal(0)
		expect(article.text).to.be.a('string')
		expect(article.author).to.be.a('string')
		expect(article.date).to.be.a('string')
		if (article.img) {
			expect(article.img).to.be.a('string')
		}
		validateComment(article.comments)
	})
}

// Validate persistence
const validatePersistence = (text, postId, postCnt, commentId) =>
	resource('GET', 'articles')
		.then((body) => {
			validateArticle(body.articles)
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


describe('Articles Tests', () => {
	it('should GET all articles', (done) => {
		resource('GET', 'articles')
			.then((body) => {
				validateArticle(body.articles)
			})
			.then(done)
			.catch(done)
	})

	const author = 'Alice'
	it(`should GET articles by ${author}`, (done) => {
		resource('GET', `articles/${author}`)
			.then((body) => {
				validateArticle(body.articles)
				body.articles.forEach((article) =>
					expect(article.author).to.be.equal(author))
			})
			.then(done)
			.catch(done)
	})

	const postId = 0
	it(`should GET articles of ID ${postId}`, (done) => {
		resource('GET', `articles/${postId}`)
			.then((body) => {
				validateArticle(body.articles)
				body.articles.forEach((article) =>
					expect(article._id).to.be.equal(postId))
			})
			.then(done)
			.catch(done)
	})

	const loggedInUser = 'bl19'
	const newText = 'aaa'
	it(`should PUT edit to the article with ID ${postId}`, (done) => {
		resource('PUT', `articles/${postId}`, { text: newText })
			.then((body) => {
				validateArticle(body.articles)
				expect(body.articles.length).to.equal(1)
				expect(body.articles[0].author).to.be.equal(loggedInUser)
				expect(body.articles[0]._id).to.be.equal(postId)
				expect(body.articles[0].text).to.be.equal(newText)
				return validatePersistence(newText, postId, -1)
			})
			.then(done)
			.catch(done)
	})

	const badPostId = 1
	it('should not PUT edit to an article if not the author', (done) => {
		resource('PUT', `articles/${badPostId}`, { text: newText })
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
	const commentEdit = 'qqq'
	it(`should PUT edit to the comment with ID ${commentId} of article ID 
		${badPostId}`, (done) => {
		resource('PUT', `articles/${badPostId}`, 
			{ text: commentEdit, commentId })
			.then((body) => {
				validateArticle(body.articles)
				expect(body.articles.length).to.equal(1)
				expect(body.articles[0]._id).to.be.equal(badPostId)
				const editted = body.articles[0].comments.filter(
					(comment) => comment.commentId === commentId)
				expect(editted.length).to.equal(1)
				expect(editted[0].author).to.equal(loggedInUser)
				expect(editted[0].text).to.equal(commentEdit)
				return validatePersistence(
					commentEdit, badPostId, -1, commentId)
			})
			.then(done)
			.catch(done)
	})

	const newPost = 'zzz'
	it('should POST a new article', (done) => {
		resource('GET', 'articles')
			.then((body) => body.articles.length)
			.then((postCnt) => {
				resource('POST', 'article', { text: newPost })
					.then((body) => {
						validateArticle(body.articles)
						expect(body.articles.length).to.equal(1)
						expect(body.articles[0].author).to.equal(loggedInUser)
						expect(body.articles[0].text).to.equal(newPost)
						return validatePersistence(
							newPost, body.articles[0]._id, postCnt + 1)
					})
					.then(done)
					.catch(done)
			})
	})

	const newComment = 'sss'
	it(`should PUT new comment to article with ID ${badPostId}`, (done) => {
		resource('PUT', `articles/${badPostId}`, 
			{ text: newComment, commentId: -1 })
			.then((body) => {
				validateArticle(body.articles)
				expect(body.articles.length).to.equal(1)
				expect(body.articles[0]._id).to.be.equal(badPostId)
				const comments = body.articles[0].comments.filter(
					(comment) => comment.text === newComment &&
						comment.author === loggedInUser)
				expect(comments.length).to.be.at.least(1)
				// If there are comments with same text and author, the latest
				// one by date is the one just posted
				const latest = comments.reduce((result, comment) =>
					(new Date(result.date)) < (new Date(comment.date)) ?
						comment : result)
				return validatePersistence(
					newComment, badPostId, -1, latest.commentId)
			})
			.then(done)
			.catch(done)
	})

	const badId = 0
	it('should not PUT edit to a comment if not the author', (done) => {
		resource('PUT', `articles/${postId}`, 
			{ text: newText, commentId: badId })
			.then(() => {
				throw new Error(-1)
			})
			.catch((error) => {
				expect(error.message).to.equal('403')
			})
			.then(done)
			.catch(done)
	})
})