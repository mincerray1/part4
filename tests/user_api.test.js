const bcrypt = require('bcrypt')
const User = require('../models/user')

const { test, after, beforeEach, describe } = require('node:test')

const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')

const api = supertest(app)

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany({'username': {$ne : 'root'}})
  
    //   const passwordHash = await bcrypt.hash('sekret', 10)
    //   const user = new User({ username: 'root', passwordHash })
  
    //   await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('creation fails with username <3 chars', async () => {
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          username: 'ab',
          name: 'Bad User',
          password: 'baduser',
        }
    
        await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation fails with password <3 chars', async () => {
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          username: 'gooduser',
          name: 'Bad Password',
          password: 'pw',
        }
    
        await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

after(async () => {
    await mongoose.connection.close()
})