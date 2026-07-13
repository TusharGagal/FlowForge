/*
  Warnings:

  - You are about to drop the column `value` on the `Credential` table. All the data in the column will be lost.
  - Added the required column `config` to the `Credential` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Credential" DROP COLUMN "value",
ADD COLUMN     "config" JSONB NOT NULL;
