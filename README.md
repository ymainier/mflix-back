# Backend for mflix

Install stuff.
```
npm install
```

Make sure to have a `.env` file defining a `DATABASE_URL`. Something like the following
```
DATABASE_URL="file:./dev.db"
```

Migrate the database.
```
npx prisma migrate deploy
```

Maybe seeds it (you'll need a proper `seeds.json` file).
```
npx prisma db seed
```

Compile it, run it.
```
npx tsc
VLC_REQUEST_URL=http://192.168.1.5:9999/requests node dist/src/index.js
```
