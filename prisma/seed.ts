import { PrismaClient, Prisma } from "@prisma/client";
import seeds from "./seeds.json";

const prisma = new PrismaClient();

type MovieId = Prisma.MovieCreateInput["id"];

type MovieData = {
  movies: { [id: MovieId]: Prisma.MovieCreateInput };
  data: Array<MovieId>;
};

const movies: MovieData = seeds.movies;

async function main() {
  console.log(`Start seeding ...`);
  console.log(`Seeding movies ...`);
  for (const data of Object.values(movies.movies)) {
    const movie = await prisma.movie.upsert({
      where: { id: data.id },
      create: data,
      update: {}
    });
    console.log(`Created movie ${movie.title}`);
  }
  console.log(`Movies seeded ...`);
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
