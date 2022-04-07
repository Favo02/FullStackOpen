const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./api_test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blogs')

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('id is defined', async () => {
    const response = await api.get('/api/blogs')

    const ids = response.body.map(blog => blog.id)
    expect(ids).not.toContain(undefined)
})

test('a valid blog can be added ', async () => {
    const newBlog = {
        title: "The smurfs",
        author: "Papa smurf",
        url: "https://smurfs.com/",
        likes: 15,
    }
  
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const contents = blogsAtEnd.map(n => n.title)
    expect(contents).toContain(
        'The smurfs'
    )
})

afterAll(() => {
    mongoose.connection.close()
}) 