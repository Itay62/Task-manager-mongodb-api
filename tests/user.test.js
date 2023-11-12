const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOne, userOneId, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Itay',
        email: 'itay62@gmail.com',
        password: 'MyPass777!'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Itay',
            email: 'itay62@gmail.com',
            
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('MyPass777!')
})



test('Sholud login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(userOneId)

    expect(response.body.token).toBe(user.tokens[user.tokens.length - 1].token)
})

test('Sholud not login nonexisting user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: "notpass1"
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauhenticated user', async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete accout for user', async () => {
    const response = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(response.body._id)
    expect(user).toBeNull()
})

test('Should not delete accout for unauthorized user', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile_pic.png')
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Yos'
    })
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Yos')
})

test('Should not update invalid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'Yos'
    })
    .expect(400)
})

test('Should not signup a new user with invalid name/email/password', async () => {

    //No name
    const response = await request(app).post('/users').send({
        email: 'itay62@gmail.com',
        password: 'MyPass777!'
    }).expect(400)

    var user = await User.findOne({email: 'itay62@gmail.com'})
    expect(user).toBeNull()

    //Not valid email
    await request(app).post('/users').send({
        name: 'Itay',
        email: 'itay6ml.com',
        password: 'MyPass777!'
    }).expect(400)

    user = await User.findOne({name: 'Itay'})
    expect(user).toBeNull()

    //Password contains 'password'
    await request(app).post('/users').send({
        name: 'Itay',
        email: 'itay62@gmail.com',
        password: 'Password123'
    }).expect(400)

    user = await User.findOne({name: 'Itay'})
    expect(user).toBeNull()
})


test('Should not update user with invalid name/email/password', async () => {
    //No name
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        email: 'itay62@gmail.com',
        password: 'Password123'
    })
    .expect(400)

    //Invalid email
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Hamudi',
        email: 'itay62ail.com',
        password: 'MyPass777!'
    })
    .expect(400)

    //Invalid password
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Hamudi',
        email: 'itay62gmail.com',
        password: 'Password'
    })
    .expect(400)
})

test('Should not update user if not authenticated', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer kajsfa87yssahfASlAS88a73afkk`)
    .send()
    .expect(401)
})

test('Should not delete user if not authenticated', async () => {
    await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer kajsfa87yssahfASlAS88a73afkk`)
    .send()
    .expect(401)
})