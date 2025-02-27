import { Hono } from 'hono'

const products = new Hono()

products.get('/', (c) => {
  return c.json({ message: 'Products list' })
})

products.get('/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ message: `Product ${id}` })
})

export default products