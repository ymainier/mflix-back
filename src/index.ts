import { PrismaClient } from "@prisma/client";
import express, { Response } from "express";

const { VLC_AUTH, VLC_REQUEST_URL } = process.env;
const prisma = new PrismaClient();
const app = express();

function notFound(res: Response): void {
  res.status(404).json({ errors: [{ code: 404, title: "Not Found" }] });
}

function url(path: string, qs?: Record<string, string | number>): string {
  // Encoding the URL properly cause issue with filename containing spaces
  let _url = `${VLC_REQUEST_URL}/${path}`;
  if (qs) {
    _url += `?${Object.entries(qs)
      .map(([k, v]) => `${k}=${v}`)
      .join("&")}`;
  }
  return _url;
}

async function request(url: string) {
  // @ts-ignore fetch is still considered experimental in Node 18
  return await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${VLC_AUTH}`).toString("base64")}`,
    },
  });
}

export async function status(qs: Record<string, string | number> = {}) {
  const result = await request(url("status.json", qs));
  return await result.json();
}

export async function playlist() {
  const result = await request(url("playlist.json"));
  return await result.json();
}

app.use(express.json());

app.get("/movies", async (req, res) => {
  const movies = await prisma.movie.findMany();
  res.json({ data: movies });
});

app.get(`/movies/:id`, async (req, res) => {
  const { id }: { id: string } = req.params;

  const movie = await prisma.movie.findUnique({ where: { id } });
  if (movie === null) {
    notFound(res);
    return;
  }
  res.json({ data: movie });
});

app.get("/shows", async (req, res) => {
  const show = await prisma.show.findMany();
  res.json({ data: show });
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
  res.json({ data: show.seasons });
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
  res.json({ data: show.seasons[0].episodes });
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
    if (
      show === null ||
      show.seasons.length === 0 ||
      show.seasons[0].episodes.length === 0
    ) {
      notFound(res);
      return;
    }
    res.json({ data: show.seasons[0].episodes[0] });
  }
);

app.post(`/player/play`, async (req, res) => {
  const { file } = req.query;

  if (typeof file !== "string") {
    res.status(404).json({
      errors: [
        {
          code: 404,
          title: "Bad Request",
          description:
            "Specify the file to play in a `file` query string parameter",
        },
      ],
    });
    return;
  }

  try {
    await status({ command: "pl_empty" });
    await status({ command: "in_play", input: file });
    res.status(200).json({ data: {} });
  } catch (e) {
    res.status(500).json({
      errors: [
        { status: 500, title: "Internal Server Error", description: `${e}}` },
      ],
    });
  }
});

app.post(`/player/stop`, async (_req, res) => {
  try {
    await status({ command: "pl_play" });
    await status({ command: "pl_stop" });
    await status({ command: "pl_empty" });
    res.status(200).json({ data: {} });
  } catch (e) {
    res.status(500).json({
      errors: [
        { status: 500, title: "Internal Server Error", description: `${e}}` },
      ],
    });
  }
});

app.post(`/player/togglePause`, async (_req, res) => {
  try {
    await status({ command: "pl_pause" });
    res.status(200).json({ data: {} });
  } catch (e) {
    res.status(500).json({
      errors: [
        { status: 500, title: "Internal Server Error", description: `${e}}` },
      ],
    });
  }
});

const NUMBER_REGEXP = /^\d+$/;

app.post(`/player/seek`, async (req, res) => {
  const { value } = req.query;

  if (typeof value !== "string" || !value.match(NUMBER_REGEXP)) {
    res.status(404).json({
      errors: [
        {
          code: 404,
          title: "Bad Request",
          description:
            "Specify the value to seek to in `value` query string parameter",
        },
      ],
    });
    return;
  }
  const val = parseInt(value, 10);

  try {
    await status({ command: "pl_play" });
    await status({ command: "seek", val });
    res.status(200).json({ data: {} });
  } catch (e) {
    res.status(500).json({
      errors: [
        { status: 500, title: "Internal Server Error", description: `${e}}` },
      ],
    });
  }
});

app.get(`/player/status`, async (_req, res) => {
  try {
    const [statusData, playlistData] = await Promise.all([
      status(),
      playlist(),
    ]);
    const maybeUri: string | undefined = playlistData?.children?.find(
      (child: { name?: string }) => child.name === "Playlist"
    )?.children?.[0]?.uri;
    const fullpath =
      typeof maybeUri !== "undefined"
        ? decodeURI(new URL(maybeUri).pathname)
        : undefined;
    res.status(200).json({
      data: {
        status: statusData.state,
        time: statusData.time,
        length: statusData.length,
        fullpath,
      },
    });
  } catch (e) {
    res.status(500).json({
      errors: [
        { status: 500, title: "Internal Server Error", description: `${e}}` },
      ],
    });
  }
});

const PORT = 3000;
const server = app.listen(PORT, () =>
  console.log(`
🚀 Server ready at: http://localhost:${PORT}`)
);
