import { Prisma, PrismaClient } from "@prisma/client";
import express, { Response } from "express";

const prisma = new PrismaClient();
const app = express();

function notFound(res: Response): void {
  res.status(404).json({ error: { code: 404, message: "Not Found" } });
}

app.use(express.json());

app.get("/movies", async (req, res) => {
  const movie = await prisma.movie.findMany();
  res.json(movie);
});

app.get(`/movies/:id`, async (req, res) => {
  const { id }: { id: string } = req.params;

  const movie = await prisma.movie.findUnique({ where: { id } });
  if (movie === null) {
    notFound(res);
    return;
  }
  res.json(movie);
});

app.get("/shows", async (req, res) => {
  const show = await prisma.show.findMany();
  res.json(show);
});

app.get(`/shows/:showId/seasons`, async (req, res) => {
  const { showId }: { showId: string } = req.params;

  const show = await prisma.show.findUnique({
    where: { id: showId },
    select: { seasons: true },
  });
  if (show === null) {
    notFound(res);
    return;
  }
  res.json(show.seasons);
});

app.get(`/shows/:showId/seasons/:seasonId/episodes`, async (req, res) => {
  const { showId, seasonId }: { showId: string; seasonId: string } = req.params;

  const show = await prisma.show.findUnique({
    where: { id: showId },
    select: {
      seasons: { where: { id: seasonId }, select: { episodes: true } },
    },
  });
  if (show === null || show.seasons.length === 0) {
    notFound(res);
    return;
  }
  res.json(show.seasons[0].episodes);
});

app.get(
  `/shows/:showId/seasons/:seasonId/episodes/:episodeId`,
  async (req, res) => {
    const {
      showId,
      seasonId,
      episodeId,
    }: { showId: string; seasonId: string; episodeId: string } = req.params;

    const show = await prisma.show.findUnique({
      where: { id: showId },
      select: {
        seasons: {
          where: { id: seasonId },
          select: { episodes: { where: { id: episodeId } } },
        },
      },
    });
    if (show === null || show.seasons.length === 0 || show.seasons[0].episodes.length === 0) {
      notFound(res);
      return;
    }
    res.json(show.seasons[0].episodes[0]);
  }
);

const PORT = 3000;
const server = app.listen(PORT, () =>
  console.log(`
🚀 Server ready at: http://localhost:${PORT}`)
);
