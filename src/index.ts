import { Hono } from 'hono'
import { UserData } from './types/userData'
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { fileTable, userTable } from './db/schema';
import { fileType } from './types/fileType';

const app = new Hono()
const db = drizzle(process.env.DATABASE_URL!);

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post("/signup", async (c) => {
  const body = await c.req.json() as UserData;
  console.log("the data sent way this: ", body);
  if(!body.name || !body.email || !body.password){
    return c.json({
      message: "Please fill all the fields and then submit",
    }, 400);
  }
  const hashPassword = await Bun.password.hash(body.password);

  const userData = {
    email: body.email,
    password: hashPassword,
    name: body.name
  }

  const user = await db.insert(userTable).values(userData).returning({
    name: userTable.name
  });
  console.log("teh user creation query resulted in this: ", user)
  if(user){
    return c.json({
      message: "User created and stored in the db successfully!"
    }, 201)
  } else {
    return c.json({
      message: "An error occured, couldnt create the user, retry again"
    }, 400)
  }
})

app.get("/listUsers", async (c) => {
  try {
    const users = await db.select({ id: userTable.id, name: userTable.name, email: userTable.email }).from(userTable);
  console.log("the users are: ", users);
  if(!users[0]){
    return c.json({
      message: "faield to get any users"
    }, 400)
  } else {
    return c.json({
      message: "fetched the users",
      content: users,
    }, 200);
  }
  } catch (error) {
    return c.json({
      message: "An error occured, couldnt get the users, retry again"
    }, 400) 
  }
})

app.get("getUserById/:id", async(c)=> {
  const id = c.req.param("id");
  const user = await db.select().from(userTable).where(eq(userTable.id, id));
  if(!user[0]){
    return c.json({
      message: "failed to get the user"
    }, 400)
  } else {
    return c.json({
      message: "fetched the user",
      content: user,
    }, 200);
  }
})

app.post("/uploadFile", async (c)=> {
  const files = await c.req.json() as fileType;
  if(!files){
    return c.json({
      message: "no file entered"
    }, 400)
  }
  console.log("the files are: ", files);
  const upload = await db.insert(fileTable).values({ fileName: files.fileName, userId: files.userId }).returning({
    fileName: fileTable.fileName,
    uploadedAt: fileTable.uploadedAt
  })
  if(!upload[0]){
    return c.json({
      message: "failed to upload file"
    }, 400)
  } else {
    return c.json({
      message: "success uploading the files"
    }, 200)
  }
})



export default app
