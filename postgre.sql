CREATE TABLE public.dance_figures (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dance_id uuid,
  video_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  figure_number integer,
  CONSTRAINT dance_figures_pkey PRIMARY KEY (id),
  CONSTRAINT dance_figures_dance_id_fkey FOREIGN KEY (dance_id) REFERENCES public.dances(id)
);

CREATE TABLE public.dance_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  dance_id uuid,
  image_url text NOT NULL,
  position integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT dance_images_pkey PRIMARY KEY (id),
  CONSTRAINT dance_images_dance_id_fkey FOREIGN KEY (dance_id) REFERENCES public.dances(id)
);

CREATE TABLE public.dances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  history text NOT NULL,
  references text NOT NULL,
  main_video_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  island character varying NOT NULL DEFAULT 'Luzon'::character varying,
  duration character varying,
  performers character varying,
  music character varying,
  costumes character varying,
  status character varying DEFAULT 'pending'::character varying,
  decline_reason text,
  CONSTRAINT dances_pkey PRIMARY KEY (id),
  CONSTRAINT dances_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.user_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  figure_name character varying NOT NULL,
  rating integer CHECK (rating >= 0 AND rating <= 5),
  submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  text_feedback character varying,
  CONSTRAINT user_feedback_pkey PRIMARY KEY (id),
  CONSTRAINT user_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.user_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  score integer,
  attempted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  dance_name text,
  figure_name text,
  CONSTRAINT user_history_pkey PRIMARY KEY (id),
  CONSTRAINT user_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.users (
  id uuid NOT NULL,
  username character varying NOT NULL UNIQUE,
  email character varying NOT NULL UNIQUE,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  role character varying DEFAULT 'user'::character varying CHECK (role::text = ANY (ARRAY['admin'::character varying::text, 'superadmin'::character varying::text, 'user'::character varying::text])),
  status character varying NOT NULL DEFAULT 'Enabled'::character varying,
  age integer,
  gender character varying,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);