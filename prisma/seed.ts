import { PrismaClient, Prisma } from "@prisma/client";
import seeds from "./seeds.json";

const prisma = new PrismaClient();

type MovieId = Prisma.MovieCreateInput["id"];

type MovieData = {
  movies: { [id: MovieId]: Prisma.MovieCreateInput };
  data: Array<MovieId>;
};

const movies: MovieData = seeds.movies;

type TVShowData = {
  shows: { [id: Prisma.ShowCreateInput["id"]]: Prisma.ShowCreateInput };
  seasons: { [id: Prisma.SeasonCreateInput["id"]]: Prisma.SeasonCreateInput };
  episodes: {
    [id: Prisma.EpisodeCreateInput["id"]]: Prisma.EpisodeCreateInput;
  };
  data: {
    [showId: Prisma.ShowCreateInput["id"]]: {
      [seasonId: Prisma.SeasonCreateInput["id"]]: Array<
        Prisma.EpisodeCreateInput["id"]
      >;
    };
  };
};

const tvshows: TVShowData = seeds.shows;

async function main() {
  console.log(`Start seeding ...`);
  for (const data of Object.values(movies.movies)) {
    const movie = await prisma.movie.upsert({
      where: { id: data.id },
      create: data,
      update: {},
    });
    console.log(`Created movie ${movie.title}`);
  }
  console.log(`Movies seeded ...`);
  console.log(`Seeding shows ...`);
  for (const data of Object.values(tvshows.shows)) {
    const show = await prisma.show.upsert({
      where: { id: data.id },
      create: data,
      update: {},
    });
    console.log(`Created show ${show.title}`);
  }
  console.log(`Shows seeded ...`);
  console.log(`Seeding seasons ...`);
  for (const data of Object.values(tvshows.seasons)) {
    const season = await prisma.season.upsert({
      where: { id: data.id },
      create: data,
      update: {},
    });
    console.log(`Created season ${season.title}`);
  }
  console.log(`Seasons seeded ...`);
  console.log(`Seeding episodes ...`);
  for (const data of Object.values(tvshows.episodes)) {
    const episode = await prisma.episode.upsert({
      where: { id: data.id },
      create: data,
      update: {},
    });
    console.log(`Created season ${episode.title}`);
  }
  console.log(`Episodes seeded ...`);
  console.log(`Seeding show -> seasons -> episodes links ...`);
  for (const [showId, seasons] of Object.entries(tvshows.data)) {
    await prisma.show.update({
      where: { id: showId },
      data: {
        seasons: { set: Object.keys(seasons).map((id) => ({ id })) },
      },
    });
    console.log(`Linked show ${showId} -> seasons ${Object.keys(seasons)}`);
    for (const [seasonId, episodeIdList] of Object.entries(seasons)) {
      await prisma.season.update({
        where: { id: seasonId },
        data: {
          episodes: { set: episodeIdList.map((id) => ({ id })) },
        },
      });
    }
  }
  console.log(`Show -> season links seeded ...`);
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
