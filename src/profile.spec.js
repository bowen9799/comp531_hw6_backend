import { expect } from 'chai'
import { resource } from './ajax'

// Constants
const loggedInUser = 'bl19'
const user = 'Alice'
const anotherUser = 'bowen9799'
const newData = {
	headline: 'new headline',
	avatar: 'https://webdev-dummy.herokuapp.com/img/owl.png-' + 
		new Date().getTime(),
	email: 'bl19@rice.edu',
	zipcode: 77005
}

// Template test case for array responses
const validateCollection = (type) => {
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
		resource('GET', `${plural}/${user},${anotherUser}`).then((body) => {
			expect(body[plural]).to.be.an('array')
			expect(body[plural].length).to.equal(2)
			const users = [body[plural][0].username, body[plural][1].username]
			expect(users).to.include(user)
			expect(users).to.include(anotherUser)
			expect(body[plural][0][type]).to.be.a('string')
			expect(body[plural][1][type]).to.be.a('string')
		}).then(done).catch(done)
	}) 

	it(`should PUT ${type} and persist`, (done) => {
		let payload = {}
		payload[type] = newData[type]
		resource('PUT', type, payload).then((body) => {
			expect(body.username).to.equal(loggedInUser)
			expect(body[type]).to.equal(newData[type])
			return resource('GET', `${plural}/${loggedInUser}`)
				.then((body) => {
					expect(body[plural]).to.be.an('array')
					expect(body[plural].length).to.equal(1)
					expect(body[plural][0].username).to.equal(loggedInUser)
					expect(body[plural][0][type]).to.equal(newData[type])
				})
		}).then(done).catch(done)
	})
}

// Template test case for non-array responses
const validateItem = (type, dataType) => {
	it(`should GET ${type}`, (done) => {
		resource('GET', type).then((body) => {
			expect(body.username).to.equal(loggedInUser)
			expect(body[type]).to.be.a(dataType)
		}).then(done).catch(done)
	})

	it(`should GET ${type} for a user`, (done) => {
		resource('GET', `${type}/${user}`).then((body) => {
			expect(body.username).to.equal(user)
			expect(body[type]).to.be.a(dataType)
		}).then(done).catch(done)
	})

	it(`should PUT ${type} and persist`, (done) => {
		let payload = {}
		payload[type] = newData[type]
		resource('PUT', type, payload).then((body) => {
			expect(body.username).to.equal(loggedInUser)
			expect(body[type]).to.equal(newData[type])
			return resource('GET', type).then((body) => {
				expect(body.username).to.equal(loggedInUser)
				expect(body[type]).to.equal(newData[type])
			})
		}).then(done).catch(done)
	})
}

describe('Test Profile Stubs', () => {

	validateCollection('headline')
	validateCollection('avatar')
	validateItem('email', 'string')
	validateItem('zipcode', 'number')

	it('should GET date of birth', (done) => {
		resource('GET', 'dob').then((body) => {
			expect(body.username).to.equal(loggedInUser)
			expect(body.dob).to.be.a('number')
		}).then(done).catch(done)
	})
})