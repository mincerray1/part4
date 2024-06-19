const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')

const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')


const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
  
    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
})

test('there are six blogs', async () => {
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('there is id property', async () => {
    const response = await api.get('/api/blogs')
  
    assert(response.body[0].hasOwnProperty("id"))
})

test('a valid blog can be added ', async () => {
    const newBlog = 
    {
        title: "what a blog!",
        author: "Blogger",
        url: "http://whattablog.com",
        likes: 20
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(n => n.title)
    assert(titles.includes('what a blog!'))
})

test('a no like blog can be added that defaults to 0 likes', async () => {
    const newBlog = 
    {
        title: "Is this a real blog?",
        author: "Blogger",
        url: "http://notrealblog.com"
    }
  
    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    
    assert.strictEqual(blogsAtEnd[blogsAtEnd.length - 1].likes, 0)
})

test('a no title blog is not added', async () => {
    const newBlog = 
    {
        author: "Blogger",
        url: "http://notrealblog.com"
    }
  
    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
  
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('a no url blog is not added', async () => {
    const newBlog = 
    {
        title: "Is this a real blog?",
        author: "Blogger",
    }
  
    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
  
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    const titles = blogsAtEnd.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))
  
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})
        
test('blog can be updated', async () => {
    const blogToUpdate = 
    {
        id: "5a422a851b54a676234d17f7",
        likes: 999
    }
  
    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blogToUpdate)
        .expect(200)
  
    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlog = blogsAtEnd.find(item => item.id === blogToUpdate.id)
  
    assert.strictEqual(updatedBlog.likes, blogToUpdate.likes)
})

after(async () => {
  await mongoose.connection.close()
})