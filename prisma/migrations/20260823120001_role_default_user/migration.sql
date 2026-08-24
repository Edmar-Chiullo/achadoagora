-- Default de novos usuários passa a ser USER (admin é criado explicitamente)
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
