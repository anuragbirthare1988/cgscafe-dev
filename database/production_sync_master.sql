-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  super_category text NOT NULL,
  sub_category_name text NOT NULL,
  sub_category_desc text,
  origin_type text,
  tag text,
  is_hidden boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  legacy_index integer,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  qty text,
  display_price numeric,
  is_featured boolean DEFAULT false,
  is_hidden boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  legacy_index integer,
  image_url text,
  image_path text,
  total_cost numeric DEFAULT 0.00,
  custom_price numeric DEFAULT 0.00,
  custom_margin numeric DEFAULT 0.00,
  base_price numeric,
  used_qty numeric,
  bulk_qty numeric,
  bulk_cost numeric,
  ingredients_json jsonb,
  CONSTRAINT items_pkey PRIMARY KEY (id),
  CONSTRAINT items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.ingredients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  unit text,
  cost_per_unit numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ingredients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.recipe_ingredients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  ingredient_id uuid NOT NULL,
  quantity numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id),
  CONSTRAINT recipe_ingredients_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id),
  CONSTRAINT recipe_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id)
);
CREATE TABLE public.site_settings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.live_menu (
  id integer NOT NULL,
  menu_json jsonb
  updated_at timestamp with time zone,
  CONSTRAINT live_menu_pkey PRIMARY KEY (id)
);
CREATE TABLE public.app_settings (
  id integer NOT NULL DEFAULT nextval('app_settings_id_seq'::regclass),
  base_margin numeric DEFAULT 35,
  setting_key text UNIQUE,
  value boolean,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT app_settings_pkey PRIMARY KEY (id)
);