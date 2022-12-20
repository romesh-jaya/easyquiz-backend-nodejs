CREATE TYPE "quiz_progress_type" AS ENUM (
  'ordered',
  'random'
);

CREATE TYPE "quiz_status" AS ENUM (
  'unpublished',
  'published',
  'archived'
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

--INDEXES
CREATE UNIQUE INDEX IDX_QUIZ_CREATED_BY_USER_NAME ON public.quiz (created_by_user, name);

CREATE INDEX IDX_QUIZ_LAST_UPDATED ON public.quiz (last_updated);

--TRIGGER FUNCTIONS

CREATE OR REPLACE FUNCTION trigger_set_timestamp_update()
RETURNS TRIGGER 
language plpgsql
AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION TRIGGER_TIMESTAMP_UPDATE_ON_QUIZ_FROM_QUESTION() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
DECLARE
  _quiz_status VARCHAR(20);
BEGIN

	IF TG_OP = 'DELETE' THEN
		SELECT status
		INTO _quiz_status
		FROM public.quiz
		WHERE id = OLD.quiz_id;

		UPDATE public.quiz
		SET last_updated = NOW()
		WHERE id = OLD.quiz_id;
	ELSE
		SELECT status
		INTO _quiz_status
		FROM public.quiz
		WHERE id = NEW.quiz_id;

		UPDATE public.quiz
		SET last_updated = NOW()
		WHERE id = NEW.quiz_id;
	END IF;

	IF _quiz_status = 'published' OR _quiz_status = 'archived' THEN
	  RAISE EXCEPTION 'Cannot add, delete or update questions when the quiz is in Published or Archived state.' USING ERRCODE = 'ZZ999';
	END IF;


  RETURN NEW;
END;
$$;

--TRIGGERS 

CREATE TRIGGER set_timestamp_update
BEFORE UPDATE ON public.quiz
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp_update();

CREATE TRIGGER set_timestamp_update_on_quiz_from_question
BEFORE UPDATE OR INSERT OR DELETE ON public.quiz_question
FOR EACH ROW
EXECUTE PROCEDURE TRIGGER_TIMESTAMP_UPDATE_ON_QUIZ_FROM_QUESTION();

CREATE TRIGGER set_timestamp_update
BEFORE UPDATE ON public.quiz_question
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp_update();