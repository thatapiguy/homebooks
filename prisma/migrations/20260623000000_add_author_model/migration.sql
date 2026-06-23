-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_name_key" ON "Author"("name");

-- Add authorId column to Book
ALTER TABLE "Book" ADD COLUMN "authorId" TEXT;

-- Populate Author from existing book.author strings (ignore duplicates)
INSERT OR IGNORE INTO "Author" ("id", "name")
SELECT lower(hex(randomblob(9))), "author" FROM "Book"
WHERE "author" IS NOT NULL AND "author" != '';

-- Link existing books to their new Author records
UPDATE "Book" SET "authorId" = (
    SELECT "id" FROM "Author" WHERE "Author"."name" = "Book"."author"
) WHERE "author" IS NOT NULL AND "author" != '';

-- Recreate Book table to drop old "author" column and add FK constraint
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isbn" TEXT,
    "isbn13" TEXT,
    "title" TEXT NOT NULL,
    "publisher" TEXT,
    "year" INTEGER,
    "description" TEXT,
    "coverUrl" TEXT,
    "pageCount" INTEGER,
    "rating" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'want_to_read',
    "locationId" TEXT,
    "authorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "new_Book_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "new_Book_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Book" ("id", "isbn", "isbn13", "title", "publisher", "year", "description", "coverUrl", "pageCount", "rating", "status", "locationId", "authorId", "createdAt", "updatedAt")
SELECT "id", "isbn", "isbn13", "title", "publisher", "year", "description", "coverUrl", "pageCount", "rating", "status", "locationId", "authorId", "createdAt", "updatedAt"
FROM "Book";

DROP TABLE "Book";

ALTER TABLE "new_Book" RENAME TO "Book";

CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
CREATE UNIQUE INDEX "Book_isbn13_key" ON "Book"("isbn13");

PRAGMA foreign_keys=ON;
