
const helper = require('../../tests/test_helper')

describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', `${Cypress.env('BACKEND')}/testing/reset`)
    const user = {
      name: 'John Robert',
      username: 'john',
      password: 'robert'
    }
    cy.request('POST', `${Cypress.env('BACKEND')}/users/`, user) 

    const user2 = {
      name: 'Other User',
      username: 'other',
      password: 'user'
    }
    cy.request('POST', `${Cypress.env('BACKEND')}/users/`, user2) 
    cy.visit('')
  })

  it('Login form is shown', function() {
    cy.contains('Log in to application')
    cy.contains('username')
    cy.contains('password')
    cy.contains('login')
  })

  describe('Login',function() {
    it('succeeds with correct credentials', function() {
      cy.get('#username').type('john')
      cy.get('#password').type('robert')
      cy.get('#login-button').click()
      cy.contains('John Robert logged in')
    })

    it('fails with wrong credentials', function() {
      cy.get('#username').type('john')
      cy.get('#password').type('wrong')
      cy.get('#login-button').click()
      cy.contains('wrong credentials')
    })
  })

  describe('When logged in', function() {
    beforeEach(function() {
      // ...
      // cy.get('#username').type('john')
      // cy.get('#password').type('robert')
      // cy.get('#login-button').click()
      cy.login({ username: 'john', password: 'robert' })
    })

    it('A blog can be created', function() {
      cy.contains('new blog').click()
      cy.get('#title').type('a humble blog')
      cy.get('#author').type('jrpa')
      cy.get('#url').type('humbleblog.com')
      cy.get('#create').click()
      
      cy.contains('a humble blog')
    })

    it('can like a blog', function() {
      cy.createBlog({ title: 'second blog', author: 'jrpa', url: 'secondblog.com' })
      cy.contains('second blog')
        .parent()
        .as('theBlog')

      cy.get('@theBlog')
        .get('#toggleDisplay')
        .click()
      
      cy.get('@theBlog')
        .get('#like')
        .click()
    })

    it('a blog can be deleted by owner', function() {
      cy.createBlog({ title: 'third blog', author: 'three', url: 'thirdblog.com' })
      cy.contains('third blog')
        .parent()
        .as('theBlog')

      cy.get('@theBlog')
        .get('#toggleDisplay')
        .click()

      cy.get('@theBlog')
        .get('#remove')
        .click()
    })

    it('a blog cannot be deleted by another user', function() {
      cy.createBlog({ title: 'fourth blog', author: 'fourth', url: 'fourthblog.com' })
      cy.get("#logout").click()
      cy.login({ username: 'other', password: 'user' })

      cy.contains('fourth blog')
        .parent()
        .as('theBlog')

      cy.get('@theBlog')
        .get('#toggleDisplay')
        .click()

      cy.get('@theBlog')
        .get('#remove')
        .should('not.exist')
    })

    it.only('the blogs are ordered by likes', function() {
      helper.initialBlogs.map(function(blog) {
        cy.createBlog({ title: blog.title, author: blog.author, url: blog.url, likes: blog.likes })
      })
      cy.get('.blog').eq(0).should('contain', 'Canonical string reduction')
      cy.get('.blog').eq(1).should('contain', 'First class tests')
      cy.get('.blog').eq(2).should('contain', 'React patterns')
      cy.get('.blog').eq(3).should('contain', 'Go To Statement Considered Harmful')
      cy.get('.blog').eq(4).should('contain', 'Type wars')
      cy.get('.blog').eq(5).should('contain', 'TDD harms architecture')
    })
  })
})