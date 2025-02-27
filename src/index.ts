import { Hono } from 'hono'
import { UserData, SignupResponse } from './types/userData'
import { db } from './db/connect';
import { eq } from 'drizzle-orm';
import { fileTable, userTable } from './db/schema';
import { fileType } from './types/fileType';
import { Context } from 'hono';
import { authMiddleware, signJwt } from './utils/jwt';
import productRoutes from './routes/products/index'

const app = new Hono()

app.route('/products', productRoutes)


app.post("/signup", async (c: Context) => {
  const body = await c.req.json() as UserData;
  if (!body.name || !body.email || !body.password) {
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

  const user = (await db.insert(userTable).values(userData).returning({
    name: userTable.name,
    email: userTable.email,
    id: userTable.id
  }))[0] as SignupResponse;

  if (user) {
    const accessToken = await signJwt(user)
    return c.json({
      message: "User created and stored in the db successfully!",
      accessToken: accessToken
    }, 201)
  } else {
    return c.json({
      message: "An error occured, couldnt create the user, retry again"
    }, 400)
  }
})

app.post('/login', async (c: Context) => {
  const body = await c.req.json() as UserData;

  if (!body.email || !body.password) {
    return c.json({
      message: "Please provide email and password",
    }, 400);
  }

  try {
    const user = await db.select()
      .from(userTable)
      .where(eq(userTable.email, body.email))
      .limit(1);

    if (!user[0]) {
      return c.json({
        message: "User not found",
      }, 401);
    }

    const isValidPassword = await Bun.password.verify(
      body.password,
      user[0].password
    );

    if (!isValidPassword) {
      return c.json({
        message: "Invalid password",
      }, 401);
    }

    const token = await signJwt({
      id: user[0].id,
      email: user[0].email,
      name: user[0].name
    });

    return c.json({
      message: "Login successful",
      accessToken: token,
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name
      }
    }, 200);

  } catch (error) {
    return c.json({
      message: "An error occurred during login",
    }, 500);
  }
});


app.get("/listUsers", authMiddleware, async (c: Context) => {
  try {
    const users = await db.select({ id: userTable.id, name: userTable.name, email: userTable.email }).from(userTable);
    if (!users[0]) {
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

app.get('/getFilesAndUsers', authMiddleware, async (c: Context) => {
  try {
    const userId = c.get("userid");
    const files = await db.select({
      userid: userTable.id,
      username: userTable.name,
      filename: fileTable.fileName
    })
      .from(userTable)
      .innerJoin(fileTable, eq(fileTable.userId, userTable.id));
    return c.json({
      message: "fetched the files",
      content: files,
    }, 200);
  } catch (error) {
    return c.json({
      error: error instanceof Error ? error.message : "Unknown error"
    }, 500)
  }
})

app.get("getUserById/:id", authMiddleware, async (c: Context) => {
  const id = c.req.param("id");
  const user = await db.select().from(userTable).where(eq(userTable.id, id));
  if (!user[0]) {
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


app.post("/uploadFile", authMiddleware, async (c: Context) => {
  try {
    const files = await c.req.json() as fileType;
    if (!files) {
      return c.json({
        message: "no file entered"
      }, 400)
    }

    const userId = c.get("userid");

    const upload = await db.insert(fileTable).values({ fileName: files.fileName, userId: userId }).returning({
      fileName: fileTable.fileName,
      uploadedAt: fileTable.uploadedAt
    })
    if (!upload[0]) {
      return c.json({
        message: "failed to upload file",
        user_id: userId
      }, 400)
    } else {
      return c.json({
        message: "success uploading the files",
        user_id: userId,
      }, 200)
    }
  } catch (error) {
    console.error("Upload error:", error);

    return c.json({
      message: "Failed to upload file",
      error: error instanceof Error ? error.message : "Unknown error"
    }, 500)
  }

})



export default app
