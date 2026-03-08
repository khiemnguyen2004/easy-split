drop extension if exists "pg_net";


  create table "public"."debt_settlements" (
    "settlement_id" uuid not null default gen_random_uuid(),
    "group_id" uuid,
    "debtor_id" uuid,
    "creditor_id" uuid,
    "amount" numeric(15,2) not null,
    "status" character varying(20) default 'unpaid'::character varying,
    "proof_image_url" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."debt_settlements" enable row level security;


  create table "public"."expense_splits" (
    "split_id" uuid not null default gen_random_uuid(),
    "expense_id" uuid,
    "user_id" uuid,
    "share_amount" numeric(15,2) not null,
    "status" character varying(20) default 'pending'::character varying
      );


alter table "public"."expense_splits" enable row level security;


  create table "public"."expenses" (
    "expense_id" uuid not null default gen_random_uuid(),
    "group_id" uuid,
    "payer_id" uuid,
    "amount" numeric(15,2) not null,
    "description" text,
    "category" character varying(50),
    "image_url" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."expenses" enable row level security;


  create table "public"."group_members" (
    "group_id" uuid not null,
    "user_id" uuid not null,
    "role" character varying(20) default 'member'::character varying,
    "joined_at" timestamp with time zone default now()
      );


alter table "public"."group_members" enable row level security;


  create table "public"."groups" (
    "group_id" uuid not null default gen_random_uuid(),
    "group_name" text not null,
    "invite_code" character varying(10) not null,
    "description" text,
    "created_by" uuid,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."groups" enable row level security;


  create table "public"."profiles" (
    "user_id" uuid not null,
    "full_name" text not null,
    "email" text not null,
    "phone_number" character varying(15),
    "avatar_url" text,
    "bank_info" jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX debt_settlements_pkey ON public.debt_settlements USING btree (settlement_id);

CREATE UNIQUE INDEX expense_splits_pkey ON public.expense_splits USING btree (split_id);

CREATE UNIQUE INDEX expenses_pkey ON public.expenses USING btree (expense_id);

CREATE UNIQUE INDEX group_members_pkey ON public.group_members USING btree (group_id, user_id);

CREATE UNIQUE INDEX groups_invite_code_key ON public.groups USING btree (invite_code);

CREATE UNIQUE INDEX groups_pkey ON public.groups USING btree (group_id);

CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (user_id);

alter table "public"."debt_settlements" add constraint "debt_settlements_pkey" PRIMARY KEY using index "debt_settlements_pkey";

alter table "public"."expense_splits" add constraint "expense_splits_pkey" PRIMARY KEY using index "expense_splits_pkey";

alter table "public"."expenses" add constraint "expenses_pkey" PRIMARY KEY using index "expenses_pkey";

alter table "public"."group_members" add constraint "group_members_pkey" PRIMARY KEY using index "group_members_pkey";

alter table "public"."groups" add constraint "groups_pkey" PRIMARY KEY using index "groups_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."debt_settlements" add constraint "debt_settlements_creditor_id_fkey" FOREIGN KEY (creditor_id) REFERENCES public.profiles(user_id) not valid;

alter table "public"."debt_settlements" validate constraint "debt_settlements_creditor_id_fkey";

alter table "public"."debt_settlements" add constraint "debt_settlements_debtor_id_fkey" FOREIGN KEY (debtor_id) REFERENCES public.profiles(user_id) not valid;

alter table "public"."debt_settlements" validate constraint "debt_settlements_debtor_id_fkey";

alter table "public"."debt_settlements" add constraint "debt_settlements_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(group_id) ON DELETE CASCADE not valid;

alter table "public"."debt_settlements" validate constraint "debt_settlements_group_id_fkey";

alter table "public"."expense_splits" add constraint "expense_splits_expense_id_fkey" FOREIGN KEY (expense_id) REFERENCES public.expenses(expense_id) ON DELETE CASCADE not valid;

alter table "public"."expense_splits" validate constraint "expense_splits_expense_id_fkey";

alter table "public"."expense_splits" add constraint "expense_splits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) not valid;

alter table "public"."expense_splits" validate constraint "expense_splits_user_id_fkey";

alter table "public"."expenses" add constraint "expenses_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(group_id) ON DELETE CASCADE not valid;

alter table "public"."expenses" validate constraint "expenses_group_id_fkey";

alter table "public"."expenses" add constraint "expenses_payer_id_fkey" FOREIGN KEY (payer_id) REFERENCES public.profiles(user_id) not valid;

alter table "public"."expenses" validate constraint "expenses_payer_id_fkey";

alter table "public"."group_members" add constraint "group_members_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(group_id) ON DELETE CASCADE not valid;

alter table "public"."group_members" validate constraint "group_members_group_id_fkey";

alter table "public"."group_members" add constraint "group_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE not valid;

alter table "public"."group_members" validate constraint "group_members_user_id_fkey";

alter table "public"."groups" add constraint "groups_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) not valid;

alter table "public"."groups" validate constraint "groups_created_by_fkey";

alter table "public"."groups" add constraint "groups_invite_code_key" UNIQUE using index "groups_invite_code_key";

alter table "public"."profiles" add constraint "profiles_email_key" UNIQUE using index "profiles_email_key";

alter table "public"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

grant delete on table "public"."debt_settlements" to "anon";

grant insert on table "public"."debt_settlements" to "anon";

grant references on table "public"."debt_settlements" to "anon";

grant select on table "public"."debt_settlements" to "anon";

grant trigger on table "public"."debt_settlements" to "anon";

grant truncate on table "public"."debt_settlements" to "anon";

grant update on table "public"."debt_settlements" to "anon";

grant delete on table "public"."debt_settlements" to "authenticated";

grant insert on table "public"."debt_settlements" to "authenticated";

grant references on table "public"."debt_settlements" to "authenticated";

grant select on table "public"."debt_settlements" to "authenticated";

grant trigger on table "public"."debt_settlements" to "authenticated";

grant truncate on table "public"."debt_settlements" to "authenticated";

grant update on table "public"."debt_settlements" to "authenticated";

grant delete on table "public"."debt_settlements" to "service_role";

grant insert on table "public"."debt_settlements" to "service_role";

grant references on table "public"."debt_settlements" to "service_role";

grant select on table "public"."debt_settlements" to "service_role";

grant trigger on table "public"."debt_settlements" to "service_role";

grant truncate on table "public"."debt_settlements" to "service_role";

grant update on table "public"."debt_settlements" to "service_role";

grant delete on table "public"."expense_splits" to "anon";

grant insert on table "public"."expense_splits" to "anon";

grant references on table "public"."expense_splits" to "anon";

grant select on table "public"."expense_splits" to "anon";

grant trigger on table "public"."expense_splits" to "anon";

grant truncate on table "public"."expense_splits" to "anon";

grant update on table "public"."expense_splits" to "anon";

grant delete on table "public"."expense_splits" to "authenticated";

grant insert on table "public"."expense_splits" to "authenticated";

grant references on table "public"."expense_splits" to "authenticated";

grant select on table "public"."expense_splits" to "authenticated";

grant trigger on table "public"."expense_splits" to "authenticated";

grant truncate on table "public"."expense_splits" to "authenticated";

grant update on table "public"."expense_splits" to "authenticated";

grant delete on table "public"."expense_splits" to "service_role";

grant insert on table "public"."expense_splits" to "service_role";

grant references on table "public"."expense_splits" to "service_role";

grant select on table "public"."expense_splits" to "service_role";

grant trigger on table "public"."expense_splits" to "service_role";

grant truncate on table "public"."expense_splits" to "service_role";

grant update on table "public"."expense_splits" to "service_role";

grant delete on table "public"."expenses" to "anon";

grant insert on table "public"."expenses" to "anon";

grant references on table "public"."expenses" to "anon";

grant select on table "public"."expenses" to "anon";

grant trigger on table "public"."expenses" to "anon";

grant truncate on table "public"."expenses" to "anon";

grant update on table "public"."expenses" to "anon";

grant delete on table "public"."expenses" to "authenticated";

grant insert on table "public"."expenses" to "authenticated";

grant references on table "public"."expenses" to "authenticated";

grant select on table "public"."expenses" to "authenticated";

grant trigger on table "public"."expenses" to "authenticated";

grant truncate on table "public"."expenses" to "authenticated";

grant update on table "public"."expenses" to "authenticated";

grant delete on table "public"."expenses" to "service_role";

grant insert on table "public"."expenses" to "service_role";

grant references on table "public"."expenses" to "service_role";

grant select on table "public"."expenses" to "service_role";

grant trigger on table "public"."expenses" to "service_role";

grant truncate on table "public"."expenses" to "service_role";

grant update on table "public"."expenses" to "service_role";

grant delete on table "public"."group_members" to "anon";

grant insert on table "public"."group_members" to "anon";

grant references on table "public"."group_members" to "anon";

grant select on table "public"."group_members" to "anon";

grant trigger on table "public"."group_members" to "anon";

grant truncate on table "public"."group_members" to "anon";

grant update on table "public"."group_members" to "anon";

grant delete on table "public"."group_members" to "authenticated";

grant insert on table "public"."group_members" to "authenticated";

grant references on table "public"."group_members" to "authenticated";

grant select on table "public"."group_members" to "authenticated";

grant trigger on table "public"."group_members" to "authenticated";

grant truncate on table "public"."group_members" to "authenticated";

grant update on table "public"."group_members" to "authenticated";

grant delete on table "public"."group_members" to "service_role";

grant insert on table "public"."group_members" to "service_role";

grant references on table "public"."group_members" to "service_role";

grant select on table "public"."group_members" to "service_role";

grant trigger on table "public"."group_members" to "service_role";

grant truncate on table "public"."group_members" to "service_role";

grant update on table "public"."group_members" to "service_role";

grant delete on table "public"."groups" to "anon";

grant insert on table "public"."groups" to "anon";

grant references on table "public"."groups" to "anon";

grant select on table "public"."groups" to "anon";

grant trigger on table "public"."groups" to "anon";

grant truncate on table "public"."groups" to "anon";

grant update on table "public"."groups" to "anon";

grant delete on table "public"."groups" to "authenticated";

grant insert on table "public"."groups" to "authenticated";

grant references on table "public"."groups" to "authenticated";

grant select on table "public"."groups" to "authenticated";

grant trigger on table "public"."groups" to "authenticated";

grant truncate on table "public"."groups" to "authenticated";

grant update on table "public"."groups" to "authenticated";

grant delete on table "public"."groups" to "service_role";

grant insert on table "public"."groups" to "service_role";

grant references on table "public"."groups" to "service_role";

grant select on table "public"."groups" to "service_role";

grant trigger on table "public"."groups" to "service_role";

grant truncate on table "public"."groups" to "service_role";

grant update on table "public"."groups" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


