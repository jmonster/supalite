import me from'postgres';import {PostgresJSDialect}from'kysely-postgres-js';import {Kysely,sql}from'kysely';import {Connection,invariant,RelationNotFoundError}from'@supabase/lite';try {
   /**
    * Adding this to avoid warnings from node:sqlite being experimental
    */
   const { emitWarning } = process;
   process.emitWarning = (warning, ...args) => {
      if (warning.includes("SQLite is an experimental feature")) return;
      return emitWarning(warning, ...args);
   };
} catch {}
var Y=["anon","authenticated","service_role"];function V(a){return a==="service_role"?"NOLOGIN BYPASSRLS":"NOLOGIN"}function Q(a){return a.size===0?"":`DO $$ BEGIN${[...a].map(s=>`
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${s}') THEN
      CREATE ROLE ${s} ${V(s)};
   END IF;`).join("")}
END $$;
`}var k=Q(new Set(Y));function T(a){let e=a.trim();return e.startsWith('"')&&e.endsWith('"')||e.startsWith("`")&&e.endsWith("`")||e.startsWith("[")&&e.endsWith("]")?e.slice(1,-1):e}function Z(a){let e=[],s="",i=0,t=null;for(let o=0;o<a.length;o++){let l=a[o];if(t){s+=l,l===t&&(t=null);continue}if(l==='"'||l==="`"||l==="'"){t=l,s+=l;continue}if(l==="("?i++:l===")"&&i>0&&i--,l===","&&i===0){e.push(s.trim()),s="";continue}s+=l;}return s.trim()&&e.push(s.trim()),e}function X(a){let e=a.match(/^(.*?)\s+as\s+(.+)$/i),s=e?e[1].trim():a.trim(),i=e?e[2].trim():void 0;if(!i){let l=a.match(/^(.+?)\s+((?:"[^"]+"|`[^`]+`|\[[^\]]+\]|\w+))$/);l&&!/[()]/.test(l[1])&&(s=l[1].trim(),i=l[2].trim());}let t=s.split(".").map(T);if(t.length>2)return null;let o=t.at(-1);return !o||!/^[A-Za-z_][\w$]*$/.test(o)?null:{baseColumn:o,viewColumn:i?T(i):o}}function x(a){return !!(a&&/[A-Za-z0-9_$]/.test(a))}function ee(a){let e=/\bselect\b/i.exec(a);if(!e)return null;let s=0,i=null;for(let t=e.index+e[0].length;t<a.length;t++){let o=a[t];if(i){o===i&&(i=null);continue}if(o==='"'||o==="`"||o==="'"){i=o;continue}if(o==="("){s++;continue}if(o===")"&&s>0){s--;continue}if(s===0&&a.slice(t,t+4).toLowerCase()==="from"&&!x(a[t-1])&&!x(a[t+4]))return {selectList:a.slice(e.index+e[0].length,t).trim(),fromRest:a.slice(t+4).trim()}}return null}function te(a){let e=0,s=[];for(;e<a.length;){for(;/\s/.test(a[e]??"");)e++;let i=a[e],t="";if(i==='"'||i==="`"){let r=a.indexOf(i,e+1);if(r===-1)return null;t=a.slice(e,r+1),e=r+1;}else if(i==="["){let r=a.indexOf("]",e+1);if(r===-1)return null;t=a.slice(e,r+1),e=r+1;}else {let r=/^[A-Za-z_][\w$]*/.exec(a.slice(e));if(!r)return null;t=r[0],e+=t.length;}s.push(t);let o=a.slice(e),l=/^\s*\./.exec(o);if(!l)break;e+=l[0].length;}return s.length===0?null:{raw:s.join("."),rest:a.slice(e).trim()}}function v(a,e,s){let i=a.get(e)??[];i.includes(s)||i.push(s),a.set(e,i);}function ne(a,e){if(!a)return null;let s=ee(a);if(!s)return null;let i=te(s.fromRest);if(!i)return null;let{raw:t,rest:o}=i;if(/\b(join|union|intersect|except)\b/i.test(o))return null;let l=t.split(".").map(T).at(-1);if(!l)return null;let r=new Map,c=e.get(l)??new Set;for(let p of Z(s.selectList)){let m=p.trim();if(m==="*"||m.endsWith(".*")){for(let d of c)v(r,d,d);continue}let g=X(p);g&&v(r,g.baseColumn,g.viewColumn);}return r.size===0?null:{baseTable:l,columns:r}}function se(a,e){let s=new Map;for(let[i,t]of e){let o=[];for(let l of t){let r=a.get(l);if(r)for(let c of r)o.includes(c)||o.push(c);}o.length>0&&s.set(i,o);}return s}function ae(a){let e=new Map,s=new Map;for(let r of a.columns??[]){let c=s.get(r.table)??new Set;c.add(r.name),s.set(r.table,c);}let i=(r,c)=>{let p=e.get(r)??[];p.some(m=>m.name===c.name&&m.schema===c.schema)||p.push(c),e.set(r,p);};for(let r of a.tables??[]){if(r.type!=="table")continue;let c=s.get(r.name);c&&i(r.name,{name:r.name,schema:r.schema,columnByBaseColumn:new Map([...c].map(p=>[p,[p]]))});}let t=new Map;for(let r of a.views??[]){let c=ne(r.sql,s);if(!c)continue;let p=s.get(r.name);if(!p)continue;let m=new Map;for(let[d,_]of c.columns){let f=_.filter(h=>p.has(h));f.length>0&&m.set(d,f);}if(m.size===0)continue;let g={name:r.name,schema:r.schema,columnByBaseColumn:m,fromRelation:c.baseTable};t.set(r.name,g);}let o=16;function l(r,c,p){if(c>o)return null;let m=r.fromRelation;if(e.has(m))return {physicalBase:m,columnByBaseColumn:r.columnByBaseColumn};let g=t.get(m);if(!g||p.has(m))return null;p.add(m);let d=l(g,c+1,p);if(p.delete(m),!d)return null;let _=se(r.columnByBaseColumn,d.columnByBaseColumn);return _.size===0?null:{physicalBase:d.physicalBase,columnByBaseColumn:_}}for(let r of t.values()){let c=l(r,0,new Set([r.name]));c&&i(c.physicalBase,{name:r.name,schema:r.schema,columnByBaseColumn:c.columnByBaseColumn});}return e}function B(a){return `${a.foreign_key_group??""}:${a.table}.${a.column}->${a.ref_table}.${a.ref_column}`}function oe(a){let e=new Map;for(let s of a){let i=`${s.schema}.${s.table}.${s.foreign_key_name}.${s.ref_schema??""}.${s.ref_table}`,t=e.get(i);t?t.push(s):e.set(i,[s]);}return [...e.values()]}function ie(a){let e=[[]];for(let s of a){let i=[];for(let t of e)for(let o of s)i.push([...t,o]);e=i;}return e}function re(a,e,s,i){let t=i.map(l=>l.childColumn).join(","),o=i.map(l=>l.parentColumn).join(",");return `${s}:${a.name}(${t})->${e.name}(${o})`}function $(a){if(!a.foreign_keys?.length||!a.views?.length)return a;let e=ae(a),s=new Set(a.foreign_keys.map(B)),i=[];for(let t of oe(a.foreign_keys)){let o=t[0],l=e.get(o.table)??[],r=e.get(o.ref_table)??[];for(let c of l)for(let p of r){if(c.schema!==p.schema)continue;let m=[];for(let g of t){let d=c.columnByBaseColumn.get(g.column)??[],_=p.columnByBaseColumn.get(g.ref_column)??[],f=d.flatMap(h=>_.map(y=>({fk:g,childColumn:h,parentColumn:y})));if(f.length===0){m.length=0;break}m.push(f);}for(let g of ie(m)){let _=c.name===o.table&&p.name===o.ref_table&&g.every(f=>f.childColumn===f.fk.column&&f.parentColumn===f.fk.ref_column)?void 0:re(c,p,o.foreign_key_name,g);for(let f of g){let h={...f.fk,table:c.name,column:f.childColumn,schema:c.schema,ref_table:p.name,ref_column:f.parentColumn,ref_schema:p.schema,foreign_key_group:_},y=B(h);s.has(y)||(s.add(y),i.push(h));}}}}return i.length?{...a,foreign_keys:[...a.foreign_keys,...i]}:a}var A="anon, authenticated, service_role",ue=new Set(["anon","authenticated","service_role"]);function D(a){return `"${a.replace(/"/g,'""')}"`}var S=class extends Error{constructor(s){super("Force rollback");this.result=s;}},O=class extends Connection{dialect="postgres";harnessHoldingOuterTx=false;constructor(e){super({...e,baseSchema:`
            ${e.baseSchema??""}
         
            CREATE SCHEMA IF NOT EXISTS auth;

            -- Function to get current user ID (for RLS policies)
            CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
              SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
            $$ LANGUAGE SQL STABLE;
            
            -- Function to get current user role (for RLS policies)
            CREATE OR REPLACE FUNCTION auth.role() RETURNS TEXT AS $$
              SELECT NULLIF(current_setting('request.jwt.claim.role', true), '');
            $$ LANGUAGE SQL STABLE;
            
            -- Function to get current user email (for RLS policies)
            CREATE OR REPLACE FUNCTION auth.email() RETURNS TEXT AS $$
              SELECT NULLIF(current_setting('request.jwt.claim.email', true), '');
            $$ LANGUAGE SQL STABLE;
            
            -- Function to get JWT claims (for RLS policies)
            CREATE OR REPLACE FUNCTION auth.jwt() RETURNS JSONB AS $$
              SELECT COALESCE(
                NULLIF(current_setting('request.jwt.claims', true), ''),
                '{}'
              )::jsonb;
            $$ LANGUAGE SQL STABLE;
         `});}async introspect(e){invariant(typeof e=="object"||e===void 0,"options must be an object");let s=e?.useCache??false,i=await this.readCachedIntrospection({useCache:s});if(i)return i;try{let t=await sql`
            SELECT
               tbls.table_name AS "name",
               tbls.table_schema AS "schema",
               tbls.table_type AS "type",
               COALESCE(s.n_live_tup, 0) AS "rows"
            FROM information_schema.tables tbls
               LEFT JOIN pg_stat_user_tables s
                         ON tbls.table_schema = s.schemaname AND tbls.table_name = s.relname
            WHERE
               tbls.table_schema NOT IN ('information_schema', 'pg_catalog')
               AND tbls.table_type IN ('BASE TABLE', 'FOREIGN TABLE')
               -- Individual partitions are hidden from the relation cache (like PostgREST):
               -- direct access -> PGRST205, embedding -> PGRST200. The partitioned parent
               -- (relkind 'p', relispartition = false) stays exposed.
               AND NOT EXISTS (
                  SELECT 1
                  FROM pg_catalog.pg_class pc
                     JOIN pg_catalog.pg_namespace pn ON pn.oid = pc.relnamespace
                  WHERE pc.relname = tbls.table_name
                     AND pn.nspname = tbls.table_schema
                     AND pc.relispartition
               )
            ORDER BY tbls.table_schema, tbls.table_name
         `.execute(this.kysely),o=await sql`
            SELECT
               mv.schemaname AS "schema",
               mv.matviewname AS "name",
               mv.definition  AS "sql"
            FROM pg_catalog.pg_matviews mv
            WHERE mv.schemaname NOT IN ('information_schema', 'pg_catalog')
            ORDER BY mv.schemaname, mv.matviewname
         `.execute(this.kysely),l=await sql`
            SELECT
               n.nspname          AS "schema",
               c.relname          AS "table",
               a.attname          AS "name",
               a.attnum           AS "ordinal_position",
               format_type(a.atttypid, a.atttypmod) AS "type",
               NOT a.attnotnull   AS "nullable",
               pg_get_expr(d.adbin, d.adrelid) AS "default_value"
            FROM pg_catalog.pg_class c
               JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
               JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
               LEFT JOIN pg_catalog.pg_attrdef d
                         ON d.adrelid = c.oid AND d.adnum = a.attnum
            WHERE
               c.relkind = 'm'
               AND n.nspname NOT IN ('information_schema', 'pg_catalog')
               AND a.attnum > 0
               AND NOT a.attisdropped
            ORDER BY n.nspname, c.relname, a.attnum
         `.execute(this.kysely),r=t.rows.map(n=>({name:n.name,schema:n.schema,type:"table",rows:Number(n.rows),sql:"",engine:"",collation:""}));for(let n of o.rows)r.push({name:n.name,schema:n.schema,type:"table",rows:0,sql:"",engine:"",collation:""});let p=(await sql`
            SELECT
               cols.table_name AS "table",
               cols.table_schema AS "schema",
               cols.column_name AS "name",
               cols.ordinal_position AS "ordinal_position",
               CASE
                  WHEN cols.column_default IS NOT NULL AND cols.column_default LIKE 'nextval(%' THEN
                     CASE
                        WHEN LOWER(cols.data_type) = 'smallint' THEN 'smallserial'
                        WHEN LOWER(cols.data_type) = 'integer' THEN 'serial'
                        WHEN LOWER(cols.data_type) = 'bigint' THEN 'bigserial'
                        ELSE LOWER(cols.data_type)
                        END
                  WHEN cols.data_type = 'ARRAY' THEN format_type(pt.typelem, NULL)
                  WHEN LOWER(cols.data_type) = 'user-defined' THEN format_type(pt.oid, NULL)
                  ELSE LOWER(cols.data_type)
                  END AS "type",
               CASE WHEN cols.is_nullable = 'YES' THEN true ELSE false END AS "nullable",
               CASE
                  WHEN cols.column_default IS NOT NULL AND cols.column_default LIKE 'nextval(%'
                     THEN NULL
                  ELSE cols.column_default
                  END AS "default_value",
               cols.character_maximum_length::text AS "character_maximum_length", CASE
                                                                                     WHEN cols.data_type IN ('numeric', 'decimal')
                                                                                        THEN
                                                                                        json_build_object(
                                                                                           'precision',
                                                                                           cols.numeric_precision,
                                                                                           'scale',
                                                                                           cols.numeric_scale)
                                                                                     ELSE NULL
               END AS "precision",
               CASE
                  WHEN cols.is_identity = 'YES' THEN true
                  WHEN cols.column_default IS NOT NULL AND cols.column_default LIKE 'nextval(%'
                     THEN true
                  ELSE false
                  END AS "is_identity",
               COALESCE(cols.collation_name, '') AS "collation",
               cols.udt_name AS "udt_name",
               cols.udt_schema AS "udt_schema",
               CASE WHEN pt.typtype = 'd' THEN pt.typname ELSE cols.udt_name END AS "domain_type",
               CASE WHEN cols.is_generated = 'NEVER' THEN false ELSE true END AS "is_generated"
            FROM information_schema.columns cols
               LEFT JOIN pg_catalog.pg_class c ON c.relname = cols.table_name
               JOIN pg_catalog.pg_namespace n
                    ON n.oid = c.relnamespace AND n.nspname = cols.table_schema
               LEFT JOIN pg_catalog.pg_attribute attr
                         ON attr.attrelid = c.oid AND attr.attname = cols.column_name
               LEFT JOIN pg_catalog.pg_type pt ON pt.oid = attr.atttypid
            WHERE cols.table_schema NOT IN ('information_schema', 'pg_catalog')
            ORDER BY cols.table_schema, cols.table_name, cols.ordinal_position
         `.execute(this.kysely)).rows.map(n=>({table:n.table,schema:n.schema,name:n.name,type:n.type,nullable:n.nullable,default_value:n.default_value,is_primary_key:!1,ordinal_position:Number(n.ordinal_position),character_maximum_length:n.character_maximum_length??null,precision:n.precision??null,is_identity:n.is_identity,collation:n.collation,pg_type:n.domain_type??n.udt_name??void 0,udt_schema:n.udt_schema??void 0,is_generated:n.is_generated??!1}));for(let n of l.rows)p.push({table:n.table,schema:n.schema,name:n.name,type:n.type??"",nullable:n.nullable??!0,default_value:n.default_value??null,is_primary_key:!1,ordinal_position:Number(n.ordinal_position),character_maximum_length:null,precision:null,is_identity:!1,collation:"",pg_type:void 0,udt_schema:void 0,is_generated:!1});let g=(await sql`
            SELECT
               ns.nspname AS "schema",
               cl.relname AS "table",
               att.attname AS "column",
               nr.nspname AS "ref_schema",
               ref_cl.relname AS "ref_table",
               ref_att.attname AS "ref_column",
               con.conname AS "foreign_key_name",
               pg_get_constraintdef(con.oid) AS "fk_def"
            FROM pg_constraint con
               JOIN pg_class cl ON cl.oid = con.conrelid
               JOIN pg_namespace ns ON ns.oid = cl.relnamespace
               JOIN pg_class ref_cl ON ref_cl.oid = con.confrelid
               JOIN pg_namespace nr ON nr.oid = ref_cl.relnamespace
               CROSS JOIN LATERAL unnest(con.conkey, con.confkey) WITH ORDINALITY AS cols(conkey_num, confkey_num, ord)
            JOIN pg_attribute att
            ON att.attrelid = con.conrelid AND att.attnum = cols.conkey_num
               JOIN pg_attribute ref_att ON ref_att.attrelid = con.confrelid AND ref_att.attnum = cols.confkey_num
            WHERE
               con.contype = 'f'
               AND ns.nspname NOT IN (
               'information_schema'
               , 'pg_catalog')
               -- Skip FK rows on/to individual partitions (partition-level copies of an
               -- inherited FK). Keeps the partitioned parent's FK; prevents a partition
               -- surfacing as a spurious embed candidate.
               AND NOT cl.relispartition
               AND NOT ref_cl.relispartition
            ORDER BY ns.nspname, cl.relname, con.conname, cols.ord
         `.execute(this.kysely)).rows.map(n=>({table:n.table,column:n.column,schema:n.schema,ref_table:n.ref_table,ref_column:n.ref_column,foreign_key_name:n.foreign_key_name,fk_def:n.fk_def,on_update:"",on_delete:""})),_=(await sql`
            SELECT
               ns.nspname AS "schema",
               cl.relname AS "table",
               array_agg(att.attname ORDER BY cols.ord) AS "columns"
            FROM pg_constraint con
               JOIN pg_class cl ON cl.oid = con.conrelid
               JOIN pg_namespace ns ON ns.oid = cl.relnamespace
               CROSS JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS cols(attnum, ord)
            JOIN pg_attribute att
            ON att.attrelid = con.conrelid AND att.attnum = cols.attnum
            WHERE
               con.contype = 'p'
               AND ns.nspname NOT IN (
               'information_schema'
               , 'pg_catalog')
            GROUP BY ns.nspname, cl.relname, con.oid
         `.execute(this.kysely)).rows.map(n=>({table:n.table,columns:n.columns,schema:n.schema,field_count:n.columns.length})),f=new Set(_.flatMap(n=>n.columns.map(N=>`${n.schema}.${n.table}.${N}`)));for(let n of p)n.is_primary_key=f.has(`${n.schema}.${n.table}.${n.name}`);let y=(await sql`
            SELECT
               tnsp.nspname AS "schema",
               cl.relname AS "table",
               ic.relname AS "name",
               idx.indisunique AS "unique",
               array_agg(att.attname ORDER BY a.ord) AS "columns"
            FROM pg_index idx
               JOIN pg_class cl ON cl.oid = idx.indrelid
               JOIN pg_namespace tnsp ON cl.relnamespace = tnsp.oid
               JOIN pg_class ic ON ic.oid = idx.indexrelid
               CROSS JOIN LATERAL unnest(idx.indkey) WITH ORDINALITY AS a(attnum, ord)
            JOIN pg_attribute att
            ON att.attrelid = cl.oid AND att.attnum = a.attnum
            WHERE
               idx.indisunique = true
               AND NOT idx.indisprimary
               AND tnsp.nspname NOT IN (
               'information_schema'
               , 'pg_catalog')
            GROUP BY tnsp.nspname, cl.relname, ic.relname, idx.indisunique
         `.execute(this.kysely)).rows.map(n=>({table:n.table,name:n.name,unique:n.unique,columns:n.columns,schema:n.schema})),C=(await sql`
            SELECT
               views.schemaname AS "schema",
               views.viewname AS "name",
               views.definition AS "sql"
            FROM pg_views views
            WHERE views.schemaname NOT IN ('information_schema', 'pg_catalog')
            ORDER BY views.schemaname, views.viewname
         `.execute(this.kysely)).rows.map(n=>({name:n.name,schema:n.schema,sql:n.sql??""}));for(let n of o.rows)C.push({name:n.name,schema:n.schema,sql:n.sql??""});let F=(await sql`
            SELECT
               n.nspname AS "schema",
               cl.relname AS "table",
               substring(pg_get_constraintdef(c.oid) FROM 'CHECK \\((.*)\\)') AS "expression"
            FROM pg_constraint c
               JOIN pg_class cl ON cl.oid = c.conrelid
               JOIN pg_namespace n ON n.oid = cl.relnamespace
            WHERE
               c.contype = 'c'
               AND n.nspname NOT IN ('information_schema', 'pg_catalog')
            ORDER BY n.nspname, cl.relname
         `.execute(this.kysely)).rows.map(n=>({schema:n.schema,table:n.table,expression:n.expression??""})),H=(await sql`
            SELECT
               n.nspname AS "schema",
               cl.relname AS "table",
               c.conname AS "name",
               array_agg(att.attname ORDER BY cols.ord) AS "columns"
            FROM pg_constraint c
               JOIN pg_class cl ON cl.oid = c.conrelid
               JOIN pg_namespace n ON n.oid = cl.relnamespace
               CROSS JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS cols(attnum, ord)
               JOIN pg_attribute att ON att.attrelid = c.conrelid AND att.attnum = cols.attnum
            WHERE
               c.contype = 'u'
               AND n.nspname NOT IN ('information_schema', 'pg_catalog')
            GROUP BY n.nspname, cl.relname, c.conname, c.oid
         `.execute(this.kysely)).rows.map(n=>({schema:n.schema,table:n.table,name:n.name,columns:n.columns})),J=(await sql`
            SELECT
               n.nspname AS "schema",
               cl.relname AS "table",
               att.attname AS "column",
               d.description AS "text"
            FROM pg_description d
               JOIN pg_class cl ON cl.oid = d.objoid
               JOIN pg_namespace n ON n.oid = cl.relnamespace
               LEFT JOIN pg_attribute att
                         ON att.attrelid = cl.oid AND att.attnum = d.objsubid AND d.objsubid > 0
            WHERE
               n.nspname NOT IN ('information_schema', 'pg_catalog')
               AND cl.relkind IN ('r', 'v', 'm', 'f', 'p')
               AND d.description IS NOT NULL
         `.execute(this.kysely)).rows.map(n=>({schema:n.schema,table:n.table,column:n.column??void 0,text:n.text})),M=await sql`
            SELECT
               n.nspname AS "schema",
               t.typname AS "type",
               'enum' AS "kind",
               array_agg(e.enumlabel ORDER BY e.enumsortorder) AS "values"
            FROM pg_type t
               JOIN pg_enum e ON t.oid = e.enumtypid
               JOIN pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
            GROUP BY n.nspname, t.typname
         `.execute(this.kysely),U=await sql`
            SELECT
               n.nspname AS "schema",
               t.typname AS "type",
               'composite' AS "kind",
               json_agg(json_build_object(
                  'name',
                  a.attname,
                  'type',
                  format_type(a.atttypid, a.atttypmod)) ORDER BY a.attnum
               ) AS "fields"
            FROM pg_type t
               JOIN pg_namespace n ON n.oid = t.typnamespace
               JOIN pg_class c ON c.oid = t.typrelid
               JOIN pg_attribute a ON a.attrelid = c.oid
            WHERE
               t.typtype = 'c'
               AND c.relkind = 'c'
               AND a.attnum > 0
               AND NOT a.attisdropped
               AND n.nspname NOT IN ('pg_catalog', 'information_schema')
            GROUP BY n.nspname, t.typname
         `.execute(this.kysely),P=[...M.rows.map(n=>({schema:n.schema,type:n.type,kind:"enum",values:n.values})),...U.rows.map(n=>({schema:n.schema,type:n.type,kind:"composite",fields:n.fields}))],W=(await sql`
            SELECT
               n.nspname AS "schema",
               p.proname AS "name",
               p.proargnames AS "arg_names_raw",
               p.proargmodes::text[] AS "arg_modes_raw",
               p.pronargdefaults AS "arg_defaults",
               p.provariadic <> 0 AS "has_variadic",
               p.provolatile AS "volatility",
               p.proretset AS "return_is_setof",
               p.prorows AS "return_rows",
               format_type(p.prorettype, NULL) AS "return_type",
               rt.typtype AS "return_typtype",
               CASE WHEN rt.typtype = 'd' AND rt.typbasetype <> 0
                  THEN format_type(rt.typbasetype, NULL) END AS "return_base_type",
               (SELECT array_agg(format_type(t, NULL) ORDER BY ord)
                  FROM unnest(p.proargtypes) WITH ORDINALITY AS at(t, ord)) AS "arg_types_raw"
            FROM pg_proc p
               JOIN pg_namespace n ON n.oid = p.pronamespace
               LEFT JOIN pg_type rt ON rt.oid = p.prorettype
            WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
               AND p.prokind = 'f'
            ORDER BY n.nspname, p.proname
         `.execute(this.kysely)).rows.map(n=>{let N=n.arg_names_raw??[],E=n.arg_modes_raw??null,q=E&&E.length===N.length?N.filter((R,w)=>E[w]==="i"||E[w]==="b"||E[w]==="v"):N,z=!!E?.some(R=>R==="o"||R==="b"||R==="t");return {schema:n.schema,name:n.name,arg_names:q,arg_types:n.arg_types_raw??[],arg_defaults:Number(n.arg_defaults??0),has_variadic:n.has_variadic===!0,volatility:n.volatility??"v",return_type:n.return_type??"",return_is_setof:n.return_is_setof===!0,return_rows:Number(n.return_rows??0),return_typtype:n.return_typtype??"",return_base_type:n.return_base_type??void 0,has_out_args:z}}),G=(await sql`
            SELECT
               c.relname AS "name",
               n.nspname AS "schema",
               p.relname AS "parent"
            FROM pg_catalog.pg_inherits i
               JOIN pg_catalog.pg_class c ON c.oid = i.inhrelid AND c.relispartition
               JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
               JOIN pg_catalog.pg_class p ON p.oid = i.inhparent
            WHERE n.nspname NOT IN ('information_schema', 'pg_catalog')
         `.execute(this.kysely)).rows.map(n=>({name:n.name,schema:n.schema,parent:n.parent})),j=(await sql`SELECT name FROM pg_catalog.pg_timezone_names`.execute(this.kysely)).rows.map(n=>n.name),K=(await sql`SELECT current_database() AS "name"`.execute(this.kysely)).rows[0]?.name??"postgres",I=$({tables:r,columns:p,indexes:y,foreign_keys:g,primary_keys:_,views:C,triggers:[],functions:W,check_constraints:F,unique_constraints:H,comments:J,custom_types:P,partitions:G,database_name:K,version:"",default_schema:"public",timezones:j});return await this.writeCachedIntrospection(I,{useDriver:s}),I}catch(t){return console.error("Introspection failed:",t),{tables:[],columns:[],indexes:[],foreign_keys:[],primary_keys:[],views:[],triggers:[],check_constraints:[],unique_constraints:[],comments:[],custom_types:[],database_name:"postgres",version:""}}}rlsState="unknown";async ensureRlsContext(){if(this.rlsState!=="unknown")return this.rlsState==="active";let e=await sql`
         SELECT count(*) ::text as count FROM pg_class WHERE relrowsecurity = true
      `.execute(this.kysely);if(!(Number(e.rows[0]?.count??0)>0))return this.rlsState="inactive",false;this.rlsState="active",await sql.raw(k).execute(this.kysely);let i=await sql`
         SELECT DISTINCT n.nspname FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE c.relrowsecurity = true
      `.execute(this.kysely);for(let{nspname:t}of i.rows){let o=D(t);await sql.raw(`GRANT USAGE ON SCHEMA ${o} TO ${A}`).execute(this.kysely),await sql.raw(`GRANT ALL ON ALL TABLES IN SCHEMA ${o} TO ${A}`).execute(this.kysely),await sql.raw(`GRANT ALL ON ALL SEQUENCES IN SCHEMA ${o} TO ${A}`).execute(this.kysely),await sql.raw(`ALTER DEFAULT PRIVILEGES IN SCHEMA ${o} GRANT ALL ON TABLES TO ${A}`).execute(this.kysely),await sql.raw(`ALTER DEFAULT PRIVILEGES IN SCHEMA ${o} GRANT ALL ON SEQUENCES TO ${A}`).execute(this.kysely);}return  true}async postgresTransactionActive(e){try{return await sql`SAVEPOINT __supalite_outer_tx_check`.execute(e),await sql`RELEASE SAVEPOINT __supalite_outer_tx_check`.execute(e),!0}catch{return  false}}async applyJwtSessionContext(e,s,i){let t=s.auth,o=t?.role||"anon",l=String(t?.uid??""),r=t?.jwt,c=s.storage?.operation;await sql`SELECT set_config('role', ${o}, true)`.execute(e),await sql`SELECT set_config('request.jwt.claim.sub', ${l}, true)`.execute(e),await sql`SELECT set_config('request.jwt.claim.role', ${o}, true)`.execute(e),await sql`SELECT set_config('storage.operation', ${String(c??"")}, true)`.execute(e),i&&await sql.raw(`SET LOCAL ROLE ${D(o)}`).execute(e),r&&typeof r=="object"&&await sql`SELECT set_config('request.jwt.claims', ${JSON.stringify(r)}, true)`.execute(e);}async applyRpcRequestGucs(e,s){await sql`SELECT set_config('response.status', '', true)`.execute(e),await sql`SELECT set_config('response.headers', '', true)`.execute(e),await sql`SELECT set_config('request.method', ${s.method}, true)`.execute(e),await sql`SELECT set_config('request.path', ${s.path}, true)`.execute(e),await sql`SELECT set_config('request.headers', ${JSON.stringify(s.requestHeaders??{})}, true)`.execute(e);}async withContext(e,s,i){let t=i?.forceRollback===true;if(!t&&!e)return s(this.kysely);let o=e?await this.ensureRlsContext():false,r=e?.auth?.role||"anon",c=typeof r=="string"&&/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(r)&&!ue.has(r);if(i?.transaction){if(t)throw new Error("Cannot force rollback an existing transaction");return e&&(o||c)&&await this.applyJwtSessionContext(i.transaction,e,c),s(i.transaction)}let p=i?.rpc;if(p){let m=async g=>{e&&(o||c)&&await this.applyJwtSessionContext(g,e,c),await this.applyRpcRequestGucs(g,p),p.readOnly&&await sql`SET LOCAL transaction_read_only = on`.execute(g);};if(this.harnessHoldingOuterTx)return invariant(await this.postgresTransactionActive(this.kysely),"harnessHoldingOuterTx is set but the connection has no open PostgreSQL transaction; wrap REST requests in BEGIN/ROLLBACK in the spec harness"),await m(this.kysely),s(this.kysely);try{return await this.kysely.transaction().execute(async g=>{await m(g);let d=await s(g);if(t)throw new S(d);return d})}catch(g){if(g instanceof S)return g.result;throw g}}if(!t&&!o&&!c)return s(this.kysely);if(!t&&c)return this.harnessHoldingOuterTx?(invariant(await this.postgresTransactionActive(this.kysely),"harnessHoldingOuterTx is set but the connection has no open PostgreSQL transaction; wrap REST requests in BEGIN/ROLLBACK in the spec harness"),await this.applyJwtSessionContext(this.kysely,e,true),s(this.kysely)):this.kysely.transaction().execute(async m=>(await this.applyJwtSessionContext(m,e,true),s(m)));if(!t&&o&&!c)return this.kysely.transaction().execute(async m=>(await this.applyJwtSessionContext(m,e,true),s(m)));try{return await this.kysely.transaction().execute(async m=>{e&&(o||c)&&await this.applyJwtSessionContext(m,e,c);let g=await s(m);if(t)throw new S(g);return g})}catch(m){if(m instanceof S)return m.result;throw m}}async onPostgrestAST(e){if(!e.from)return e;let s=e.schema??"public",i=e.from,t=await this.introspect({useCache:true});if(!t.tables.some(o=>o.name===i&&o.schema===s)&&!t.views.some(o=>o.name===i&&o.schema===s))throw new RelationNotFoundError(s,i);return e}async transaction(e,s){await this.exec("BEGIN");try{for(let i of e)await this.exec(i);await this.exec("COMMIT");}catch(i){throw await this.exec("ROLLBACK"),i}finally{s?.intent==="migration"&&await this.clearSchemaCache();}}get supportsRpc(){return  true}async viewOptionsMetadata(e,s){let{rows:i}=await sql`
         select is_insertable_into, is_updatable,
                is_trigger_insertable_into, is_trigger_updatable, is_trigger_deletable
         from information_schema.views
         where table_schema = ${s} and table_name = ${e}
      `.execute(this.kysely),t=i[0],o=r=>r==="YES",{rows:l}=await sql`
         select table_schema, table_name from information_schema.view_table_usage
         where view_schema = ${s} and view_name = ${e}
      `.execute(this.kysely);return {canInsert:o(t?.is_insertable_into)||o(t?.is_trigger_insertable_into),canUpdate:o(t?.is_updatable)||o(t?.is_trigger_updatable),canDelete:o(t?.is_updatable)||o(t?.is_trigger_deletable),baseTables:l.map(r=>({schema:r.table_schema,name:r.table_name}))}}};var fe=['schema "supabase_migrations" already exists','relation "schema_migrations" already exists','relation "seed_files" already exists'];function de(a){fe.some(e=>a.message.includes(e))||console.error(`${a.severity} (${a.code}): ${a.message}`);}var L=class extends O{driver;dialect="postgres";constructor(e){super(e);let{postgresOptions:s}=e;this.driver=me(e.url??"",{onnotice:de,...s,connection:{TimeZone:"UTC",...s?.connection},types:{bigint:{to:20,from:[20],serialize:t=>t.toString(),parse:t=>{let o=Number(t);return Number.isSafeInteger(o)?o:BigInt(t)}},json:{to:114,from:[114],serialize:t=>JSON.stringify(t),parse:t=>JSON.parse(t)},jsonb:{to:3802,from:[3802],serialize:t=>JSON.stringify(t),parse:t=>JSON.parse(t)},numeric:{to:1700,from:[1700],serialize:t=>String(t),parse:t=>{let o=Number(t);return Number.isFinite(o)&&String(o)===t?o:t}},date:{to:1082,from:[1082],serialize:t=>t,parse:t=>t},time:{to:1083,from:[1083],serialize:t=>t,parse:t=>t},timestamp:{to:1114,from:[1114],serialize:t=>t,parse:t=>t},timestamptz:{to:1184,from:[1184],serialize:t=>t,parse:t=>t},timetz:{to:1266,from:[1266],serialize:t=>t,parse:t=>t},...s?.types}});let i=new PostgresJSDialect({postgres:this.driver});this.kysely=new Kysely({dialect:i});}async close(){await this.driver.end();}};function $e(a){return new L(a)}export{L as PostgresConnection,$e as createPostgresConnection};