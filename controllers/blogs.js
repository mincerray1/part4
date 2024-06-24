const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')
const userExtractor = require('../utils/middleware').userExtractor

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
  })

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }
})
  
blogsRouter.post('/', userExtractor, async (request, response) => {
    const blog = new Blog(request.body)
    const user = request.user
    
    blog.user = user

    if (!blog.title) {
        return response.status(400).json({
            error: 'title missing'
        })
    } else if (!blog.url) {
        return response.status(400).json({
            error: 'url missing'
        })
    }
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    
    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
    const user = request.user
    const blog = await Blog.findById(request.params.id)

    if (blog.user.toString() === user._id.toString()) {
        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).end()
    }
    return response.status(401).json({
      error: 'unauthorize to delete'
    })
})

blogsRouter.put('/:id', userExtractor, async (request, response) => {
    const user = request.user
    const blog = request.body

    if (user !== null) {
    // if (blog.user.toString() === user._id.toString()) {
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' })
        return response.json(updatedBlog)
    }
    return response.status(401).json({
      error: 'unauthorize to update'
    })
})

module.exports = blogsRouter