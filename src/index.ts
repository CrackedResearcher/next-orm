import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get("/hello/:nane", (c)=> {
  return c.text("hello: "+ c.req.param("nane")
  , 200)
})

export default app
