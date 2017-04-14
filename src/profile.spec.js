import { expect } from 'chai'
import { resource } from './ajax'

const currUser = 'bl19'
const user = 'Alice'
const testUser = 'bowen9799'
const testData = {
	headline: 'qaz',
	avatar: 'qqq',
	email: 'q@q.c',
	zipcode: 44444
}

// Test single responses
const validateSingle = (type, dataType) => {
	it(`should GET ${type}`, (done) => {
		resource('GET', type).then((body) => {
			expect(body[type]).to.be.a(dataType)
			expect(body.username).to.equal(currUser)
		}).then(done).catch(done)
	})

	it(`should GET ${type} for a user`, (done) => {
		resource('GET', `${type}/${user}`).then((body) => {
			expect(body[type]).to.be.a(dataType)
			expect(body.username).to.equal(user)
		}).then(done).catch(done)
	})

	it(`should PUT ${type} with persistence`, (done) => {
		let payload = {}
		payload[type] = testData[type]
		resource('PUT', type, payload).then((body) => {
			expect(body.username).to.equal(currUser)
			expect(body[type]).to.equal(testData[type])
			return resource('GET', type).then((body) => {
				expect(body[type]).to.equal(testData[type])
				expect(body.username).to.equal(currUser)
			})
		}).then(done).catch(done)
	})
}

// Test multiple responses
const validatePlural = (type) => {
	const plural = type + 's'
	it(`should GET ${type}`, (done) => {
		resource('GET', plural).then((body) => {
			expect(body[plural]).to.be.an('array')
			expect(body[plural].length).to.equal(1)
			body[plural].forEach((item) => {
				expect(item.username).to.be.a('string')
				expect(item[type]).to.be.a('string')
			})	
		}).then(done).catch(done)
	})

	it(`should GET ${type} for a user`, (done) => {
		resource('GET', `${plural}/${user}`).then((body) => {
			expect(body[plural]).to.be.an('array')
			expect(body[plural].length).to.equal(1)
			expect(body[plural][0].username).to.equal(user)
			expect(body[plural][0][type]).to.be.a('string')
		}).then(done).catch(done)
	})

	it(`should GET ${plural} for multiple users`, (done) => {
		resource('GET', `${plural}/${user},${testUser}`).then((body) => {
			const users = [body[plural][0].username, body[plural][1].username]
			expect(body[plural]).to.be.an('array')
			expect(body[plural].length).to.equal(2)
			expect(users).to.include(user)
			expect(users).to.include(testUser)
			expect(body[plural][0][type]).to.be.a('string')
			expect(body[plural][1][type]).to.be.a('string')
		}).then(done).catch(done)
	}) 

	it(`should PUT ${type} with persistence`, (done) => {
		let payload = {}
		payload[type] = testData[type]
		resource('PUT', type, payload).then((body) => {
			expect(body.username).to.equal(currUser)
			expect(body[type]).to.equal(testData[type])
			return resource('GET', `${plural}/${currUser}`)
				.then((body) => {
					expect(body[plural]).to.be.an('array')
					expect(body[plural].length).to.equal(1)
					expect(body[plural][0].username).to.equal(currUser)
					expect(body[plural][0][type]).to.equal(testData[type])
				})
		}).then(done).catch(done)
	})
}

describe('Profile Tests', () => {
	validatePlural('headline')
	validatePlural('avatar')
	validateSingle('email', 'string')
	validateSingle('zipcode', 'number')
	it('should GET dob', (done) => {
		resource('GET', 'dob').then((body) => {
			expect(body.username).to.equal(currUser)
			expect(body.dob).to.be.a('number')
		}).then(done).catch(done)
	})
})