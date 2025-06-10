/*
  Warnings:

  - You are about to drop the column `description` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `numId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `poster` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Review` table. All the data in the column will be lost.
  - Added the required column `metadata` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movieData` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movieId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" DROP COLUMN "description",
DROP COLUMN "numId",
DROP COLUMN "poster",
DROP COLUMN "title",
DROP COLUMN "year",
ADD COLUMN     "metadata" JSONB NOT NULL,
ADD COLUMN     "movieData" JSONB NOT NULL,
ADD COLUMN     "movieId" INTEGER NOT NULL;
