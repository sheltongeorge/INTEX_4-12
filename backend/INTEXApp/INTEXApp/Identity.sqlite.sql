BEGIN TRANSACTION;
DROP TABLE IF EXISTS "AspNetRoleClaims";
CREATE TABLE "AspNetRoleClaims" (
	"Id"	INTEGER NOT NULL,
	"RoleId"	TEXT NOT NULL,
	"ClaimType"	TEXT,
	"ClaimValue"	TEXT,
	CONSTRAINT "PK_AspNetRoleClaims" PRIMARY KEY("Id" AUTOINCREMENT),
	CONSTRAINT "FK_AspNetRoleClaims_AspNetRoles_RoleId" FOREIGN KEY("RoleId") REFERENCES "AspNetRoles"("Id") ON DELETE CASCADE
);
DROP TABLE IF EXISTS "AspNetRoles";
CREATE TABLE "AspNetRoles" (
	"Id"	TEXT NOT NULL,
	"Name"	TEXT,
	"NormalizedName"	TEXT,
	"ConcurrencyStamp"	TEXT,
	CONSTRAINT "PK_AspNetRoles" PRIMARY KEY("Id")
);
DROP TABLE IF EXISTS "AspNetUserClaims";
CREATE TABLE "AspNetUserClaims" (
	"Id"	INTEGER NOT NULL,
	"UserId"	TEXT NOT NULL,
	"ClaimType"	TEXT,
	"ClaimValue"	TEXT,
	CONSTRAINT "PK_AspNetUserClaims" PRIMARY KEY("Id" AUTOINCREMENT),
	CONSTRAINT "FK_AspNetUserClaims_AspNetUsers_UserId" FOREIGN KEY("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE
);
DROP TABLE IF EXISTS "AspNetUserLogins";
CREATE TABLE "AspNetUserLogins" (
	"LoginProvider"	TEXT NOT NULL,
	"ProviderKey"	TEXT NOT NULL,
	"ProviderDisplayName"	TEXT,
	"UserId"	TEXT NOT NULL,
	CONSTRAINT "PK_AspNetUserLogins" PRIMARY KEY("LoginProvider","ProviderKey"),
	CONSTRAINT "FK_AspNetUserLogins_AspNetUsers_UserId" FOREIGN KEY("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE
);
DROP TABLE IF EXISTS "AspNetUserRoles";
CREATE TABLE "AspNetUserRoles" (
	"UserId"	TEXT NOT NULL,
	"RoleId"	TEXT NOT NULL,
	CONSTRAINT "PK_AspNetUserRoles" PRIMARY KEY("UserId","RoleId"),
	CONSTRAINT "FK_AspNetUserRoles_AspNetRoles_RoleId" FOREIGN KEY("RoleId") REFERENCES "AspNetRoles"("Id") ON DELETE CASCADE,
	CONSTRAINT "FK_AspNetUserRoles_AspNetUsers_UserId" FOREIGN KEY("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE
);
DROP TABLE IF EXISTS "AspNetUserTokens";
CREATE TABLE "AspNetUserTokens" (
	"UserId"	TEXT NOT NULL,
	"LoginProvider"	TEXT NOT NULL,
	"Name"	TEXT NOT NULL,
	"Value"	TEXT,
	CONSTRAINT "PK_AspNetUserTokens" PRIMARY KEY("UserId","LoginProvider","Name"),
	CONSTRAINT "FK_AspNetUserTokens_AspNetUsers_UserId" FOREIGN KEY("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE
);
DROP TABLE IF EXISTS "AspNetUsers";
CREATE TABLE "AspNetUsers" (
	"Id"	TEXT NOT NULL,
	"UserName"	TEXT,
	"NormalizedUserName"	TEXT,
	"Email"	TEXT,
	"NormalizedEmail"	TEXT,
	"EmailConfirmed"	INTEGER NOT NULL,
	"PasswordHash"	TEXT,
	"SecurityStamp"	TEXT,
	"ConcurrencyStamp"	TEXT,
	"PhoneNumber"	TEXT,
	"PhoneNumberConfirmed"	INTEGER NOT NULL,
	"TwoFactorEnabled"	INTEGER NOT NULL,
	"LockoutEnd"	TEXT,
	"LockoutEnabled"	INTEGER NOT NULL,
	"AccessFailedCount"	INTEGER NOT NULL,
	CONSTRAINT "PK_AspNetUsers" PRIMARY KEY("Id")
);
DROP TABLE IF EXISTS "__EFMigrationsHistory";
CREATE TABLE "__EFMigrationsHistory" (
	"MigrationId"	TEXT NOT NULL,
	"ProductVersion"	TEXT NOT NULL,
	CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY("MigrationId")
);
INSERT INTO "AspNetRoles" ("Id","Name","NormalizedName","ConcurrencyStamp") VALUES ('eb436316-caca-42f4-a219-48429edba031','Administrator','ADMINISTRATOR',NULL);
INSERT INTO "AspNetUserRoles" ("UserId","RoleId") VALUES ('e01120d4-5081-446d-abf7-8af0add08f3a','eb436316-caca-42f4-a219-48429edba031');
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('f6bc04a2-88f5-4829-9a4d-77a67dad31d8','test@test.com','TEST@TEST.COM','test@test.com','TEST@TEST.COM',0,'AQAAAAIAAYagAAAAECXDkL6EL9HpJOV+7iBxxw91Z4p4mOdcvW5/wVSoor5PaXmOdOgVTjgsjV9fTUFYrg==','3ZZC73TUFAK6URVLGKTQGXSZ5XKTB7BG','1485f9df-2392-4dd1-ada9-6be407fbba02',NULL,0,0,NULL,1,0);
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('4d1ab384-e84c-46eb-97f9-a38c73e6d70a','test@test2.com','TEST@TEST2.COM','test@test2.com','TEST@TEST2.COM',0,'AQAAAAIAAYagAAAAEKQRhTiC4vyA/oxSUcJ6ZsgPMrdI+te8Ot6Xn7sLBDtgzLBNGi2+/rRJ664craBnig==','56KJMW56SM332E3JEZBEPFZL6YU727IV','566224d8-3670-4c87-8a17-1ec0a0717b49',NULL,0,0,NULL,1,0);
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('53697435-e2f1-45ba-93ee-7e979088eb8c','test@test3.com','TEST@TEST3.COM','test@test3.com','TEST@TEST3.COM',0,'AQAAAAIAAYagAAAAEAYF5Hfvd3n/4hQJkUaNA07y5GKMcUz6e7UPthbGe93TQyqrk1kYE58POBdblfbXkw==','6FSKC2HJGKZHSZX3PIDTWHUNIUQH6FK3','f79d869e-6668-4981-a1a3-4fa31098f9ef',NULL,0,0,NULL,1,0);
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('e01120d4-5081-446d-abf7-8af0add08f3a','shelton.i.george@gmail.com','SHELTON.I.GEORGE@GMAIL.COM','shelton.i.george@gmail.com','SHELTON.I.GEORGE@GMAIL.COM',0,'AQAAAAIAAYagAAAAEBHBLveZ1g76aYjmUC59dhodmjCtmou/KghTktV3aBJO9KfxsS1CTrg2xTDeiFPOcQ==','4HJZAORPH6QDHMRLK3TI3U6TFGV4WE7M','6d7031ca-34e4-4015-82aa-a5b55899f6da',NULL,0,0,NULL,1,0);
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('3e6055a1-3061-46b6-a1ae-483bce9589eb','esmith@hotmail.com','ESMITH@HOTMAIL.COM','esmith@hotmail.com','ESMITH@HOTMAIL.COM',0,'AQAAAAIAAYagAAAAEM56FGbysR6sjgEYiKZR+I9CZrIGYdycKVBICicadq8qiH9jwKHLitTduqpnuFDUyw==','LPLFXIADIPHKAZJ3L3ME34CP4V6V3VNM','dbb4512e-73ec-4463-ab04-1001c898dcce',NULL,0,0,NULL,1,0);
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('900ad18b-e206-4ba3-8367-74601f2ed005','callahanmichael@gmail.com','CALLAHANMICHAEL@GMAIL.COM','callahanmichael@gmail.com','CALLAHANMICHAEL@GMAIL.COM',0,'AQAAAAIAAYagAAAAEK8N4QlbKETUvKcCT7unOalLuGDK3zLmbS9UJ43cOEPNtk3laQAc+G2GB+RvqYtC/A==','STEWAJR577QU5VZPOOE4F26374QY7KSP','f7c0ed91-037d-40be-9dd3-4b21392bf9c3',NULL,0,0,NULL,1,0);
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('272714b4-ed62-436c-9e4e-eacb1072b5a4','acline@shelton.biz','ACLINE@SHELTON.BIZ','acline@shelton.biz','ACLINE@SHELTON.BIZ',0,'AQAAAAIAAYagAAAAELh6L7E50ddLI/3nSZ5+bbuMTWW3JT7bfIhBPuu2EvK3BbrPUtnVIEW2LRDYbkL5JA==','2MSXZSUWWKRBE6EDYDOFH7ARI4DPGNO2','1d33d672-1726-47ed-94ad-b201ccd7dbe2',NULL,0,0,NULL,1,0);
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('129d7e66-eb65-492f-989e-e47ac77f6d86','deborah33@yahoo.com','DEBORAH33@YAHOO.COM','deborah33@yahoo.com','DEBORAH33@YAHOO.COM',0,'AQAAAAIAAYagAAAAEKhXk13msTDpiK28qqewgHC/8TS8aMmi2nBk3S0t7qvqOC8MY04Th2s8x5x+rp/gYg==','T7K6G7BX7S7FUYVD5DVQDHM36BSJQ7EY','b9c8012f-2b3b-4264-8dfc-2149f7d509c1',NULL,0,0,NULL,1,0);
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('533b8996-0a89-4c7b-be21-f34d72749be3','amycastillo@larsen.com','AMYCASTILLO@LARSEN.COM','amycastillo@larsen.com','AMYCASTILLO@LARSEN.COM',0,'AQAAAAIAAYagAAAAENys8+nR3qbYJskiSE/8n9ha22JK0N5YFJy9fdFnr6sd8KKhRzo5RanB0iPVhz9D4Q==','JWSBMHHBYIBTVQ5TSCAXEBXUFCN6SHWZ','dc57f518-e91b-4373-bb62-27a6aee45be9',NULL,0,0,NULL,1,0);
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('7e83e2ad-ee07-49e3-b07f-053d6005b574','test@test4.com','TEST@TEST4.COM','test@test4.com','TEST@TEST4.COM',0,'AQAAAAIAAYagAAAAEGNNjRDzfjYXuA/IT9Q5ka5f/En8AGSI31ZkqNDZT0WeSoUxwimiXRh+WmpzD97fqw==','WXSXI5UHN5J3QUUP4BFBT7Y7RDGTRAG2','7e1c16cb-efd2-40a1-bca4-a3e7107ff4b8',NULL,0,0,NULL,1,0);
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('4ab83d24-a5dd-47c1-8482-72358f736bef','test5@test.com','TEST5@TEST.COM','test5@test.com','TEST5@TEST.COM',0,'AQAAAAIAAYagAAAAEPQVk9l4BVQZKp4y83u1UID1pUeIQrF/u/4Gm/ihGVffbJmkkvA+qGMWU8Gbz95rRA==','IA5JJXBCU6BW3WCU6KOKTA6FBJAWCM5I','0074ec36-4288-4764-ae38-41de1c142ab9',NULL,0,0,NULL,1,0);
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('e79baeec-0c3d-4ec0-b11d-b2cf0eac834e','test6@test.com','TEST6@TEST.COM','test6@test.com','TEST6@TEST.COM',0,'AQAAAAIAAYagAAAAEA+ClOyWDvUe3A/ZhCIvc/gOJZzeSGjOKUZ+fFg2syR+ut6gnfVl2JQk/JhJinVblw==','4HZVUJZGWPQ4XS6T7HSPWOML2PVRTPYC','a7ae9704-1ec3-4f21-9773-7fd9accc47e1',NULL,0,0,NULL,1,0);
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('7bb930e8-8058-4f9d-abd7-7b67ca88372f','test6@gmail.com','TEST6@GMAIL.COM','test6@gmail.com','TEST6@GMAIL.COM',0,'AQAAAAIAAYagAAAAEGsh8wPQgAFymVjzPNpveHQVBpU9792chImHF2gON4E6j6eHK5dt4x6xzu4DosDdGw==','3MIQ6Q3KLAMJUGIL3GUNIEPZ7OUFGKWM','8a42a7e6-19f3-4113-b200-87a54aa2c54d',NULL,0,0,NULL,1,0);
INSERT INTO "AspNetUsers" ("Id","UserName","NormalizedUserName","Email","NormalizedEmail","EmailConfirmed","PasswordHash","SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed","TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount") VALUES ('46453203-364b-499a-9950-913bf659410e','test7@gmail.com','TEST7@GMAIL.COM','test7@gmail.com','TEST7@GMAIL.COM',0,'AQAAAAIAAYagAAAAEK7YacolpG7KbKhnKjlSKhBWDf0DYLZK+muT0W41e2iAfO696ODytfToYbGkt/XvmQ==','YEIFGDYUCZW4EDW327KNNS7ZETXJAVAH','0dfb0323-a947-46cf-b6ce-5ba44510ca91',NULL,0,0,NULL,1,0);
INSERT INTO "__EFMigrationsHistory" ("MigrationId","ProductVersion") VALUES ('20250405155858_InitialCreate','8.0.4');
DROP INDEX IF EXISTS "EmailIndex";
CREATE INDEX "EmailIndex" ON "AspNetUsers" (
	"NormalizedEmail"
);
DROP INDEX IF EXISTS "IX_AspNetRoleClaims_RoleId";
CREATE INDEX "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims" (
	"RoleId"
);
DROP INDEX IF EXISTS "IX_AspNetUserClaims_UserId";
CREATE INDEX "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims" (
	"UserId"
);
DROP INDEX IF EXISTS "IX_AspNetUserLogins_UserId";
CREATE INDEX "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins" (
	"UserId"
);
DROP INDEX IF EXISTS "IX_AspNetUserRoles_RoleId";
CREATE INDEX "IX_AspNetUserRoles_RoleId" ON "AspNetUserRoles" (
	"RoleId"
);
DROP INDEX IF EXISTS "RoleNameIndex";
CREATE UNIQUE INDEX "RoleNameIndex" ON "AspNetRoles" (
	"NormalizedName"
);
DROP INDEX IF EXISTS "UserNameIndex";
CREATE UNIQUE INDEX "UserNameIndex" ON "AspNetUsers" (
	"NormalizedUserName"
);
COMMIT;
