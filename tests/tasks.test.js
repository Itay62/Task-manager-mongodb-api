const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {userOne, userTwo, taskOne, taskThree, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)


test('Should create task for user', async () => {
    const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: 'From my test'
    })
    .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should get all tasks for user one', async () => {
    const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toEqual(2)
})

test('Second user should not delete the first task', async () => {
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not create task with invalid description/completed', async () => {
    await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
        completed: false
    })
    .expect(400)
})

test('Should not update task with invalid description/completed', async () => {
    await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        locaion: 'edinburough'
    })
    .expect(400)
})

test('Should delete user task', async () => {
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not delete user task if not authenticated', async () => {
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer kjsadhf289fsSAIUHFA8afwkjFQ9ssjs`)
    .send()
    .expect(401)
})

test('Should not update other users task', async () => {
    await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
        completed: true
    })
    .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task.completed).toEqual(false)
})

test('Should fetch user task by id', async () => {
    await request(app)
    .get(`/tasks/${taskThree._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not fetch user task by id if unauthenticated', async () => {
    await request(app)
    .get(`/tasks/${taskThree._id}`)
    .set('Authorization', `Bearer adlgHGJD88dDJG9sjdg9&D`)
    .send()
    .expect(401)
})

test('Should not fetch other users task by id', async () => {
    await request(app)
    .get(`/tasks/${taskThree._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(404)
})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
    .get('/tasks?completed=true')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(1)
})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
    .get('/tasks?completed=false')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(1)
})

test('Should sort tasks by description', async () => {
    const response = await request(app)
    .get('/tasks?sortBy=description')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(2)
    expect(response.body[0].description.charCodeAt(0)).toBeLessThanOrEqual(response.body[1].description.charCodeAt(0))
})

test('Should sort tasks by completed', async () => {
    const response = await request(app)
    .get('/tasks?sortBy=completed')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(2)
    expect(response.body[0].completed.toString().charCodeAt(0)).toBeLessThanOrEqual(response.body[1].completed.toString().charCodeAt(0))
})

test('Should sort tasks by createdAt', async () => {
    const response = await request(app)
    .get('/tasks?sortBy=createdAt')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(2)
    expect(Date.parse(response.body[0].createdAt)).toBeLessThanOrEqual(Date.parse(response.body[1].createdAt))
})

test('Should sort tasks by updatedAt', async () => {
    const response = await request(app)
    .get('/tasks?sortBy=updatedAt')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(2)
    expect(Date.parse(response.body[0].updatedAt)).toBeLessThanOrEqual(Date.parse(response.body[1].updatedAt))
})

test('Should fetch page of tasks', async () => {
    const response = await request(app)
    .get('/tasks?limit=1')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(1)
})