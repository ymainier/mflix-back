import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.get("/movies", async (req, res) => {
  const users = await prisma.movie.findMany();
  res.json(users);
});

app.get(`/movies/:id`, async (req, res) => {
  const { id }: { id?: string } = req.params;

  const movie = await prisma.movie.findUnique({ where: { id } });
  if (movie === null) {
    res.status(404).json({ error: { code: 404, message: "Not Found" } });
  } else {
    res.json(movie);
  }
});

const PORT = 3000;
const server = app.listen(PORT, () =>
  console.log(`
🚀 Server ready at: http://localhost:${PORT}`)
);
