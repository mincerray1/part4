var _ = require('lodash');

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, item) => {
        return sum + item.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((max, item) => {
        if (max) {
            if (max.likes > item.likes) {
                return max
            }
        } 
        return item
    }, null)
}

const mostBlogs = (blogs) => {
    const max = _(blogs).countBy('author').entries().maxBy(_.last)
    return {
        author: max[0],
        blogs: max[1]
    }
}

const mostLikes = (blogs) => {
    return _(blogs)
          .groupBy('author')
          .map((author, id) => ({
            'author': id,
            'likes': _.sumBy(author, 'likes')
          }))
          .maxBy('likes')
}

module.exports = {
    dummy, 
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}