CREATE TABLE "cercania" (
	"id_cercania" serial PRIMARY KEY NOT NULL,
	"id_publicacion" integer NOT NULL,
	"id_universidad" integer NOT NULL,
	"distancia" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comentario" (
	"id_comentario" serial PRIMARY KEY NOT NULL,
	"id_usuario" integer NOT NULL,
	"id_publicacion" integer NOT NULL,
	"texto" varchar(1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "etiqueta" (
	"id_etiqueta" serial PRIMARY KEY NOT NULL,
	"nombre_etiqueta" varchar(100) NOT NULL,
	"icono" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publicacion" (
	"id_publicacion" serial PRIMARY KEY NOT NULL,
	"id_publicante" integer NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"foto" varchar(500) NOT NULL,
	"descripcion" varchar(1000) NOT NULL,
	"telefono" varchar(20) NOT NULL,
	"valoracion" real NOT NULL,
	"ciudad_comuna" varchar(100) NOT NULL,
	"calle" varchar(255) NOT NULL,
	"numero" integer NOT NULL,
	"latitud" varchar(50) NOT NULL,
	"longitud" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publicacion_etiqueta" (
	"id_publicacion" integer NOT NULL,
	"id_etiqueta" integer NOT NULL,
	CONSTRAINT "publicacion_etiqueta_id_publicacion_id_etiqueta_pk" PRIMARY KEY("id_publicacion","id_etiqueta")
);
--> statement-breakpoint
CREATE TABLE "universidad" (
	"id_universidad" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"ciudad_comuna" varchar(100) NOT NULL,
	"calle" varchar(255) NOT NULL,
	"numero" varchar(20) NOT NULL,
	"latitud" varchar(50) NOT NULL,
	"longitud" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id_usuario" serial PRIMARY KEY NOT NULL,
	"correo" varchar(255) NOT NULL,
	"contraseña" varchar(255) NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"rol" varchar(50) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_id_usuario_usuario_id_usuario_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id_usuario") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publicacion_etiqueta" ADD CONSTRAINT "publicacion_etiqueta_id_publicacion_publicacion_id_publicacion_fk" FOREIGN KEY ("id_publicacion") REFERENCES "public"."publicacion"("id_publicacion") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publicacion_etiqueta" ADD CONSTRAINT "publicacion_etiqueta_id_etiqueta_etiqueta_id_etiqueta_fk" FOREIGN KEY ("id_etiqueta") REFERENCES "public"."etiqueta"("id_etiqueta") ON DELETE no action ON UPDATE no action;