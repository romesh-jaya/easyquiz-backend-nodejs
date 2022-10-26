CREATE TYPE "quiz_progress_type" AS ENUM (
  'ordered',
  'random'
);

CREATE TYPE "quiz_status" AS ENUM (
  'unpublished',
  'published',
  'archived'
);

CREATE TYPE "question_type" AS ENUM (
  'multiple_choice',
  'single_choice'
);

CREATE TYPE "quiz_attempt_status" AS ENUM (
  'started',
  'completed'
);

CREATE TYPE "user_status" AS ENUM (
  'active',
  'archived'
);

CREATE TABLE "quiz" (
  "id" uuid PRIMARY KEY NOT NULL,
  "created_by_user" varchar(32) NOT NULL,
  "name" varchar(16) NOT NULL,
  "description" varchar(256) NOT NULL,
  "status" quiz_status DEFAULT 'unpublished',
  "no_of_questions" integer,
  "question_order" varchar[],
  "pass_mark_percentage" numeric,
  "can_retake_quiz" boolean NOT NULL DEFAULT false,
  "last_updated" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "quiz_question" (
  "id" uuid NOT NULL,
  "quiz_id" uuid NOT NULL,
  "question_content" varchar(1024) NOT NULL,
  "answers" varchar NOT NULL,
  "revision" int NOT NULL DEFAULT 1,
  "question_type" question_type NOT NULL,
  "last_updated" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("id", "quiz_id")
);

CREATE TABLE "quiz_attempt" (
  "id" uuid NOT NULL,
  "quiz_id" uuid NOT NULL,
  "user_email" varchar(32) NOT NULL,
  "status" quiz_attempt_status DEFAULT 'started',
  "questions" varchar NOT NULL,
  "answers" varchar,
  "next_question_no" int NOT NULL,
  "score" numeric,
  "last_updated" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("id", "quiz_id")
);

CREATE TABLE "quiz_user" (
  "email" varchar(32) PRIMARY KEY NOT NULL,
  "first_name" varchar(64) NOT NULL,
  "last_name" varchar(64) NOT NULL,
  "photo_url" varchar,
  "status" user_status DEFAULT 'active',
  "last_updated" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "quiz_question" ADD FOREIGN KEY ("quiz_id") REFERENCES "quiz" ("id");

ALTER TABLE "quiz_attempt" ADD FOREIGN KEY ("quiz_id") REFERENCES "quiz" ("id");

ALTER TABLE "quiz" ADD FOREIGN KEY ("created_by_user") REFERENCES "quiz_user" ("email");

ALTER TABLE "quiz_attempt" ADD FOREIGN KEY ("user_email") REFERENCES "quiz_user" ("email");
